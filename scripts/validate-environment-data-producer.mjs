import fs from 'node:fs';

const sourcePath='site/public-route-patch/environment-control/index.html';
const source=fs.readFileSync(sourcePath,'utf8');
const errors=[];

const valuesMatch=source.match(/function values\(\)\{([\s\S]*?)\nfunction alertMessages/);
if(!valuesMatch)errors.push('Environment Center values() function was not found.');
const valuesBody=valuesMatch?.[1]||'';
for(const token of ['t','rh','l','v','dew']){
  if(!new RegExp('\\b'+token+'\\b').test(valuesBody))errors.push('values() does not expose '+token);
}

const collectMatch=source.match(/collectManualCultivationMeasurement\(\{type:'environment'[\s\S]*?metrics:\{([^}]*)\}/);
if(!collectMatch)errors.push('Environment Center canonical measurement collector was not found.');
const metrics=collectMatch?.[1]||'';

const expected=[
  ['temperatureC','x.t'],
  ['humidityPercent','x.rh'],
  ['leafTemperatureC','x.l'],
  ['vpdKpa','x.v'],
  ['dewPointC','x.dew']
];
for(const [metric,expression] of expected){
  if(!metrics.includes(metric+':'+expression))errors.push(metric+' must emit '+expression);
}
for(const stale of ['leafTemperatureC:x.leaf','vpdKpa:x.vpd']){
  if(metrics.includes(stale))errors.push('stale Environment Center metric expression remains: '+stale);
}

if(errors.length){
  console.error('Environment Center data producer validation failed:');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('Environment Center canonical measurement fields validated.');
