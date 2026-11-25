import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const origin = process.env.TOOLS_TEST_ORIGIN || 'http://127.0.0.1:8765';
const cases = [
  {route:'plant-growth-tracker', values:{h1:10,h2:20,gdays:5,nodes1:2,nodes2:7}, results:{growthOut:/2\.00 cm\/day.*1\.00 nodes\/day/s}},
  {route:'plant-growth-tracker', values:{h1:'',h2:20,gdays:5,nodes1:2,nodes2:7}, results:{growthOut:/Enter a valid growth interval/}},
  {route:'ph-meter', values:{bufferObserved:7.15}, results:{bufferCheckOut:/\+0\.15 pH/}},
  {route:'tds-meter', values:{ec:2,ppm:1250}, results:{tdsout:/\b1000\b/,ecout:/2\.50 mS\/cm/}},
  {route:'ppfd-chart', values:{ppfd:500,hours:10}, results:{readingOut:/18\.0 mol/}},
  {route:'dilution-calculator', values:{c1:100,c2:25,v2:10}, results:{dilOut:/2\.500 .*stock/,diluentOut:/7\.500 .*diluent/}},
  {route:'dew-point', values:{air:20,rh:100,surface:18}, results:{dewOut:/20\.0 °C dew point.*Condensation physically possible now/s}},
  {route:'root-zone-temperature', values:{rzt:20,rat:24,solutionT:22}, results:{rootOut:/Root-air difference -4\.0 °C.*irrigation-root difference 2\.0 °C/s}},
];

const browser = await puppeteer.launch({
  executablePath:process.env.CHROME_PATH || '/usr/bin/chromium',
  headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage'],
});
try {
  const failures = [];
  for (const width of [1280,390]) {
    for (const {route,values,results} of cases) {
      const page = await browser.newPage();
      try {
        await page.setViewport({width,height:844});
        const response = await page.goto(origin+'/'+route+'/',{waitUntil:'load',timeout:15000});
        assert.equal(response?.status(),200);
        await page.evaluate(entries => {
          for (const [id,value] of entries) {
            const input = document.getElementById(id);
            if (!(input instanceof HTMLInputElement)) throw new Error('Missing input: '+id);
            input.value = String(value);
            input.dispatchEvent(new Event('input',{bubbles:true}));
            input.dispatchEvent(new Event('change',{bubbles:true}));
          }
        }, Object.entries(values));
        for (const [id,expected] of Object.entries(results)) {
          const actual = await page.$eval('#'+id, el=>el.innerText);
          assert.match(actual,expected,route+' result '+id+' got '+actual);
        }
        console.log(route+' at '+width+'px: known-answer checks passed');
      } catch (error) {
        failures.push(new Error(route+' at '+width+'px: '+error.message,{cause:error}));
      } finally {
        await page.close();
      }
    }
  }
  if (failures.length) throw new AggregateError(failures,failures.map(x=>x.message).join('\n'));
} finally {
  await browser.close();
}
