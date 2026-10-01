const assert=require('node:assert/strict');
const fs=require('fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Maxim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const results=[];
for(const width of [320,768,1440]){
 const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765');await p.waitForTimeout(500);
 for(const id of ['projects','progress','directions','portfolio','geo','roads','pick','contacts']){
  await p.locator('#'+id).scrollIntoViewIfNeeded();await p.waitForTimeout(250);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${id} overflow`);
 }
 await p.locator('#progress').scrollIntoViewIfNeeded();await p.locator('#buildTabs button').last().click();await p.locator('#buildPrev').click();await p.waitForTimeout(300);
 assert(await p.locator('#buildImg').evaluate(i=>i.complete&&i.naturalWidth>0));
 const month=await p.locator('#buildMonth').textContent();assert(month);
 await p.locator('#portfolio').scrollIntoViewIfNeeded();await p.locator('#tabs [data-filter="social"]').click();
 assert(await p.locator('#worksList .row').count()>0);assert(await p.locator('#buildTabs .is-active').count()===1);
 await p.locator('#worksList .row').first().click();await p.locator('#modal').waitFor({state:'visible'});await p.locator('#modalClose').click();
 const ids=await p.evaluate(()=>OBJECTS.map(o=>o.id));
 for(const id of ids){await p.evaluate(id=>openModal(OBJECTS.find(o=>o.id===id)),id);await p.locator('#galMain').evaluate(i=>i.decode());await p.locator('#modalClose').click();}
 await p.locator('#progress').scrollIntoViewIfNeeded();await p.screenshot({path:`artifacts/progress-${width}.png`});
 await p.locator('#contacts').scrollIntoViewIfNeeded();await p.screenshot({path:`artifacts/contacts-${width}.png`});
 assert.deepEqual(errors,[]);results.push({width,objects:ids.length,errors,overflow:false,progress:month});await p.close();
}
// If the map library fails, the object list still opens cards.
const p=await b.newPage({viewport:{width:390,height:844}});await p.route('**/vendor/leaflet.min.js',r=>r.abort());await p.goto('http://127.0.0.1:8765');await p.waitForTimeout(2500);await p.locator('#geoList button').first().click();assert(await p.locator('#modal').isVisible());await p.close();
await b.close();fs.writeFileSync('artifacts/layout-report.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));})().catch(e=>{console.error(e.message);process.exit(1)});
