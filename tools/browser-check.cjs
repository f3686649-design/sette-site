const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Maxim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const report=[];
 for(const width of [1440,390]){
  const p=await browser.newPage({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()])});
  await p.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await p.waitForTimeout(3000);await p.screenshot({path:`artifacts/after-${width}.png`});
  const first=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,scrollY,images:[...document.images].filter(i=>i.complete && i.naturalWidth===0 && i.getAttribute('src')).map(i=>i.src)}));
  if(width<500){await p.locator('#menuBtn').click();await p.keyboard.press('Escape');if(await p.locator('#menuBtn').getAttribute('aria-expanded')!=='false')errors.push('menu escape');}
  await p.locator('#heroInfo').click();await p.locator('#modal').waitFor({state:'visible'});
  await p.waitForTimeout(3000);await p.screenshot({path:`artifacts/modal-${width}.png`});
  await p.locator('#modalClose').click();
  await p.locator('#pick').scrollIntoViewIfNeeded();
  await p.locator('input[name="name"]').fill('Тест');await p.locator('input[name="phone"]').fill('12345678901234');
  await p.locator('#pickForm button[type="submit"]').click();
  const invalid=await p.locator('input[name="phone"]').getAttribute('aria-invalid');
  await p.locator('input[name="phone"]').fill('+7 999 123-45-67');await p.locator('input[name="consent"]').check();
  await p.route('**/api/lead.php',route=>route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({ok:false,error:'crm'})}));
  await p.locator('#pickForm button[type="submit"]').click();await p.waitForTimeout(150);
  const failure=await p.locator('#formMsg').textContent();
  await p.unroute('**/api/lead.php');await p.route('**/api/lead.php',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
  await p.locator('#pickForm button[type="submit"]').click();await p.waitForTimeout(150);
  const success=await p.locator('#formMsg').textContent();
  await p.waitForTimeout(3000);await p.screenshot({path:`artifacts/form-${width}.png`});
  assert.equal(first.overflow,false); assert.equal(first.scrollY,0); assert.deepEqual(first.images,[]); assert.equal(invalid,'true'); assert.match(failure,/Не удалось отправить/); assert.match(success,/Спасибо/); assert.deepEqual(errors,[]); assert(bad.every(([status,url])=>status===502 && url.endsWith('/api/lead.php')));
  report.push({width,first,invalid,failure,success,errors,bad});await p.close();
 }
 await browser.close();fs.writeFileSync('artifacts/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});

