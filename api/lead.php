<?php
/**
 * Приём заявки с сайта → лид в Битрикс24 (CRM). Шаблон для реального сервера.
 *
 * Зачем сервер, а не прямой вызов из браузера: входящий вебхук Битрикс24 — это секрет.
 * Если положить его в JS, любой сможет создавать лиды и читать CRM в пределах прав вебхука.
 *
 * Настройка:
 *  1. В Битрикс24: Разработчикам → Другое → Входящий вебхук, права: crm. Скопировать URL вида
 *     https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/xxxxxxxxxxxxxxxx/
 *  2. Вписать его в BITRIX_WEBHOOK ниже (или задать переменной окружения на хостинге).
 *  3. В app.js указать SUBMIT_URL = 'api/lead.php'.
 *  4. Проверить, что папка api/ отдаётся PHP (обычно так на любом shared-хостинге).
 *
 * Согласия: вместе с лидом сохраняются дата/время, IP, User-Agent и версии текстов согласий —
 * это доказательство по ч. 3 ст. 9 152-ФЗ. Журнал consent.log лежит вне веб-корня (см. LOG_FILE).
 */

const BITRIX_WEBHOOK = getenv('BITRIX_WEBHOOK') ?: '[[https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/КЛЮЧ/]]';
const LOG_FILE = __DIR__ . '/../../consent.log';      // вне public_html; поправить под структуру хостинга
const ALLOWED_ORIGIN = '[[https://sette.su]]';        // домен сайта — защита от чужих форм
const SOURCE_ID = 'WEB';                              // источник лида в Битрикс24 (Справочники → Источники)

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'method']); exit; }
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && ALLOWED_ORIGIN[0] !== '[' && $origin !== ALLOWED_ORIGIN) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'origin']); exit; }

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'json']); exit; }

$name    = trim(mb_substr((string)($in['name'] ?? ''), 0, 100));
$phone   = preg_replace('/[^\d+]/', '', (string)($in['phone'] ?? ''));
$rooms   = trim(mb_substr((string)($in['rooms'] ?? ''), 0, 200));
$complex = trim(mb_substr((string)($in['complex'] ?? ''), 0, 100));
$consent = !empty($in['consent']);
$ads     = !empty($in['ads']);

if (mb_strlen($name) < 2 || strlen(preg_replace('/\D/', '', $phone)) < 10 || !$consent) {
    http_response_code(422); echo json_encode(['ok' => false, 'error' => 'validation']); exit;
}

// Простая защита от спама: скрытое поле-ловушка и минимальное время заполнения (ставит JS).
if (!empty($in['website'])) { echo json_encode(['ok' => true]); exit; }   // бот заполнил honeypot — делаем вид, что приняли

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$ua = mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300);
$when = date('c');

// 1. Журнал согласий (доказательство факта и версии согласия)
$record = [
    'ts' => $when, 'ip' => $ip, 'ua' => $ua, 'name' => $name, 'phone' => $phone,
    'consent' => $consent, 'consent_version' => (string)($in['consent_version'] ?? ''),
    'ads' => $ads, 'ads_consent_version' => (string)($in['ads_consent_version'] ?? ''),
    'cookie_choice' => (string)($in['cookie_choice'] ?? ''), 'page' => mb_substr((string)($in['page'] ?? ''), 0, 300),
];
@file_put_contents(LOG_FILE, json_encode($record, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);

// 2. Лид в Битрикс24
$comment = "Квартира: {$rooms}\nЖК: {$complex}\nСогласие на обработку ПД: да (версия {$record['consent_version']}, {$when}, IP {$ip})\n"
         . 'Согласие на рекламу: ' . ($ads ? "да (версия {$record['ads_consent_version']})" : 'нет') . "\nСтраница: {$record['page']}";
$fields = [
    'TITLE' => "Заявка с сайта: {$name}" . ($complex && $complex !== 'Любой' ? " · {$complex}" : ''),
    'NAME' => $name,
    'PHONE' => [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']],
    'SOURCE_ID' => SOURCE_ID,
    'SOURCE_DESCRIPTION' => 'Форма «Подобрать квартиру»',
    'COMMENTS' => $comment,
    'UTM_SOURCE' => mb_substr((string)($in['utm_source'] ?? ''), 0, 100),
    'UTM_MEDIUM' => mb_substr((string)($in['utm_medium'] ?? ''), 0, 100),
    'UTM_CAMPAIGN' => mb_substr((string)($in['utm_campaign'] ?? ''), 0, 100),
    // Пользовательские поля под согласия создать в CRM → Настройки → Пользовательские поля лида и раскомментировать:
    // 'UF_CRM_CONSENT_PD' => 'Y', 'UF_CRM_CONSENT_ADS' => $ads ? 'Y' : 'N', 'UF_CRM_CONSENT_VERSION' => $record['consent_version'],
];

if (BITRIX_WEBHOOK[0] === '[') { echo json_encode(['ok' => true, 'note' => 'BITRIX_WEBHOOK не настроен — заявка записана только в журнал']); exit; }

$ch = curl_init(rtrim(BITRIX_WEBHOOK, '/') . '/crm.lead.add.json');
curl_setopt_array($ch, [
    CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode(['fields' => $fields, 'params' => ['REGISTER_SONET_EVENT' => 'Y']], JSON_UNESCAPED_UNICODE),
]);
$res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
$out = json_decode((string)$res, true);
if ($code === 200 && !empty($out['result'])) { echo json_encode(['ok' => true, 'lead' => $out['result']]); }
else { http_response_code(502); echo json_encode(['ok' => false, 'error' => 'bitrix', 'detail' => $out['error_description'] ?? $code]); }
