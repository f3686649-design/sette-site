<?php
// Copy OUTSIDE the web root, e.g. /home/USER/private/sette-config.php.
// Set SETTE_CONFIG_FILE when this is not the default ../private path.
return [
    'webhook' => '', // https://YOUR_PORTAL.bitrix24.ru/rest/USER/SECRET/
    'origins' => ['https://sette.su', 'https://www.sette.su'],
    'salt' => '', // generate on server: php -r "echo bin2hex(random_bytes(32));"
    'storage' => '/home/USER/private/sette-leads',
    'consent_version' => '0.1', // must match approved text and legal.js
    'ads_consent_version' => '0.1',
];
