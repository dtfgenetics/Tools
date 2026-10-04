import fs from 'node:fs';
import path from 'node:path';
import {leafVpd,ecToDisplayedPpm,displayedPpmToEc} from '../site/public-route-patch/assets/thc-cultivation-math-v1.mjs';
import {calculateVariableLight} from '../site/public-route-patch/assets/thc-light-lab-math-v1.mjs';

const root = process.cwd();
const files = {
  hub: 'site/public-route-patch/tools/index.html',
  ph: 'site/public-route-patch/ph-meter/index.html',
  tds: 'site/public-route-patch/tds-meter/index.html',
  vpd: 'site/public-route-patch/vpd-chart/index.html',
  ppfd: 'site/public-route-patch/ppfd-chart/index.html',
};

const read = (key) => fs.readFileSync(path.join(root, files[key]), 'utf8');
const hub = read('hub');
const ph = read('ph');
const tds = read('tds');
const vpd = read('vpd');
const ppfd = read('ppfd');
const errors = [];
const assert = (ok, msg) => { if (!ok) errors.push(msg); };

for (const route of ['/atlas/', '/terpene-atlas/', '/ph-meter/', '/tds-meter/', '/vpd-chart/', '/ppfd-chart/']) {
  assert(hub.includes(`href="${route}"`) || hub.includes(`href='${route}'`), `tools hub missing ${route}`);
}
assert((hub.match(/target="_blank"/g) || []).length  >= 6, 'tools hub must open all six reference launchers in a new tab');
for (const label of ['Plant Atlas', 'Terpene Atlas', 'pH Meter', 'TDS / EC Meter', 'VPD Chart', 'PPFD / DLI']) {
  assert(hub.includes(label), `tools hub missing visible label: ${label}`);
}

const canonical = [
  ['/', 'Home'], ['/seeds/', 'Seeds'], ['/learn/', 'Learn'], ['/courses/', 'Courses'],
  ['/tools/', 'Tools'], ['/games/', 'Games'], ['/community/', 'Community'], ['/shop/', 'Shop'],
];
for (const [fileKey, html] of [['ph', ph], ['tds', tds], ['vpd', vpd], ['ppfd', ppfd]]) {
  assert(html.includes('href="/tools/"'), `${files[fileKey]} missing central All Tools return link`);
  for (const [route, label] of canonical) {
    assert(html.includes(`href="${route}"`), `${files[fileKey]} missing canonical route ${route} (${label})`);
  }
  for (const route of ['/atlas/', '/terpene-atlas/']) {
    assert(html.includes(`href="${route}"`), `${files[fileKey]} missing cross-reference ${route}`);
  }
}

assert(ph.includes('type="number"') && ph.includes('min="0"') && ph.includes('max="14"'), 'pH page must constrain readings to 0-14');
assert(ph.includes("v<7?'acidic':v>7?'alkaline':'neutral'"), 'pH page must classify acidic/neutral/alkaline readings');
assert(ph.includes('5.5') && ph.includes('6.5') && ph.includes('6.0') && ph.includes('7.0'), 'pH page missing broad cultivation reference windows');
assert(ph.includes('pH measurement journal') && ph.includes("thc-ph-measurements-v1"), 'pH page missing local measurement journal');
assert(ph.includes('phRange') && ph.includes('Check a calibration buffer reading') && ph.includes('bufferCheckOut'), 'pH workbench missing touch slider or calibration-buffer verification');
assert(ph.includes('phSampleTemp') && ph.includes("header:'temperature_C'"), 'pH journal missing sample-temperature preservation');
assert(ph.includes('Why pH is logarithmic') && ph.includes('1 pH unit = 10×'), 'pH workbench missing logarithmic pH explanatory visual');
assert(ph.includes('href="/water-quality-lab/"') && ph.includes('href="/fertigation-lab/"') && ph.includes('href="/tds-meter/"'), 'pH workbench missing connected water/fertigation/EC links');
assert(ph.includes('Probe care:') && ph.includes('not plain distilled/deionized water'), 'pH workbench missing electrode storage guidance');
assert(ph.includes('Meter / probe ID') && ph.includes('Last calibration') && ph.includes('Export CSV') && ph.includes('Import CSV'), 'pH journal missing meter/calibration or CSV workflow');
assert(ph.includes('Print / Save report') && ph.includes("printPhReport').onclick=()=>window.print()"), 'pH journal missing printable report workflow');
assert(ph.includes('phCalibrationStatus') && ph.includes('phCalibrationRefs') && ph.includes('/assets/thc-meter-core-v1.mjs') && ph.includes('calibrationState') && ph.includes('Common pH reference buffers include 4.00, 7.00 and 10.00'), 'pH journal missing shared calibration status or buffer reference tracking');
assert(ph.includes("header:'calibration_refs'"), 'pH CSV journal must preserve calibration reference buffers');
assert(ph.includes('/assets/vendor/uplot-1.6.32.min.js') && ph.includes('/assets/vendor/papaparse-5.7.0.min.js') && ph.includes('/assets/thc-measurement-journal-v1.js'), 'pH journal must use shared uPlot/Papa Parse measurement stack');
assert(ph.includes('expectedSamplePh') && ph.includes('renderCalibrationPair') && ph.includes('pH 4 + pH 7') && ph.includes('pH 7 + pH 10'), 'pH workbench missing expected-sample bracketing buffer guidance');
assert(ph.includes('Do not pour used buffer back into the stock bottle') && ph.includes('do not return used buffer to its stock bottle'), 'pH calibration guidance missing buffer contamination safeguards');
assert(ph.includes('distilled or deionized water') && ph.includes('temperature-handling procedure'), 'pH calibration guidance missing storage or temperature handling safeguards');
assert(ph.includes('knowledge.hannainst.com/en/knowledge/generalized-calibration-ph-electrode-meter') && ph.includes('nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P101069X.txt'), 'pH workbench missing calibration evidence links');
assert(ph.includes(':focus-visible') && ph.includes('outline:3px solid'), 'pH workbench missing visible keyboard focus treatment');

assert(tds.includes('500 convention') && tds.includes('640 approximation') && tds.includes('650 meter convention') && tds.includes('700 convention') && tds.includes('× 500') && tds.includes('× 640') && tds.includes('× 650') && tds.includes('× 700'), 'TDS page missing 500/640/650/700 scale explanation');
assert(tds.includes('/assets/thc-cultivation-math-v1.mjs') && tds.includes('ecToDisplayedPpm'), 'TDS converter missing shared EC-to-ppm conversion');
assert(tds.includes('inferDisplayedPpmScale') && tds.includes('Identify an unknown ppm scale'), 'TDS workbench missing meter scale identification');
assert(tds.includes('Solution increase above source water') && tds.includes('renderDelta'), 'TDS workbench missing source-water delta utility');
assert(tds.includes('How EC becomes displayed ppm') && tds.includes('same EC · different display'), 'TDS workbench missing scientific EC/ppm explanatory visual');
assert(tds.includes('ppm640') && tds.includes('ppm650') && tds.includes("header:'tds_640_approx'") && tds.includes("header:'ppm_650'"), 'TDS journal missing 640/650-scale preservation');
assert(tds.includes('href="/water-quality-lab/"') && tds.includes('href="/fertigation-lab/"'), 'TDS workbench missing water-quality or fertigation cross-links');
assert(tds.includes('1.413 mS/cm (1413 µS/cm)') && tds.includes('904 ppm at ×640') && tds.includes('918 ppm at ×650') && tds.includes('989 ppm at ×700'), 'TDS calibration context missing common 1413 µS/cm cross-scale reference');
assert(tds.includes('displayedPpmToEc') && tds.includes("v.toFixed(2)"), 'TDS reverse conversion missing shared ppm-to-EC calculation');
assert(tds.includes('EC / TDS measurement journal') && tds.includes("thc-ec-measurements-v1"), 'TDS/EC page missing local measurement journal');
assert(tds.includes('Last calibration / check') && tds.includes('Sample temp (°C, optional)') && tds.includes('Export CSV') && tds.includes('Import CSV'), 'TDS/EC journal missing calibration, temperature, or CSV workflow');
assert(tds.includes('Print / Save report') && tds.includes("printEcReport').onclick=()=>window.print()"), 'TDS/EC journal missing printable report workflow');
assert(tds.includes('ecCalibrationStatus') && tds.includes('ecCalibrationStandard') && tds.includes('/assets/thc-meter-core-v1.mjs') && tds.includes('calibrationState') && tds.includes('1.413 mS/cm (1413 µS/cm)') && tds.includes('There is no universal calibration interval'), 'TDS/EC journal missing shared calibration status or conductivity-standard guidance');
assert(tds.includes("header:'calibration_standard'"), 'TDS/EC CSV journal must preserve calibration standard identity');
assert(tds.includes('/assets/vendor/uplot-1.6.32.min.js') && tds.includes('/assets/vendor/papaparse-5.7.0.min.js') && tds.includes('/assets/thc-measurement-journal-v1.js'), 'TDS/EC journal must use shared uPlot/Papa Parse measurement stack');
assert(tds.includes('max="20"') && tds.includes("ec.max=ecunit.value==='us'?'20000':'20'"), 'TDS/EC workbench must enforce shared 0-20 mS/cm journal bounds');
assert(tds.includes('previousEcUnit') && tds.includes("raw*1000") && tds.includes("raw/1000"), 'TDS/EC unit switch must preserve the physical conductivity value');
assert(tds.includes('Nearest configured factor:') && tds.includes('not proof of the meter setting') && !tds.includes('reasonably close to a 500/640/650/700'), 'TDS scale identifier must avoid arbitrary pass/fail confidence');
assert(tds.includes('laboratory gravimetric measurement of total dissolved solids'), 'TDS workbench must distinguish displayed conversion from measured TDS');
assert(tds.includes('temperature-compensated conductivity') && tds.includes('normalized to 25 °C'), 'TDS workbench missing conductivity temperature context');
assert(tds.includes('pubs.usgs.gov/publication/twri09A6.3') && tds.includes('knowledge.hannainst.com/en/knowledge/ec-tds-what-is-the-relationship-between-tds-and-ec'), 'TDS workbench missing authoritative EC/TDS references');
assert(tds.includes(':focus-visible') && tds.includes('outline:3px solid'), 'TDS workbench missing visible keyboard focus treatment');

assert(vpd.includes("/assets/thc-cultivation-math-v1.mjs") && vpd.includes('leafVpd'), 'VPD page missing shared leaf-VPD calculation');
assert(vpd.includes('Relative humidity (%)') && vpd.includes('Leaf offset'), 'VPD page missing required inputs');
assert(vpd.includes("u==='f'?(v-32)*5/9:v") && vpd.includes("v*9/5+32"), 'VPD page missing Celsius/Fahrenheit conversion support');
assert(vpd.includes('Logger CSV trend analysis') && vpd.includes('parseTrendCsv') && vpd.includes('drawTrend'), 'VPD page missing local CSV trend-analysis workflow');
assert(vpd.includes("['temperature','temp','air_temp','air_temperature'") && vpd.includes("['humidity','rh','relative_humidity'"), 'VPD CSV import missing flexible temperature/RH header mapping');
assert(vpd.includes('Analyzed '+"'"+'+rows.length+'+"'"+' valid logger rows locally in this browser.') && vpd.includes('Average VPD'), 'VPD trend workflow missing local-processing disclosure or summary metrics');
assert(vpd.includes('/assets/vendor/papaparse-5.7.0.min.js') && vpd.includes('window.Papa?.parse'), 'VPD page must use vendored Papa Parse with fallback support');
assert(vpd.includes('/assets/vendor/uplot-1.6.32.min.js') && vpd.includes('/assets/vendor/uplot-1.6.32.min.css') && vpd.includes('window.uPlot'), 'VPD logger must use vendored uPlot with canvas fallback');
assert(vpd.includes('Leaf temperature method') && vpd.includes('Measured leaf temperature') && vpd.includes("value=\"measured\""), 'VPD workbench missing measured-leaf input mode');
assert(vpd.includes('relativeHumidityForLeafVpd') && vpd.includes('Hold temperature: RH ≈') && vpd.includes('solveAirForTarget'), 'VPD workbench missing correction scenario solver');
assert(vpd.includes('airVpd') && vpd.includes('dewPoint') && vpd.includes('Dew point'), 'VPD workbench missing air-VPD or dew-point context');
assert(vpd.includes('Array.from({length:9}') && vpd.includes('Nearby condition heatmap'), 'VPD workbench missing expanded interactive heatmap');
assert(vpd.includes('Quick calculator') && vpd.includes('Logger') && vpd.includes('Measurement-first interpretation'), 'VPD workbench missing section navigation or education layer');
assert(vpd.includes('Condensation / dew risk') && vpd.includes('Leaf above dew point') && vpd.includes("rawCalc") && vpd.includes("'DEW'"), 'VPD workbench missing dew/condensation boundary handling');
assert(vpd.includes('targetPreset') && vpd.includes('Low-demand reference') && vpd.includes('Moderate reference') && vpd.includes('Higher-demand reference') && vpd.includes('not crop-stage prescriptions'), 'VPD workbench missing non-prescriptive teaching reference presets');
assert(vpd.includes('tempRange') && vpd.includes('rhRange') && vpd.includes('syncRangesFromNumbers'), 'VPD workbench missing touch-friendly range controls');
assert(vpd.includes('chartScrollHint') && vpd.includes('chartDewLegend') && vpd.includes('tabindex="0"') && vpd.includes('aria-describedby="chartScrollHint chartDewLegend"') && vpd.includes('position:sticky;left:0'), 'VPD heatmap missing mobile scroll guidance, dew legend, or sticky row labels');
assert(vpd.includes('href="/environment-control/"') && vpd.includes('href="/dew-point/"'), 'VPD workbench missing contextual Environment Center or Dew Point Lab links');
assert(vpd.includes('science-visual') && vpd.includes('Leaf VPD measurement model') && vpd.includes('dew point = condensation boundary'), 'VPD workbench missing scientific explanatory visual');
assert(vpd.includes("cursor:{drag:{x:true,y:false,setScale:true}}") && vpd.includes("fallback.hidden=false"), 'VPD uPlot integration must preserve zoom/cursor interaction and fallback rendering');
assert(vpd.includes('normalizeVpdProfile') && vpd.includes('Backup contains no valid VPD profiles.') && vpd.includes('Profile contains invalid temperature, RH, leaf-temperature, or target-band values.'), 'VPD saved-profile workflow missing restore/save validation');
assert(vpd.includes('Dew-boundary rows') && vpd.includes('trendDewRows') && vpd.includes("r.dew?'Yes':'No'"), 'VPD logger must preserve dew-boundary rows explicitly');
assert(vpd.includes('rawVpd=rawCalc') && vpd.includes('leaf<=dewPoint'), 'VPD logger must preserve raw dew-boundary detection before clamping display VPD');
assert(vpd.includes('min="5" max="45"') && vpd.includes("temp.min=unit.value==='f'?'41':'5'") && vpd.includes("leafMeasured.max=unit.value==='f'?'131':'55'"), 'VPD numeric controls must track Celsius/Fahrenheit operating bounds');
assert(vpd.includes('frontiersin.org/journals/plant-science/articles/10.3389/fpls.2022.893994/full') && vpd.includes('mdpi.com/2073-4395/9/7/392'), 'VPD workbench missing scientific VPD/transpiration references');
assert(vpd.includes(':focus-visible') && vpd.includes('outline:3px solid'), 'VPD workbench missing visible keyboard focus treatment');

const journalRuntime = fs.readFileSync(path.join(root, 'site/public-route-patch/assets/thc-measurement-journal-v1.js'), 'utf8');
assert(journalRuntime.includes('THCMeasurementJournal') && journalRuntime.includes('localStorage.setItem') && journalRuntime.includes('window.Papa?.parse') && journalRuntime.includes('window.uPlot'), 'shared measurement journal runtime missing persistence, CSV, or chart contracts');
assert(journalRuntime.includes('Browser storage is unavailable') && journalRuntime.includes('limit') && journalRuntime.includes('confirm('), 'shared measurement journal missing storage failure, record cap, or destructive-action safeguards');
const atlas = fs.readFileSync(path.join(root, 'site/public-route-patch/atlas/index.html'), 'utf8');
const terpenes = fs.readFileSync(path.join(root, 'site/public-route-patch/terpene-atlas/index.html'), 'utf8');
assert(ppfd.includes('/assets/thc-light-lab-math-v1.mjs') && ppfd.includes('calculateStableLight'), 'PPFD page missing shared stable-light DLI adapter');
assert(ppfd.includes('light.requiredPpfd'), 'PPFD page missing shared user-target DLI-to-PPFD result');
assert(ppfd.includes('id="ppfdGrid"') && ppfd.includes('min/avg*100') && ppfd.includes('sd/avg*100'), 'PPFD page missing canopy grid, uniformity, or coefficient-of-variation calculation');
assert(ppfd.includes('id="rows"') && ppfd.includes('id="cols"') && ppfd.includes('<option>3</option>') && ppfd.includes('<option>9</option>') && ppfd.includes('r*c'), 'PPFD page must preserve configurable 3×3 through 9×9 canopy mapping');
assert(ppfd.includes('Measurement method') && ppfd.includes('Manufacturer PPFD map') && ppfd.includes('variable sunlight or dimming schedules require integrated measurements over time'), 'PPFD page missing measurement-method or variable-light context');
assert(ppfd.includes('THC Light Lab') && ppfd.includes('Teaching Healthy Cultivation') && ppfd.includes('PAR vs ePAR'), 'PPFD page missing THC educational branding or PAR/ePAR education');
assert(ppfd.includes('targetMin') && ppfd.includes('targetMax') && ppfd.includes('inRange'), 'PPFD page must use user-defined target range analysis');
assert(ppfd.includes('Apogee DLI guidance') && ppfd.includes('LI-COR DLI logging') && ppfd.includes('Frontiers 2022') && ppfd.includes('Scientific Reports 2025'), 'PPFD page missing evidence links');
assert(ppfd.includes("STORAGE_KEY='thc-light-lab-surveys-v2'") && ppfd.includes("'thc-light-lab-surveys-v1'") && ppfd.includes('THC.save(STORAGE_KEY,legacy)') && ppfd.includes('THC.load(STORAGE_KEY,[])'), 'PPFD page missing v2 local survey persistence or v1 migration support');
assert(ppfd.includes('fixtureModel') && ppfd.includes('mountHeight') && ppfd.includes('sensorModel') && ppfd.includes('measurementDate'), 'PPFD page missing survey metadata fields');
assert(ppfd.includes("lines=['row,column,ppfd']") && ppfd.includes('FileReader') && ppfd.includes('Export map CSV'), 'PPFD page missing CSV round-trip workflow');
assert(ppfd.includes('/assets/vendor/papaparse-5.7.0.min.js') && ppfd.includes('window.Papa?.parse'), 'PPFD page must use vendored Papa Parse for robust CSV imports');
assert(ppfd.includes("window.print()") && ppfd.includes('Print / Save report'), 'PPFD page missing printable Light Report workflow');
assert(ppfd.includes("'use schedule'") && ppfd.includes('Browser storage is unavailable'), 'PPFD page missing variable-light or storage-failure safeguards');
assert(ppfd.includes('target low exceeds target high') && ppfd.includes("'fix range'"), 'PPFD page missing invalid target-range handling');
assert(ppfd.includes('compareSession') && ppfd.includes('renderComparison') && ppfd.includes('Average PPFD ') && ppfd.includes('Uniformity '), 'PPFD page missing live saved-survey comparison workflow');
assert(ppfd.includes('mapProgress') && ppfd.includes('legendbar') && ppfd.includes("'R'+rr+' · C'+cc"), 'PPFD page missing map completion, legend, or coordinate labeling');
assert(ppfd.includes('Export full survey') && ppfd.includes('THC.downloadJson(') && ppfd.includes('Copy summary'), 'PPFD page missing full-survey export or summary workflow');
assert(ppfd.includes('µmol·m⁻²·s⁻¹') && ppfd.includes('mol·m⁻²·day⁻¹ DLI'), 'PPFD page missing explicit PPFD/DLI units in primary output');
assert(ppfd.includes('600, 800 and 1,000') && ppfd.includes('150–700') && ppfd.includes('not universal target bands'), 'PPFD research context must distinguish tested study conditions from universal targets');
assert(ppfd.includes('fillReading') && ppfd.includes('clearMap') && ppfd.includes("stats.max/stats.min"), 'PPFD page missing map utility controls or spread analysis');
assert(ppfd.includes('Variable-light DLI schedule') && ppfd.includes('calculateVariableLight') && ppfd.includes('scheduleStats'), 'PPFD page missing shared variable-light DLI integration');
assert(ppfd.includes('Import full survey') && ppfd.includes('jsonFile') && ppfd.includes('formatVersion:2'), 'PPFD page missing full-survey JSON round trip');
assert(ppfd.includes("thc-light-lab-surveys-v1") && ppfd.includes("thc-light-lab-surveys-v2"), 'PPFD page must preserve legacy saved surveys during schema migration');
assert(ppfd.includes('Measurement protocol') && ppfd.includes('cosine response') && ppfd.includes('LI-COR DLI logging'), 'PPFD page missing professional measurement protocol guidance');
assert(ppfd.includes('validChoice') && ppfd.includes('boundedValue'), 'PPFD page missing imported-survey validation safeguards');
assert(ppfd.includes('within10') && ppfd.includes('within20') && ppfd.includes('edgeCenter') && ppfd.includes('pointSpacing'), 'PPFD page missing distribution, perimeter/center, or point-spacing map analysis');
assert(ppfd.includes('Min ÷ average (legacy)') && ppfd.includes('Uniformity needs more than one metric'), 'PPFD page must label min/average as a legacy metric and explain its limitations');
assert(ppfd.includes("Math.abs(v-stats.avg)<=stats.avg*.10") && ppfd.includes("Math.abs(v-stats.avg)<=stats.avg*.20"), 'PPFD page missing normalized distribution coverage calculations');
assert(ppfd.includes('edgeCenterStats') && ppfd.includes('spacingStats'), 'PPFD page missing edge/center or grid-spacing calculation helpers');
assert(ppfd.includes("return{x:w/(c-1),y:d/(r-1),unit:metric?'m':'ft'}"), 'PPFD point spacing must use intervals between measurement points');
assert(ppfd.includes("renderMapShape(){const metric=currentUnit()==='metric'") && ppfd.includes("metric?.3:1"), 'PPFD map aspect ratio must preserve sub-meter metric dimensions');
assert(ppfd.includes('CSV grid must be between 3×3 and 9×9.') && !ppfd.includes('CSV grid must be between 1×1 and 9×9.'), 'PPFD CSV import must match supported 3×3 through 9×9 grid sizes');
assert(ppfd.includes("dliForRecord=x.lightPattern==='variable'") && ppfd.includes("'invalid schedule'"), 'PPFD saved measurement/report DLI must follow the selected stable or variable-light workflow');
assert(ppfd.includes('Metric (m / cm)') && ppfd.includes('Imperial (ft / in)') && ppfd.includes('convertDimensions'), 'PPFD page missing metric/imperial dimension support');
assert(ppfd.includes('sensorCheckDate') && ppfd.includes('Sensor calibration / check date'), 'PPFD page missing sensor calibration/check documentation');
assert(ppfd.includes('comparableGeometry') && ppfd.includes('Setup differs in') && ppfd.includes('Direct comparison caution:'), 'PPFD comparison must warn when survey geometry or equipment differs');
assert(ppfd.includes("unit:metric?'m':'ft'") && ppfd.includes('renderUnitSystem'), 'PPFD spacing output must follow the selected unit system');
assert(ppfd.includes('Skip to Light Lab') && ppfd.includes('id="mainContent"'), 'PPFD page missing keyboard skip navigation');
assert(ppfd.includes('overflow-x:auto;flex-wrap:nowrap') && !ppfd.includes('@media(max-width:900px){.workspace,.mapper{grid-template-columns:1fr}.education,.researchgrid{grid-template-columns:1fr 1fr}.nav{display:none}'), 'PPFD page must preserve primary navigation on narrow viewports');
assert(ppfd.includes('.nav a{min-height:44px') && ppfd.includes('.tabs a{min-height:44px'), 'PPFD page missing robust touch target sizing');
assert(ppfd.includes('gridScrollHint') && ppfd.includes('tabindex="0" aria-describedby="gridScrollHint"'), 'PPFD heatmap missing small-screen scroll accessibility guidance');
assert(ppfd.includes('THC Light Lab — Survey Report') && ppfd.includes('updatePrintSummary') && ppfd.includes("beforeprint"), 'PPFD page missing printable survey summary workflow');
assert(ppfd.includes("const rr=Math.floor(i/c)+1,cc=i%c+1,box=document.createElement('label')"), 'PPFD grid must define row/column coordinates before accessible labels use them');
assert(ppfd.includes('Delta vs baseline') && ppfd.includes('deltaFor(i)') && ppfd.includes('comparisonCoverage'), 'PPFD page missing point-by-point baseline delta map or paired coverage analysis');
assert(ppfd.includes('partial survey') && ppfd.includes('paired readings'), 'PPFD page must disclose incomplete current or paired comparison maps');
assert(ppfd.includes('Delta map requires the same row and column grid'), 'PPFD delta map must reject incompatible baseline grids');
assert(ppfd.includes('normalizeImportedSurvey') && ppfd.includes('That survey contains invalid grid, light, geometry, or schedule data.'), 'PPFD full-survey imports must validate structure and bounded values before applying');
assert(ppfd.includes('Backup contains no valid Light Lab surveys or fixture profiles.') && ppfd.includes('workspace.surveys.map(normalizeImportedSurvey).filter(Boolean)'), 'PPFD workspace restore must filter invalid surveys and calibration profiles');
assert(ppfd.includes('Scheduled DLI withheld:') && ppfd.includes("x.unitSystem==='metric'?{height:'cm'}:{height:'in'}"), 'PPFD report summary must withhold impossible-day DLI and preserve fixture-height units');
assert(ppfd.includes("st.validDay&&st.dli!==null") && ppfd.includes('DLI is withheld until the time blocks fit within one day.'), 'PPFD variable-light UI must withhold DLI when schedule exceeds 24 hours');
assert(ppfd.includes("box.style.background=heat(v)") && ppfd.includes("heat(input.value)"), 'PPFD page must preserve blank map cells as unmeasured');
assert(ppfd.includes('href="/tools/"'), 'PPFD page missing central All Tools link');
assert(atlas.includes('href="/tools/"'), 'Plant Atlas missing central All Tools link');
assert(terpenes.includes('href="/tools/"'), 'Terpene Atlas missing central All Tools link');

const sample = Math.max(0, leafVpd(26,60,25));
const ppm500 = ecToDisplayedPpm(1.8,500);
const ecBack = displayedPpmToEc(900,500);
const scheduleDli = calculateVariableLight([{ppfd:300,hours:1},{ppfd:700,hours:10},{ppfd:300,hours:1}]).dli;
assert(sample > 0.9 && sample < 1.2, `Shared VPD sanity check failed: ${sample}`);
assert(ppm500===900 && Math.abs(ecBack-1.8)<1e-9, 'Shared EC/TDS conversion sanity check failed');
assert(Math.abs(scheduleDli - 27.36) < 1e-9, `Shared PPFD variable-light DLI sanity check failed: ${scheduleDli}`);

if (errors.length) {
  console.error(`Cultivation reference tool validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('Cultivation reference tool validation passed: hub links, canonical Tools navigation, pH/TDS journals, VPD/PPFD calculations, Light Lab survey workflows, and cross-references are intact.');
