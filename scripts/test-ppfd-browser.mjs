import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const origin=process.env.PPFD_BROWSER_ORIGIN||'http://127.0.0.1:8765';
const chrome=process.env.CHROME_PATH||'/usr/bin/chromium';
const errors=[];
const browser=await puppeteer.launch({
 executablePath:chrome,headless:true,
 args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
});
try{
 const page=await browser.newPage();
 page.on('pageerror',error=>errors.push('JavaScript: '+error.message));
 page.on('response',response=>{
   if(response.status()>=400&&response.url().startsWith(origin+'/assets/'))
     errors.push('Broken owned asset: '+response.status()+' '+response.url());
 });
 await page.setViewport({width:390,height:844,deviceScaleFactor:1});
 const response=await page.goto(origin+'/ppfd-chart/',{waitUntil:'networkidle2',timeout:30000});
 assert.equal(response?.status(),200,'Light Lab HTML must load');
 await page.waitForFunction(()=>document.querySelector('#dliValue')?.textContent==='30.2',{timeout:12000});
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'30.2',
   '700 µmol/m²/s for 12 hours should produce 30.24 mol/m²/day');
 await page.$eval('#ppfd',el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'21.6',
   '500 µmol/m²/s for 12 hours should produce 21.6 mol/m²/day');
 await page.click('#loadScheduleExample');
 assert.match(await page.$eval('#scheduleDli',el=>el.textContent),/^27\.4\b/,
   'Three-block schedule should integrate 300×1 + 700×10 + 300×1 PPFD-hours');
 await page.select('#lightPattern','variable');
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'27.4',
   'Variable light model must use schedule rather than stable PPFD input');
 await page.click('#clearSchedule');
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'invalid',
   'An incomplete variable schedule must not show a stale previous DLI');
 await page.select('#lightPattern','constant');
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'21.6');

 await page.click('#sampleMap');
 assert.equal(await page.$eval('#ppfdGrid',el=>el.querySelectorAll('input[aria-label]').length),16);
 assert.match(await page.$eval('#mapProgress',el=>el.textContent),/16 of 16/);
 await page.click('#clearMap');
 assert.match(await page.$eval('#mapProgress',el=>el.textContent),/0 of 16/);
 const cells=await page.$eval('#ppfdGrid',el=>[...el.querySelectorAll('input')].every(i=>i.value===''));
 assert.equal(cells,true,'Cleared map must clear rendered grid inputs');

 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(overflow<=2,'Mobile document must not overflow ('+overflow+'px)');
 await page.setViewport({width:1280,height:900,deviceScaleFactor:1});
 const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(desktopOverflow<=2,'Desktop document must not overflow ('+desktopOverflow+'px)');
 assert.deepEqual(errors,[],'Browser JavaScript errors and missing local assets are release failures');
 console.log('PPFD browser acceptance passed: known-answer DLI, live updates, variable schedule, invalid-state clearing, map, mobile/desktop, and asset loading.');
}finally{await browser.close()}
