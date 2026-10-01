"""Exercise the real PHP handler with an isolated fake CRM transport; sends no leads."""
from pathlib import Path
import json, os, socket, subprocess, tempfile, time, urllib.request, urllib.error
ROOT=Path(__file__).resolve().parent.parent
PHP=Path(os.environ.get('PHP_BIN', str(ROOT/'artifacts/php/php.exe')))
with tempfile.TemporaryDirectory(prefix='sette-api-') as temp:
    tmp=Path(temp); public=tmp/'public'; public.mkdir(); storage=tmp/'storage'; storage.mkdir()
    config=tmp/'config.php'; mode=tmp/'mode.json'; capture=tmp/'capture.json'
    def phpstr(s):return "'"+str(s).replace('\\','/').replace("'","\\'")+"'"
    def configure(**overrides):
        values=dict(webhook='https://crm.example.invalid/rest/1/test/',origins=['http://127.0.0.1:8766'],salt='x'*64,storage=str(storage).replace('\\','/'),consent_version='0.1',ads_consent_version='0.1');values.update(overrides)
        config.write_text('<?php return json_decode('+phpstr(json.dumps(values))+', true);',encoding='utf-8')
    configure();mode.write_text('{"status":502,"body":{"error":"CRM_DOWN"}}')
    constants=['CURLOPT_POST','CURLOPT_RETURNTRANSFER','CURLOPT_CONNECTTIMEOUT','CURLOPT_TIMEOUT','CURLOPT_SSL_VERIFYPEER','CURLOPT_SSL_VERIFYHOST','CURLOPT_FOLLOWLOCATION','CURLOPT_HTTPHEADER','CURLOPT_POSTFIELDS','CURLINFO_HTTP_CODE']
    router=tmp/'router.php'
    router.write_text('''<?php
'''+ '\n'.join('define('+phpstr(c)+','+str(i+1)+');' for i,c in enumerate(constants))+'''
function curl_init($url) { return $url; }
function curl_setopt_array($ch,$opts) { file_put_contents('''+phpstr(capture)+''', $opts[CURLOPT_POSTFIELDS]); return true; }
function curl_exec($ch) { $m=json_decode(file_get_contents('''+phpstr(mode)+'''),true); return json_encode($m['body']); }
function curl_getinfo($ch,$opt) { $m=json_decode(file_get_contents('''+phpstr(mode)+'''),true); return $m['status']; }
require '''+phpstr(ROOT/'api/lead.php')+';',encoding='utf-8')
    env=os.environ.copy();env['SETTE_CONFIG_FILE']=str(config)
    log=(tmp/'server.log').open('w')
    proc=subprocess.Popen([str(PHP),'-n','-d','extension_dir='+str(PHP.parent/'ext'),'-d','extension=mbstring','-S','127.0.0.1:8766','-t',str(public),str(router)],env=env,stdout=log,stderr=log)
    def request(body=None,method='POST',origin='http://127.0.0.1:8766',ctype='application/json'):
        raw=json.dumps(body).encode() if isinstance(body,(dict,list)) else body
        req=urllib.request.Request('http://127.0.0.1:8766/api/lead.php',data=raw,method=method,headers={'Origin':origin,'Content-Type':ctype})
        try:
            with urllib.request.urlopen(req,timeout=5) as res:return res.status,json.loads(res.read())
        except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
    checks=[]
    def check(label, expected, **kwargs):
        code,body=request(**kwargs);assert code==expected,(label,code,body);checks.append(label);return body
    try:
        for _ in range(40):
            try:
                with socket.create_connection(('127.0.0.1',8766),timeout=.1):break
            except OSError:time.sleep(.1)
        check('GET rejected',405,method='GET')
        check('foreign origin rejected',403,body={},origin='https://other.invalid')
        check('wrong media type rejected',415,body=b'{}',ctype='text/plain')
        check('oversized request rejected',413,body=b'x'*8193)
        check('malformed JSON rejected',400,body=b'{bad')
        valid=dict(name='Проверка',phone='+7 999 123-45-67',consent=True,consent_version='0.1',ads=False,complex='Прайм',rooms='Студия',utm_source='test')
        check('phone rejected',422,body={**valid,'phone':'12345678901234'})
        check('string consent rejected',422,body={**valid,'consent':'true'})
        check('old consent version rejected',422,body={**valid,'consent_version':'wrong'})
        check('ads version required',422,body={**valid,'ads':True})
        check('CRM failure is not success',502,body=valid)
        check('retry after failure is not deduplicated as success',502,body=valid)
        mode.write_text('{"status":200,"body":{"result":12345}}')
        result=check('successful CRM delivery',200,body=valid);assert result['ok'] is True
        sent=json.loads(capture.read_text());assert sent['fields']['PHONE'][0]['VALUE']=='+79991234567';assert sent['fields']['UTM_SOURCE']=='test'
        result=check('successful lead deduplicated',200,body=valid);assert result['duplicate'] is True
        check('rate final allowed attempt',200,body=valid)
        check('rate limit enforced',429,body=valid)
        text=(storage/'consent.log').read_text();assert '+79991234567' not in text and 'Проверка' not in text
        checks.append('journal excludes plaintext phone and name')
        configure(webhook='');check('unconfigured CRM rejected',503,body=valid)
        configure(storage=str(public));check('public storage rejected',503,body=valid)
        (ROOT/'artifacts/api-report.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
        print(f'{len(checks)} API checks passed. CRM transport was mocked; no real lead sent.')
    finally:
        proc.terminate();proc.wait(timeout=5);log.close()
