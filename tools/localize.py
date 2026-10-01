from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote, urlsplit, unquote
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, unicodedata
from PIL import Image
from io import BytesIO
root=Path(__file__).resolve().parent.parent
(root/'artifacts').mkdir(exist_ok=True)
urls=[x['url'] for x in json.loads((root/'deploy/media-sources.json').read_text(encoding='utf-8-sig'))]
out=root/'img/media'; out.mkdir(parents=True,exist_ok=True)
def get(url):
    key=hashlib.sha256(url.encode()).hexdigest()[:16]
    ispdf=url.lower().endswith('.pdf')
    target=out/(key+('.pdf' if ispdf else '.webp'))
    if target.exists() and (ispdf or (out/(key+'-thumb.webp')).exists()):
        return {'url':url,'local':target.relative_to(root).as_posix(),'bytes':target.stat().st_size}
    for variant in [url,unicodedata.normalize('NFD',unquote(url))]:
        try:
            safe=quote(variant,safe=':/?=&%')
            with urlopen(Request(safe,headers={'User-Agent':'Mozilla/5.0'}),timeout=25) as r: content=r.read()
            if ispdf:
                assert content.startswith(b'%PDF'); target.write_bytes(content)
            else:
                im=Image.open(BytesIO(content)); im.thumbnail((1920,1440)); im.convert('RGB').save(target,'WEBP',quality=83)
                im.thumbnail((400,300)); im.convert('RGB').save(out/(key+'-thumb.webp'),'WEBP',quality=76)
            return {'url':url,'local':target.relative_to(root).as_posix(),'bytes':target.stat().st_size}
        except Exception as e: error=str(e)
    return {'url':url,'error':error}
with ThreadPoolExecutor(max_workers=6) as ex: results=list(ex.map(get,urls))
(root/'artifacts/assets-result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'ok':sum('local'in r for r in results),'failed':[r for r in results if 'error'in r]},ensure_ascii=False))

if all('local' in x for x in results):
    (root/'media.js').write_text('const MEDIA = '+json.dumps({x['url']:x['local'] for x in results},ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
