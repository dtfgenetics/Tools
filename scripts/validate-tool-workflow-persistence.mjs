import fs from 'node:fs';
const read=slug=>fs.readFileSync('site/public-route-patch/'+slug+'/index.html','utf8');
const errors=[];const ok=(v,m)=>{if(!v)errors.push(m)};
const hub=read('tools');
for(const token of ['id="toolSearch"','tool-search-status','matching tool','tool-hidden']) ok(hub.includes(token),'Tools hub search missing '+token);
const breeder=read('breeder-pedigree');
for(const token of ['Backup JSON','Restore JSON','data-edit','data-delete','Unsupported pedigree backup format','const esc=']) ok(breeder.includes(token),'Breeder workflow missing '+token);
const env=read('environment-control');
for(const token of ['Export CSV','Print / Save report','Backup JSON','Restore JSON','thc-environment-history-backup.json','environment-history.csv','Unsupported environment backup format','id="zoneFilter"','function filteredHistory()','zoneFilterStatus','thc-environment-guardrail-profiles-v1','Save guardrail profile','function guardrails()','guardrails:g','refreshGuardrailProfiles','function alertMessages','alerts:alertMessages(x,g)','<th>Alerts</th>']) ok(env.includes(token),'Environment persistence missing '+token);
const ipm=read('ipm-scout');
for(const token of ['Backup JSON','Restore JSON','data-delete-index','thc-ipm-scout-backup.json','Unsupported IPM backup format']) ok(ipm.includes(token),'IPM persistence missing '+token);
const shared=fs.readFileSync('site/public-route-patch/assets/thc-tool-suite-v1.js','utf8');
for(const token of ['backupJson','restoreJson','Unsupported backup format.','Backup contains no valid records.','window.THC={growlens,backupJson,restoreJson,esc,num:']) ok(shared.includes(token),'Shared backup runtime missing '+token);
for(const [slug,tokens] of [
 ['root-zone-temperature',['Backup JSON','Restore JSON','thc-root-zone-history-backup.json']],
 ['photoperiod-planner',['Backup JSON','Restore JSON','thc-photoperiod-schedules-backup.json']],
 ['dry-cure-lab',['Backup JSON','Restore JSON','thc-dry-cure-checkpoints-backup.json','Print / Save report','Staged dry / cure program','Slope · gradual transition','Step · hold then change','thc-dry-cure-programs-v1','function rhFromDew','function programStages','saveProgram.onclick','THC.esc(x.lot)']],
 ['dryback-lab',['Backup JSON','Restore JSON','thc-dryback-events-backup.json','Print / Save report','id="dryZoneFilter"','History filter & summary','avgDryback','dryFilterStatus']],
 ['water-quality-lab',['Backup JSON','Restore JSON','thc-water-quality-history-backup.json','Print / Save report','id="waterSourceFilter"','Filtered source summary','function filteredHistory()','avgPh','waterFilterStatus']]
]){const html=read(slug);for(const token of tokens)ok(html.includes(token),slug+' backup workflow missing '+token)}
const fert=read('fertigation-lab');
for(const token of ['Save recipe locally','Saved recipe library','thc-fertigation-recipes-v1','data-load-recipe','data-delete-recipe','thc-fertigation-recipes-backup.json','Current scope and calculation boundaries','Source-water N (mg/L)','Source-water Ca (mg/L)',"THC.num('sw'+k)",'sourceWater:Object.fromEntries','Load latest Water Lab Ca/Mg',"THC.load('thc-water-quality-history-v1'",'Loaded latest Water Lab Ca/Mg','function nutrientSummary(values)','nutrientSummary(r.sourceWater)','nutrientSummary(r.targets)','esc(r.name||\'Recipe\')','data-load-recipe="\'+esc(r.id)+\'"']) ok(fert.includes(token),'Fertigation recipe library missing '+token);
ok((fert.match(/<th>/g)||[]).length>=6,'Fertigation saved recipe table must expose source and target nutrient columns plus actions'); ok(!fert.includes('The next version will'),'Fertigation still contains roadmap wording instead of current limitations');
for(const [slug,tokens] of [
 ['water-quality-lab',['THC.esc(x.date)','THC.esc(x.source)']],
 ['dryback-lab',['THC.esc(x.zone)','THC.esc(x.phase)']],
 ['environment-control',['THC.esc(x.zone)']],
 ['ipm-scout',['THC.esc(x.routeId)','THC.esc(x.finding)','THC.esc(x.severity)']]
]){const html=read(slug);for(const token of tokens)ok(html.includes(token),slug+' restored-history output escaping missing '+token)}
const dryback=read('dryback-lab');
for(const token of ['thc-fertigation-dryback-handoff-v1','Fertigation context','feed?.recipe?.name','sourceWater:feed?.sourceWaterName','steering_phase,event_phase,mode,feed_recipe,source_water,feed_ec_ms_cm,root_ec_ms_cm','root_minus_feed_ec','target_dryback_low','target_dryback_high']) ok(dryback.includes(token),'Dryback fertigation handoff missing '+token);
for(const token of ['Use in Dryback Lab','thc-fertigation-dryback-handoff-v1',"window.location.href='/dryback-lab/'",'mixedVolumeL']) ok(fert.includes(token),'Fertigation to Dryback handoff missing '+token);
const vpd=read('vpd-chart');
for(const token of ['Save current to GrowLens','Backup JSON','Restore JSON','thc-vpd-profiles-backup.json','thc-vpd-profiles','THC.growlens.addEnvironmentReading']) ok(vpd.includes(token),'VPD workflow integration missing '+token);
const ppfd=read('ppfd-chart');
for(const token of ['Save current to GrowLens','Backup workspace','Restore workspace','thc-light-lab-workspace-backup.json','thc-light-lab-workspace','THC.growlens.addDiaryEntry','readCalibrationProfiles()','readSessions()']) ok(ppfd.includes(token),'Light Lab workflow integration missing '+token);
const unit=read('unit-converter');
for(const token of ['Conversion snapshot','thc-unit-converter-snapshots-v1','Save snapshot','Save to GrowLens','Export CSV','Backup JSON','Restore JSON']) ok(unit.includes(token),'Unit Converter workflow missing '+token);
const ph=read('ph-meter');
for(const token of ['Save current to GrowLens','Backup JSON','Restore JSON','thc-ph-measurements-backup.json','thc-ph-measurements-v1','THC.growlens.addDiaryEntry']) ok(ph.includes(token),'pH journal integration missing '+token);
const tds=read('tds-meter');
for(const token of ['Save current to GrowLens','Backup JSON','Restore JSON','thc-ec-measurements-backup.json','thc-ec-measurements-v1','THC.growlens.addDiaryEntry']) ok(tds.includes(token),'EC/TDS journal integration missing '+token);
const dew=read('dew-point');
for(const token of ['Load latest Environment reading','thc-environment-history-v1','thc-dew-point-history-v1','Save to GrowLens','Export CSV','Backup JSON','Restore JSON','THC.esc(x.surfaceName)']) ok(dew.includes(token),'Dew Point connected workflow missing '+token);
const vent=read('co2-ventilation');
for(const token of ['thc-ventilation-plans-v1','Save plan','Save to GrowLens','Export CSV','Backup JSON','Restore JSON','Saved ventilation plans','THC.esc(x.room)']) ok(vent.includes(token),'Ventilation planning workflow missing '+token);
const dilution=read('dilution-calculator');
for(const token of ['thc-dilution-plans-v1','Solution / material','Save plan','Save to GrowLens','Export CSV','Backup JSON','Restore JSON','Saved dilution plans','THC.esc(x.name)']) ok(dilution.includes(token),'Dilution planning workflow missing '+token);
const growth=read('plant-growth-tracker');
for(const token of ['Print / Save report','Filtered growth summary','avgHeightRate','avgNodeRate','heightRateDelta','growthFilterStatus','printGrowth.onclick']) ok(growth.includes(token),'Plant Growth analysis workflow missing '+token);
if(errors.length){console.error('Tool workflow persistence validation failed:');for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log('Tool workflow persistence validation passed.');
