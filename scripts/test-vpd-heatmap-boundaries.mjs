import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync('site/public-route-patch/vpd-chart/index.html','utf8');
const start = source.indexOf('function render(){');
const end = source.indexOf('\nfunction chooseHeatmapCell(',start);
assert.ok(start >= 0 && end > start, 'VPD render function must exist');
function render(air, humidity, fahrenheit = false) {
  const chart = {innerHTML:''};
  const convert = c => fahrenheit ? c*9/5+32 : c;
  const context = {
    chart, vout:{innerHTML:''}, scenario:{innerHTML:''},
    temp:{value:String(convert(air)),min:String(convert(5)),max:String(convert(45))},
    rh:{value:String(humidity)}, offset:{value:'0'}, unit:{value:fahrenheit?'f':'c'}, leafMode:{value:'same'},
    syncLeafFields(){}, toC:t=>fahrenheit?(t-32)*5/9:t, deltaC:t=>fahrenheit?t*5/9:t,
    currentLeaf:t=>t, fromC:convert, rawCalc:()=>1, airVpd:()=>1, dewPoint:()=>0,
    targetRange:()=>null, band:()=> 'mod',
  };
  vm.runInNewContext(source.slice(start,end)+'\nrender();',context);
  return [...chart.innerHTML.matchAll(/<td\b([^>]*)>/g)].map(([,attrs]) => ({
    air:Number(attrs.match(/data-air="([^"]+)"/)[1]),
    rh:Number(attrs.match(/data-rh="([^"]+)"/)[1]),
    active:/class="[^"]*\bactive\b/.test(attrs),
  }));
}
for (const [air,rh] of [[5,1],[45,100],[26,60],[5,100],[45,1],[25,96],[25,2]]) {
  for (const fahrenheit of [false,true]) {
    const cells=render(air,rh,fahrenheit);
    assert.ok(cells.length > 0);
    assert.ok(cells.every(cell=>cell.air>=5&&cell.air<=45&&cell.rh>=1&&cell.rh<=100), 'Every selectable cell must remain within supported inputs');
    assert.equal(new Set(cells.map(cell=>cell.air+','+cell.rh)).size,cells.length,'Heatmap must not duplicate boundary combinations');
    const active=cells.filter(cell=>cell.active);
    assert.equal(active.length,1,'Exactly one cell represents current conditions');
    assert.equal(active[0].air,air);
    assert.equal(active[0].rh,rh);
  }
}
console.log('VPD heatmap: 14 boundary/interior/unit scenarios passed.');
