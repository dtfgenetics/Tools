import fs from 'node:fs';

const html=fs.readFileSync('site/public-route-patch/ipm-scout/index.html','utf8');
const shared=fs.readFileSync('site/public-route-patch/assets/thc-timeseries-chart-v1.mjs','utf8');

function ok(value,message){ if(!value) throw new Error(message); }

for(const marker of [
  '/assets/vendor/uplot-1.6.32.min.js',
  '/assets/vendor/uplot-1.6.32.min.css',
  '/assets/thc-timeseries-chart-v1.mjs',
  'id="ipmTrendChart"',
  'Observed count',
  'User threshold',
  'function drawTrendChart(rows)',
  'renderTimeSeriesChart(ipmTrendChart',
  "dateKey:r=>r.date+'T12:00:00'",
  'A rising trend is descriptive evidence, not an organism diagnosis.'
]) ok(html.includes(marker),`IPM Scout trend missing: ${marker}`);

ok(html.includes("emptyText:'Save at least two records on this route to draw a trend.'"),'IPM chart must require repeated observations before drawing a trend');
ok(html.includes('fallbackContainer:ipmTrendFallback'),'IPM chart must preserve accessible fallback data');
ok(shared.includes("cursor:{drag:{x:true,y:false,setScale:true}}"),'Shared time-series chart must preserve zoom/cursor interaction');
ok(html.includes("window.addEventListener('resize'"),'IPM chart must resize with the viewport');
ok(!html.includes('new window.uPlot'),'IPM chart must use the shared time-series renderer');
for(const marker of [
  'id="historyRouteFilter"',
  'Review one route / trap',
  'data-edit-index',
  'function editRecord(index)',
  'function formRecord()',
  "historyRouteFilter.addEventListener('change',draw)",
  'id="clearScout"'
]) ok(html.includes(marker),`IPM record-management workflow missing: ${marker}`);
ok(html.includes('THC.backupJson'),'IPM must keep the shared JSON backup helper');
ok(html.includes('THC.restoreJson'),'IPM must keep the shared JSON restore helper');
ok(html.includes('csvTable('),'IPM must keep the shared CSV escaping helper');

console.log('IPM Scout trend-chart contract passed.');
