const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '..');
let failed = false;
function assert(ok, message) { if (!ok) { console.error(message); failed = true; } }
for (const file of ['app.js','data.js','media.js','fx.js','legal.js','site-config.js']) new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const {BASE,OBJECTS} = vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n({BASE,OBJECTS})');
const MEDIA = vm.runInNewContext(fs.readFileSync(path.join(root,'media.js'),'utf8')+'\nMEDIA');
for (const [source,local] of Object.entries(MEDIA)) assert(fs.existsSync(path.join(root,local)),`Missing asset: ${local}`);
for (const object of OBJECTS) {
 for (const p of [object.cover,...object.gallery||[]]) {
  const url=p.startsWith('http')?p:BASE+p;
  assert(!!MEDIA[url],`Unlocalized image: ${url}`);
  if(MEDIA[url])assert(fs.existsSync(path.join(root,MEDIA[url].replace('.webp','-thumb.webp'))),`Missing thumbnail: ${url}`);
 }
 for(const p of object.progress||[])assert(!!MEDIA[p.url],`Unlocalized progress: ${object.id} ${p.ym}`);
}
for(const file of ['index.html','privacy.html','consent.html','consent-ads.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of html.matchAll(/(?:src|href)="([^"#?:]+)"/g))assert(fs.existsSync(path.join(root,m[1])),`Broken local reference in ${file}: ${m[1]}`);
}
if(process.argv.includes('--production')){
 for(const file of ['index.html','privacy.html','consent.html','consent-ads.html','legal.js']){
  const content=fs.readFileSync(path.join(root,file),'utf8');
  assert(!content.includes('[['),`Launch blocked: fill and approve legal details in ${file}`);
 }
 assert(fs.existsSync(path.join(root,'deploy','acceptance.json')),'Launch blocked: record live hosting/CRM and source-content acceptance in deploy/acceptance.json');
}
console.log(`${Object.keys(MEDIA).length} local media assets, ${OBJECTS.length} objects; syntax and local references checked.`);
process.exitCode=failed?1:0;
