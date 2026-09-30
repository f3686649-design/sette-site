<?php
/**
 * Приём заявки с сайта → лид в Битрикс24 (CRM). Шаблон для реального сервера (PHP 8.1+).
 *
 * Зачем сервер, а не прямой вызов из браузера: входящий вебхук Битрикс24 — это секрет.
 * В JS его класть нельзя: любой сможет создавать лиды и читать CRM в пределах прав вебхука.
 *
 * Настройка:
 *  1. В Битрикс24: Разработчикам → Другое → Входящий вебхук, права: crm. Скопировать URL вида
 *     https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/xxxxxxxxxxxxxxxx/
 *  2. Создать файл настроек ВНЕ веб-корня (например /home/USER/private/sette-config.php):
 *       <?php return [
 *         'webhook' => 'https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/КЛЮЧ/',
 *         'origins' => ['https://sette.su', 'https://www.sette.su'],   // схема + домен, без слэша
 *         'log'     => '/home/USER/private/consent.log',               // журнал согласий — вне веб-корня
 *         'salt'    => 'длинная случайная строка',                     // для хэша телефона в журнале
 *         'trusted_proxies' => [],                                     // IP прокси/CDN, чьему X-Forwarded-For верим
 *       ];
 *     и указать путь к нему в CONFIG_FILE ниже.
 *  3. В app.js указать SUBMIT_URL = 'api/lead.php'.
 *  4. Проверить после деплоя: `curl -si https://ДОМЕН/api/lead.php | head -3` → 405 и {"ok":false,"error":"method"}
 *     (а не исходник файла); затем отправить тестовую заявку и убедиться, что лид появился в CRM.
 *
 * Согласия: вместе с лидом сохраняются дата/время, IP, User-Agent, версии текстов согласий и ID лида —
 * доказательство по ч. 3 ст. 9 152-ФЗ. Имя и телефон в журнал не пишутся (телефон — хэшем): они уже в CRM.
 */

const CONFIG_FILE = __DIR__ . '/../../private/sette-config.php';   // поправить под структуру хостинга
const SALES_EMAIL = 'otdelprodazh-sette@mail.ru';                   // резервный канал, если CRM не настроена
const SOURCE_ID   = 'WEB';                                          // источник лида (CRM → Справочники → Источники)
const CONSENT_VERSION_DEFAULT = '0.1';

$cfg = is_file(CONFIG_FILE) ? (include CONFIG_FILE) : [];
$cfg = is_array($cfg) ? $cfg : [];
define('BITRIX_WEBHOOK', $cfg['webhook'] ?? (getenv('BITRIX_WEBHOOK') ?: ''));
define('LOG_FILE', $cfg['log'] ?? (getenv('SETTE_CONSENT_LOG') ?: dirname($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)) . '/private/consent.log'));

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
$reply = function (int $code, array $body): void { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; };

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Allow: POST'); $reply(405, ['ok' => false, 'error' => 'method']); }

// Только со своего сайта: браузер всегда шлёт Origin для POST fetch, поэтому пустой Origin — отказ.
$allowed = array_values(array_filter(array_map(fn ($o) => rtrim((string)$o, '/'), $cfg['origins'] ?? []), fn ($o) => $o !== ''));
$origin = rtrim((string)($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
$site = (string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
if ($allowed && ($origin === '' || !in_array($origin, $allowed, true) || ($site !== '' && $site !== 'same-origin'))) {
    $reply(403, ['ok' => false, 'error' => 'origin']);
}

$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) { $reply(400, ['ok' => false, 'error' => 'json']); }

// Ловушка для ботов — до любой валидации, чтобы бот не понял, что его отсеяли.
if (!empty($in['hp_field'])) { $reply(200, ['ok' => true]); }

// IP: X-Forwarded-For — только от доверенных прокси.
$remote = filter_var($_SERVER['REMOTE_ADDR'] ?? '', FILTER_VALIDATE_IP) ?: '';
$ip = $remote;
if ($remote && in_array($remote, $cfg['trusted_proxies'] ?? [], true) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $first = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    $ip = filter_var($first, FILTER_VALIDATE_IP) ?: $remote;
}

// Ограничение частоты: не более 5 заявок с одного IP за 10 минут.
$rl = sys_get_temp_dir() . '/sette_rl_' . md5($ip);
$hits = array_values(array_filter(json_decode((string)@file_get_contents($rl), true) ?: [], fn ($t) => $t > time() - 600));
if (count($hits) >= 5) { $reply(429, ['ok' => false, 'error' => 'rate']); }
$hits[] = time();
@file_put_contents($rl, json_encode($hits), LOCK_EX);

// Очистка полей: без управляющих символов, значения выбора — только из списка формы.
$str = fn ($v, int $n) => trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', mb_substr(is_string($v) ? $v : '', 0, $n)));
$ver = fn ($v) => preg_match('/^[A-Za-z0-9._-]{1,20}$/', (string)$v) ? (string)$v : '';
$ROOMS = ['Студия', '1-комнатная', '2-комнатная', '3-комнатная', '4+ комнаты'];
$COMPLEX = ['Любой', 'Прайм', 'Гастелло', 'Сосновый бор'];

$name = $str($in['name'] ?? '', 100);
$rooms = implode(', ', array_values(array_intersect($ROOMS, array_map('trim', explode(',', $str($in['rooms'] ?? '', 200)))))) ?: 'не указано';
$complex = in_array($in['complex'] ?? '', $COMPLEX, true) ? $in['complex'] : 'Любой';
$consent = !empty($in['consent']);
$ads = !empty($in['ads']);

// Телефон → +7XXXXXXXXXX (E.164), чтобы работал дубль-контроль Битрикс24.
$digits = preg_replace('/\D/', '', is_string($in['phone'] ?? null) ? $in['phone'] : '');
if (strlen($digits) === 11 && $digits[0] === '8') { $digits = '7' . substr($digits, 1); }
if (strlen($digits) === 10) { $digits = '7' . $digits; }
$phone = '+' . $digits;

if (mb_strlen($name) < 2 || strlen($digits) < 10 || strlen($digits) > 15 || !$consent) {
    $reply(422, ['ok' => false, 'error' => 'validation']);
}

// Дедупликация: одна заявка с одного номера за 10 минут (двойной клик, повторная отправка).
$dd = sys_get_temp_dir() . '/sette_dd_' . md5($phone);
if (is_file($dd) && filemtime($dd) > time() - 600) { $reply(200, ['ok' => true, 'dup' => true]); }
@touch($dd);

$ua = mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300);
$when = date('c');
$consentVersion = $ver($in['consent_version'] ?? '') ?: CONSENT_VERSION_DEFAULT;
$adsVersion = $ver($in['ads_consent_version'] ?? '');
$cookieChoice = $ver($in['cookie_choice'] ?? '');
$page = mb_substr((string)($in['page'] ?? ''), 0, 300);
$suspect = (int)($in['elapsed_ms'] ?? 0) < 3000;   // форма заполнена быстрее 3 секунд — вероятно, бот

$comment = "Квартира: {$rooms}\nЖК: {$complex}\n"
         . "Согласие на обработку ПД: да (версия {$consentVersion}, {$when}, IP {$ip})\n"
         . 'Согласие на рекламу: ' . ($ads ? "да (версия {$adsVersion})" : 'нет') . "\n"
         . "Страница: {$page}";
$fields = [
    'TITLE' => ($suspect ? '[спам?] ' : '') . htmlspecialchars("Заявка с сайта: {$name}" . ($complex !== 'Любой' ? " · {$complex}" : ''), ENT_QUOTES, 'UTF-8'),
    'NAME' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    'PHONE' => [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']],
    'SOURCE_ID' => SOURCE_ID,
    'SOURCE_DESCRIPTION' => 'Форма «Подобрать квартиру»',
    'COMMENTS' => nl2br(htmlspecialchars($comment, ENT_QUOTES, 'UTF-8')),
    'UTM_SOURCE' => $str($in['utm_source'] ?? '', 100),
    'UTM_MEDIUM' => $str($in['utm_medium'] ?? '', 100),
    'UTM_CAMPAIGN' => $str($in['utm_campaign'] ?? '', 100),
    'UTM_CONTENT' => $str($in['utm_content'] ?? '', 100),
    'UTM_TERM' => $str($in['utm_term'] ?? '', 100),
    // Пользовательские поля под согласия создать в CRM → Настройки → Пользовательские поля лида и раскомментировать:
    // 'UF_CRM_CONSENT_PD' => 'Y', 'UF_CRM_CONSENT_ADS' => $ads ? 'Y' : 'N', 'UF_CRM_CONSENT_VERSION' => $consentVersion,
    // 'ASSIGNED_BY_ID' => 0,   // id ответственного менеджера; по умолчанию — владелец вебхука
];

// Журнал согласий — вне веб-корня, права 0600, без имени и телефона в открытом виде.
$log = function (array $extra) use ($when, $ip, $ua, $phone, $consentVersion, $ads, $adsVersion, $cookieChoice, $page, $cfg): bool {
    $record = ['ts' => $when, 'ip' => $ip, 'ua' => $ua, 'phone_hash' => hash('sha256', $phone . ($cfg['salt'] ?? '')),
        'consent' => true, 'consent_version' => $consentVersion, 'ads' => $ads, 'ads_consent_version' => $adsVersion,
        'cookie_choice' => $cookieChoice, 'page' => $page] + $extra;
    $dir = dirname(LOG_FILE);
    if (!is_dir($dir)) { @mkdir($dir, 0700, true); }
    $ok = file_put_contents(LOG_FILE, json_encode($record, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX) !== false;
    if ($ok) { @chmod(LOG_FILE, 0600); } else { error_log('lead.php: не удалось записать журнал согласий ' . LOG_FILE); }
    return $ok;
};

// CRM не настроена — не терять заявку: письмо в отдел продаж и честный ответ.
if (BITRIX_WEBHOOK === '') {
    error_log('lead.php: BITRIX_WEBHOOK не настроен — заявка отправлена письмом');
    $sent = mail(SALES_EMAIL, 'Заявка с сайта (CRM не настроена)', "Имя: {$name}\nТелефон: {$phone}\n{$comment}", 'From: noreply@' . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    $log(['via' => 'mail', 'sent' => $sent]);
    $sent ? $reply(200, ['ok' => true, 'via' => 'mail']) : $reply(500, ['ok' => false, 'error' => 'config']);
}

$send = function () use ($fields): array {
    $ch = curl_init(rtrim(BITRIX_WEBHOOK, '/') . '/crm.lead.add.json');
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 10, CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode(['fields' => $fields, 'params' => ['REGISTER_SONET_EVENT' => 'Y']], JSON_UNESCAPED_UNICODE),
    ]);
    $res = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_errno($ch) ? curl_error($ch) : '';
    curl_close($ch);
    return [$code, $err, json_decode((string)$res, true)];
};
[$code, $err, $out] = $send();
if ($code === 503 || (($out['error'] ?? '') === 'QUERY_LIMIT_EXCEEDED')) { usleep(700000); [$code, $err, $out] = $send(); }   // лимит REST — одна повторная попытка

if ($code === 200 && !empty($out['result'])) {
    $log(['lead_id' => $out['result']]);
    $reply(200, ['ok' => true, 'lead' => $out['result']]);
}
// Ошибка CRM — заявку не теряем: письмо в отдел продаж, подробности только в серверный лог.
error_log('lead.php: Bitrix24 ' . $code . ' ' . ($err ?: ($out['error_description'] ?? '')));
$sent = mail(SALES_EMAIL, 'Заявка с сайта (ошибка CRM)', "Имя: {$name}\nТелефон: {$phone}\n{$comment}", 'From: noreply@' . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
$log(['via' => 'mail-fallback', 'sent' => $sent, 'crm_http' => $code]);
$sent ? $reply(200, ['ok' => true, 'via' => 'mail']) : $reply(502, ['ok' => false, 'error' => 'crm']);
