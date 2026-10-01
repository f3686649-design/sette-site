from pathlib import Path
import argparse, subprocess, zipfile
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true');args=parser.parse_args()
subprocess.run(['node',str(root/'tools/verify.cjs')]+([] if args.preview else ['--production']),cwd=root,check=True)
out=root/'release';out.mkdir(exist_ok=True)
name='sette-preview.zip' if args.preview else 'sette-production.zip'
files=['index.html','privacy.html','consent.html','consent-ads.html','styles.css','fx.css','legal.css','app.js','fx.js','data.js','media.js','legal.js','site-config.js','api/lead.php']
with zipfile.ZipFile(out/name,'w',zipfile.ZIP_DEFLATED) as z:
    for file in files:
        content=(root/file).read_bytes()
        if args.preview and file.endswith('.html'):
            content=content.replace(b'<head>',b'<head>\n<meta name="robots" content="noindex,nofollow">')
        z.writestr(file,content)
    for directory in ['img','vendor']:
        for file in (root/directory).rglob('*'):
            if file.is_file():z.write(file,file.relative_to(root))
print(out/name)
