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
 // Invalid user input must not silently become a plausible numerical DLI.
 await page.$eval('#ppfd',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.match(await page.$eval('#readingOut',el=>el.textContent),/Enter valid PPFD/);
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'—');
 assert.equal(await page.$eval('#requiredPpfd',el=>el.textContent),'—');
 await page.$eval('#ppfd',el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#hours',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'—',
   'Blank photoperiod must not fall back to a fictional 12-hour day');
 await page.$eval('#hours',el=>{el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'21.6');


 // Logger must not fabricate zero-valued measurements from empty fields.
 await page.$eval('#ppfd',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#logCurrentReading');
 assert.match(await page.$eval('#lightLogStatus',el=>el.textContent),/valid PPFD reading/);
 assert.equal(await page.$eval('#lightLogCount',el=>el.textContent),'0',
   'Blank live PPFD cannot create a zero reading in the stored log');
 await page.click('#startLightAutoLog');
 assert.equal(await page.$eval('#stopLightAutoLog',el=>el.disabled),true,
   'Auto logging must not start on an invalid initial reading');
 await page.$eval('#ppfd',el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#logNote',el=>{el.value='<img src=x onerror=alert(1)>';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#logCurrentReading');
 assert.equal(await page.$eval('#lightLogCount',el=>el.textContent),'1');
 assert.equal(await page.$eval('#lightLogRows',el=>el.querySelectorAll('tr').length),1,
   'Logging must render the saved reading without a runtime exception');
 assert.equal(await page.$eval('#lightLogRows',el=>el.querySelector('img')),null,
   'User-entered notes must be displayed as escaped text');
 assert.match(await page.$eval('#lightLogRows',el=>el.textContent),/<img src=x onerror=alert\(1\)>/);
 await page.$eval('#ppfd',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#logCurrentReading');
 assert.equal(await page.$eval('#lightLogCount',el=>el.textContent),'1',
   'An invalid second measurement must not overwrite or append data');
 await page.$eval('#ppfd',el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});

 // A previously saved or imported corrupted log must not pollute measurements.
 const storedLog=await page.evaluate(()=>{
   const key='thc-light-lab-time-log-v1';
   const before=window.THC.load(key,[]);
   const sample={id:'valid-extra',at:'2026-11-19T12:00:00.000Z',value:0,basis:'ppfd',method:'meter',note:'validated zero'};
   const invalids=[
     {...sample,id:'missing',value:null},
     {...sample,id:'blank',value:'  '},
     {...sample,id:'negative',value:-1},
     {...sample,id:'above-range',value:3001},
     {...sample,id:'boolean',value:false},
     {...sample,id:'date',at:'invalid-date'},
   ];
   window.THC.save(key,[...before,...invalids,sample]);
   return before;
 });
 await page.select('#logMeasurementType','epar');
 await page.select('#logMeasurementType','ppfd');
 assert.equal(await page.$eval('#lightLogCount',el=>el.textContent),'2',
   'Only the original valid reading and legitimate PPFD=0 may survive corrupted saved data');
 await page.evaluate(rows=>window.THC.save('thc-light-lab-time-log-v1',rows),storedLog);
 await page.select('#logMeasurementType','epar');
 await page.select('#logMeasurementType','ppfd');
 assert.equal(await page.$eval('#lightLogCount',el=>el.textContent),'1',
   'Restoring the valid log must restore the original measurement count');

 await page.click('#loadScheduleExample');
 assert.match(await page.$eval('#scheduleDli',el=>el.textContent),/^27\.4\b/,
   'Three-block schedule should integrate 300×1 + 700×10 + 300×1 PPFD-hours');
 await page.select('#lightPattern','variable');
 await page.$eval('#ppfd',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});

 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'27.4',
   'Variable light model must use schedule rather than stable PPFD input');
 await page.click('#clearSchedule');
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'invalid',
   'An incomplete variable schedule must not show a stale previous DLI');
 await page.$eval('#ppfd',el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.select('#lightPattern','constant');
 assert.equal(await page.$eval('#dliValue',el=>el.textContent),'21.6');

 // Fixture calibration must not convert blank dimmer or photoperiod
 // into misleading estimates. PPFD interpolation is independent of hours.
 await page.$eval('#calibrationPoints',el=>{el.value='0:0\n100:1000';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#calibrationTargetDimmer',el=>{el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.match(await page.$eval('#calibrationEstimate',el=>el.textContent),/^500 /);
 assert.match(await page.$eval('#calibrationDli',el=>el.textContent),/^21\.6 /);
 await page.$eval('#hours',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.match(await page.$eval('#calibrationEstimate',el=>el.textContent),/^500 /,
   'Calibrated PPFD must remain available without a photoperiod');
 assert.equal(await page.$eval('#calibrationDli',el=>el.textContent),'—',
   'Missing photoperiod cannot silently imply a 12-hour light day');
 assert.match(await page.$eval('#calibrationStatus',el=>el.textContent),/requires a valid/);
 await page.$eval('#calibrationTargetDimmer',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('#calibrationEstimate',el=>el.textContent),'—',
   'Missing dimmer target must not be interpreted as a valid 0% setting');
 assert.equal(await page.$eval('#calibrationDli',el=>el.textContent),'—');
 await page.$eval('#calibrationTargetDimmer',el=>{el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#hours',el=>{el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.match(await page.$eval('#calibrationDli',el=>el.textContent),/^21\.6 /);

 await page.click('#sampleMap');
 assert.equal(await page.$eval('#ppfdGrid',el=>el.querySelectorAll('input[aria-label]').length),16);
 assert.match(await page.$eval('#mapProgress',el=>el.textContent),/16 of 16/);
 // Map-DLI must not borrow a fictional 12-hour photoperiod.
 await page.$eval('#hours',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('#dliRange',el=>el.textContent),'—',
   'Map DLI range must be withheld when current photoperiod is blank');
 await page.$eval('#hours',el=>{el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.notEqual(await page.$eval('#dliRange',el=>el.textContent),'—');
 // A blank PPFD value must not silently fill every canopy sample with zero.
 await page.$eval('#ppfd',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#fillReading');
 assert.equal(await page.$eval('#ppfdGrid',el=>el.querySelector('input')?.value),'510',
   'Invalid live reading must preserve existing measured map cells');
 assert.match(await page.$eval('#sessionStatus',el=>el.textContent),/valid PPFD reading/,
   'Invalid fill operation should explain what the user needs to supply');
 await page.$eval('#ppfd',el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#fillReading');
 assert.equal(await page.$eval('#ppfdGrid',el=>[...el.querySelectorAll('input')].every(i=>i.value==='500')),true,
   'Valid current PPFD must still populate the selected map grid');

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
