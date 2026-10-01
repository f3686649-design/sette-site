<?php
/** Same-origin lead intake. Configure SETTE_CONFIG_FILE outside the document root. */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
function reply(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST'); reply(405, ['ok' => false, 'error' => 'method']);
}
$path = getenv('SETTE_CONFIG_FILE') ?: __DIR__ . '/../../private/sette-config.php';
$cfg = is_file($path) ? include $path : [];
if (!is_array($cfg)) $cfg = [];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $cfg['origins'] ?? ['https://sette.su', 'https://www.sette.su'];
if (!in_array($origin, $allowed, true) || !in_array($_SERVER['HTTP_SEC_FETCH_SITE'] ?? 'same-origin', ['same-origin', 'none'], true)) {
    reply(403, ['ok' => false, 'error' => 'origin']);
}
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
    reply(415, ['ok' => false, 'error' => 'content_type']);
}
$raw = file_get_contents('php://input', false, null, 0, 8193);
if (strlen($raw) > 8192) reply(413, ['ok' => false, 'error' => 'size']);
$in = json_decode($raw, true);
if (!is_array($in)) reply(400, ['ok' => false, 'error' => 'json']);
if (!empty($in['hp_field'])) reply(200, ['ok' => true]);
if (!function_exists('mb_substr') || !function_exists('curl_init')) reply(503, ['ok' => false, 'error' => 'config']);
$webhook = $cfg['webhook'] ?? '';
$parts = is_string($webhook) ? parse_url($webhook) : false;
// HTTPS is required; secrets never reach the client or error output.
if (!$parts || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) ||
    empty($cfg['salt']) || strlen($cfg['salt']) < 32 || empty($cfg['storage']) ||
    empty($cfg['consent_version'])) {
    reply(503, ['ok' => false, 'error' => 'config']);
}
$storage = rtrim($cfg['storage'], '/\\');
if (!is_dir($storage) && !@mkdir($storage, 0700, true)) reply(503, ['ok' => false, 'error' => 'storage']);
$resolved = realpath($storage);
$webroot = realpath($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__));
$norm = fn($p) => strtolower(str_replace('\\', '/', $p));
if (!$resolved || !$webroot || $norm($resolved) === $norm($webroot) || strpos($norm($resolved).'/', $norm($webroot).'/') === 0) {
    reply(503, ['ok' => false, 'error' => 'storage']);
}
function clean($value, int $limit): string {
    return is_string($value) ? trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', mb_substr($value, 0, $limit)) ?? '') : '';
}
$name = clean($in['name'] ?? '', 100);
$digits = preg_replace('/\D/', '', clean($in['phone'] ?? '', 30));
if (strlen($digits) === 10) $digits = '7'.$digits;
if (strlen($digits) === 11 && $digits[0] === '8') $digits = '7'.substr($digits, 1);
$consent = ($in['consent'] ?? false) === true;
$ads = ($in['ads'] ?? false) === true;
if (mb_strlen($name) < 2 || !preg_match('/^7\d{10}$/', $digits) || !$consent ||
    ($in['consent_version'] ?? '') !== $cfg['consent_version'] ||
    ($ads && (empty($cfg['ads_consent_version']) || ($in['ads_consent_version'] ?? '') !== $cfg['ads_consent_version']))) {
    reply(422, ['ok' => false, 'error' => 'validation']);
}
$phone = '+'.$digits;
$rooms = implode(', ', array_intersect(['Студия', '1-комнатная', '2-комнатная', '3-комнатная', '4+ комнаты'], array_map('trim', explode(',', clean($in['rooms'] ?? '', 200))))) ?: 'не указано';
$complex = in_array($in['complex'] ?? '', ['Любой','Прайм','Гастелло','Сосновый бор'], true) ? $in['complex'] : 'Любой';
$ip = filter_var($_SERVER['REMOTE_ADDR'] ?? '', FILTER_VALIDATE_IP) ?: 'unknown';
// Lock the complete read/modify/write operation to avoid concurrent-request races.
function locked(string $path) {
    $file = @fopen($path, 'c+');
    if (!$file || !flock($file, LOCK_EX)) reply(503, ['ok' => false, 'error' => 'storage']);
    @chmod($path, 0600);
    return $file;
}
function save($file, array $data): void {
    rewind($file); ftruncate($file, 0);
    if (fwrite($file, json_encode($data)) === false || !fflush($file)) reply(503, ['ok' => false, 'error' => 'storage']);
}
$rate = locked($storage.'/rate-'.hash_hmac('sha256', $ip, $cfg['salt']).'.json');
$hits = json_decode(stream_get_contents($rate), true);
$hits = array_values(array_filter(is_array($hits) ? $hits : [], fn($t) => is_int($t) && $t > time()-600));
if (count($hits) >= 5) { header('Retry-After: 600'); reply(429, ['ok' => false, 'error' => 'rate']); }
$hits[] = time(); save($rate, $hits); fclose($rate);
$hash = hash_hmac('sha256', $phone, $cfg['salt']);
$dedup = locked($storage.'/lead-'.$hash.'.json');
$previous = json_decode(stream_get_contents($dedup), true);
if (is_array($previous) && ($previous['sent_at'] ?? 0) > time()-600 && !empty($previous['lead_id'])) {
    reply(200, ['ok' => true, 'duplicate' => true]);
}
$when = gmdate('c');
$page = clean($in['page'] ?? '', 300);
$comment = "Квартира: {$rooms}\nЖК: {$complex}\nСогласие на обработку данных: да\nВерсия: {$cfg['consent_version']}\nДата: {$when}\nСогласие на рекламу: ".($ads ? 'да' : 'нет')."\nСтраница: {$page}";
$fields = [
    'TITLE' => "Заявка с сайта СЭТТЭ: {$name} · {$complex}",
    'NAME' => $name, 'PHONE' => [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']],
    'SOURCE_ID' => 'WEB', 'SOURCE_DESCRIPTION' => 'Форма «Подобрать квартиру»',
    'COMMENTS' => htmlspecialchars($comment, ENT_QUOTES, 'UTF-8'),
];
foreach (['source','medium','campaign','content','term'] as $key) $fields['UTM_'.strtoupper($key)] = clean($in['utm_'.$key] ?? '', 100);
// Write consent before attempting delivery. No plaintext name/phone in the journal.
$journal = @fopen($storage.'/consent.log', 'ab');
if (!$journal) reply(503, ['ok' => false, 'error' => 'storage']);
@chmod($storage.'/consent.log', 0600);
$record = ['ts'=>$when, 'phone_hash'=>$hash, 'consent_version'=>$cfg['consent_version'], 'ads'=>$ads,
    'ads_consent_version'=>$ads ? $cfg['ads_consent_version'] : '', 'ip'=>$ip,
    'ua'=>clean($_SERVER['HTTP_USER_AGENT'] ?? '',300), 'cookie_choice'=>clean($in['cookie_choice'] ?? '',20)];
if (!flock($journal, LOCK_EX) || fwrite($journal, json_encode($record, JSON_UNESCAPED_UNICODE).PHP_EOL) === false || !fflush($journal)) {
    reply(503, ['ok' => false, 'error' => 'storage']);
}
fclose($journal);
$ch = curl_init(rtrim($webhook, '/').'/crm.lead.add.json');
curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_RETURNTRANSFER=>true, CURLOPT_CONNECTTIMEOUT=>4,
    CURLOPT_TIMEOUT=>10, CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>2,
    CURLOPT_FOLLOWLOCATION=>false, CURLOPT_HTTPHEADER=>['Content-Type: application/json'],
    CURLOPT_POSTFIELDS=>json_encode(['fields'=>$fields, 'params'=>['REGISTER_SONET_EVENT'=>'Y']], JSON_UNESCAPED_UNICODE)]);
$res = curl_exec($ch); $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$out = is_string($res) ? json_decode($res, true) : null;
if ($status !== 200 || !is_array($out) || empty($out['result']) || !is_numeric($out['result'])) {
    // No dedup success marker on failure; allow a later retry. Never silently switch destination.
    error_log('sette lead: CRM delivery failed, HTTP '.$status);
    reply(502, ['ok'=>false, 'error'=>'crm']);
}
save($dedup, ['sent_at'=>time(), 'lead_id'=>(int)$out['result']]);
fclose($dedup);
reply(200, ['ok'=>true]);
