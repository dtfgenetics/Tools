import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const origin = process.env.TOOLS_TEST_ORIGIN || 'http://127.0.0.1:8765';
const cases = [
  {route:'substrate-calculator', values:{pots:10,size:5,unit:'l',fill:100,overage:10,a:70,b:30,cPct:0,bag:20}, results:{subOut:/50\.0 L filled media.*55\.0 L purchase target.*3 whole bags/s}},
  {route:'substrate-calculator', values:{a:70,b:30,cPct:''}, results:{subOut:/Check substrate plan inputs/}},
  {route:'photoperiod-planner', values:{lightHours:10,lightPpfd:500,dawnRamp:60,duskRamp:60}, results:{photoOut:/9\.00 full-output-equivalent hours.*16\.2 mol/s}},
  {route:'photoperiod-planner', values:{lightHours:'',lightPpfd:500}, results:{photoOut:/Enter a valid lighting schedule/}},
  {route:'photoperiod-planner', values:{dawnRamp:-1}, results:{photoOut:/Enter a valid lighting schedule/}},
  {route:'unit-converter', values:{c:100}, fieldResults:{f:212}, results:{}},
  {route:'unit-converter', values:{f:32}, fieldResults:{c:0}, results:{}},
  {route:'unit-converter', values:{c:-274}, fieldResults:{f:''}, results:{}},
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
    // Restore two equivalent dimensional rates in different units; missing optional readings must remain absent.
    const growthPage=await browser.newPage();
    try {
      await growthPage.setViewport({width,height:844});
      await growthPage.goto(origin+'/plant-growth-tracker/',{waitUntil:'load',timeout:15000});
      await growthPage.evaluate(()=>{
        const common={plantId:'Regression plant',stage:'Vegetative',d:1,n1:1,n2:2,c1:null,c2:null};
        localStorage.setItem('thc-plant-growth-history-v1',JSON.stringify([
          {...common,id:'metric',at:'2026-01-01T00:00:00Z',a:10,b:12.54,u:'cm'},
          {...common,id:'imperial',at:'2026-01-02T00:00:00Z',a:4,b:5,u:'in'}
        ]));
      });
      await growthPage.reload({waitUntil:'load',timeout:15000});
      await growthPage.waitForFunction(()=>document.querySelector('#avgHeightRate')?.innerText==='2.54');
      assert.equal(await growthPage.$eval('#latestHeightRate',el=>el.innerText),'2.54');
      assert.match(await growthPage.$eval('#heightRateDelta',el=>el.innerText),/^[-+]?0\.00$/);
      assert.equal(await growthPage.$eval('#avgCanopyRate',el=>el.innerText),'—');
      console.log('plant-growth-tracker at '+width+'px: mixed-unit history checks passed');
    } catch(error) {
      failures.push(new Error('plant-growth-tracker mixed-unit history at '+width+'px: '+error.message,{cause:error}));
    } finally {
      await growthPage.evaluate(()=>localStorage.removeItem('thc-plant-growth-history-v1')).catch(()=>{});
      await growthPage.close();
    }
    for (const {route,values,results,fieldResults={}} of cases) {
      const page = await browser.newPage();
      try {
        await page.setViewport({width,height:844});
        const response = await page.goto(origin+'/'+route+'/',{waitUntil:'load',timeout:15000});
        assert.equal(response?.status(),200);
        await page.evaluate(entries => {
          for (const [id,value] of entries) {
            const input = document.getElementById(id);
            if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) throw new Error('Missing input: '+id);
            input.value = String(value);
            input.dispatchEvent(new Event('input',{bubbles:true}));
            input.dispatchEvent(new Event('change',{bubbles:true}));
          }
        }, Object.entries(values));
        for (const [id,expected] of Object.entries(results)) {
          const actual = await page.$eval('#'+id, el=>el.innerText);
          assert.match(actual,expected,route+' result '+id+' got '+actual);
        }
        for (const [id,expected] of Object.entries(fieldResults)) {
          const actual=await page.$eval('#'+id, el=>el.value);
          assert.equal(actual,String(expected),route+' field '+id);
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
