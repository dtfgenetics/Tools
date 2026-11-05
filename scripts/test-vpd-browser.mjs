import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const origin=process.env.VPD_BROWSER_ORIGIN||'http://127.0.0.1:8765';
const errors=[];
const browser=await puppeteer.launch({
 executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',
 headless:true,
 args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
});
const work=await mkdtemp(path.join(os.tmpdir(),'vpd-browser-'));
try{
 const page=await browser.newPage();
 page.on('pageerror',error=>errors.push('Page exception: '+error.message));
 page.on('response',response=>{
  if(response.status()>=400&&response.url().startsWith(origin+'/assets/'))
   errors.push('Failed application asset: '+response.status()+' '+response.url());
 });
 await page.setViewport({width:390,height:844,deviceScaleFactor:1});
 const response=await page.goto(origin+'/vpd-chart/',{waitUntil:'networkidle2',timeout:30000});
 assert.equal(response?.status(),200,'VPD HTML must return HTTP 200');
 await page.waitForSelector('#vout .vpd-main',{timeout:15000});
 const initial=await page.$eval('#vout',node=>node.innerText);
 assert.match(initial,/Leaf VPD/);
 const match=initial.match(/([0-9]+\.[0-9]+) kPa/);
 assert.ok(match,'Calculated leaf VPD should have a numeric reading');
 assert.ok(Math.abs(Number(match[1])-1.15)<0.04,'26 °C, 60% RH, 25 °C leaf should yield ~1.15 kPa');
 assert.match(initial,/Leaf–dew-point margin/);
 const margin=initial.match(/Leaf–dew-point margin\s*([-0-9.]+) °C/);
 assert.ok(margin,'The leaf/dew-point temperature difference should be visible');
 assert.ok(Number(margin[1])>6&&Number(margin[1])<9,'Dew margin must be the difference, not absolute leaf temperature');
 assert.ok((await page.$eval('#chart',el=>el.querySelectorAll('td').length))>=80,'Heatmap should render valid cells');
 // Heatmap cells are usable controls, with touch/click and keyboard support.
 await page.click('#chart td[data-air="27.00"][data-rh]');
 assert.ok(Math.abs(Number(await page.$eval('#temp',el=>el.value))-27)<0.2,'Tapping heatmap cell should update air temperature');
 assert.ok((await page.$eval('#chart',el=>el.querySelectorAll('td.active').length))===1,'Selected heatmap cell must remain highlighted');
 await page.keyboard.press('Enter');
 assert.ok(Math.abs(Number(await page.$eval('#temp',el=>el.value))-27)<0.2,'Keyboard activation should preserve the selected reading');
 await page.$eval('#temp',el=>{el.value='26';el.dispatchEvent(new Event('input',{bubbles:true}));});

 
 // Incorrect input must invalidate both summary and previous chart.
 await page.$eval('#temp',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.match(await page.$eval('#vout',el=>el.textContent),/Enter valid conditions/);
 assert.equal(await page.$eval('#chart',el=>el.querySelectorAll('td').length),0,'Do not leave stale heatmap after an invalid reading');
 await page.$eval('#temp',el=>{el.value='26';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForSelector('#vout .vpd-main');
 
 // Round-trip units must preserve physical temperature, including negative leaf offsets.
 await page.select('#unit','f');
 assert.ok(Math.abs(Number(await page.$eval('#temp',el=>el.value))-78.8)<0.15);
 assert.ok(Math.abs(Number(await page.$eval('#offset',el=>el.value))+1.8)<0.15);
 await page.select('#unit','c');
 assert.ok(Math.abs(Number(await page.$eval('#temp',el=>el.value))-26)<0.15);
 await page.select('#leafMode','measured');
 await page.$eval('#leafMeasured',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.match(await page.$eval('#vout',el=>el.textContent),/valid measured leaf temperature/);
 await page.select('#leafMode','offset');
 
 // Graph data state must clear, including preventing resurrection after changing target bands.
 await page.click('#trendExample');
 assert.equal(await page.$eval('#trendCount',el=>el.textContent),'24');
 assert.equal(await page.$eval('#trendMetrics',el=>el.hidden),false);
 await page.click('#trendClear');
 assert.equal(await page.$eval('#trendMetrics',el=>el.hidden),true);
 assert.equal(await page.$eval('#trendBody',el=>el.children.length),0);
 await page.$eval('#vpdTargetLow',el=>{el.value='0.7';el.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('#trendMetrics',el=>el.hidden),true,'Cleared logger must not repopulate on target edits');
 
 // Actual browser file-input handling, including local Papa Parse.
 const filename=path.join(work,'readings.csv');
 await writeFile(filename,'time,temp,rh\n00,26,60\n01,,60\n02,25,0\n03,25,70\n');
 await (await page.$('#trendFile')).uploadFile(filename);
 await page.waitForFunction(()=>document.querySelector('#trendCount').textContent==='2',{timeout:10000});
 assert.match(await page.$eval('#trendStatus',el=>el.textContent),/Analyzed 2 valid logger rows/);
 const invalidFile=path.join(work,'invalid.csv');
 await writeFile(invalidFile,'timestamp,unknown_column\n00,12\n');
 await (await page.$('#trendFile')).uploadFile(invalidFile);
 await page.waitForFunction(()=>document.querySelector('#trendStatus').textContent.includes('CSV needs temperature and humidity'),{timeout:10000});
 assert.equal(await page.$eval('#trendMetrics',el=>el.hidden),true,'Rejected CSV must not show metrics from an earlier valid import');

 
 // Saved profile must reject empty temperature, and preserve deliberate zero margin.
 await page.$eval('#temp',el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#saveVpdProfile');
 assert.match(await page.$eval('#vpdProfileStatus',el=>el.textContent),/invalid/);
 await page.$eval('#temp',el=>{el.value='26';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#vpdClearMargin',el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#vpdProfileName',el=>{el.value='Acceptance check';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.click('#saveVpdProfile');
 assert.match(await page.$eval('#vpdProfileStatus',el=>el.textContent),/Saved/);
 await page.$eval('#vpdClearMargin',el=>el.value='0.3');
 await page.click('#loadVpdProfile');
 assert.equal(await page.$eval('#vpdClearMargin',el=>el.value),'0');
 
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 if(overflow>2){const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+2||r.left< -2}).slice(0,15).map(el=>({tag:el.tagName,id:el.id,cls:el.className?.toString().slice(0,80),right:Math.round(el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width)})));console.error('Mobile overflow suspects:',JSON.stringify(offenders));}
 assert.ok(overflow<=2,'Mobile page should not overflow the viewport: '+overflow+'px');
 await page.setViewport({width:1280,height:900,deviceScaleFactor:1});
 assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))<=2,'Desktop page must not overflow viewport');
 assert.deepEqual(errors,[],'Browser runtime and local asset loads must be error-free');
 console.log('VPD browser acceptance passed: calculated science, dew margin, invalid UI, temperature units, CSV import, logger clearing, saved profiles, and mobile/desktop layout.');
}finally{
 await browser.close();
 await rm(work,{recursive:true,force:true});
}
