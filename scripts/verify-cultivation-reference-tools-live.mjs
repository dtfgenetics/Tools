#!/usr/bin/env node
import process from 'node:process';

const baseUrl = String(process.env.DTF_SITE_URL || 'https://dtfseeds.com').replace(/\/$/, '');
const tag = process.env.GITHUB_RUN_ID || Date.now().toString();

const routes = [
  { path: '/tools/', markers: ['Cultivation reference tools', 'Plant Atlas', 'Terpene Atlas', 'pH Meter', 'TDS / EC Meter', 'VPD Chart', 'PPFD / DLI'] },
  { path: '/atlas/', markers: ['THC Living Plant Atlas', 'All Tools'] },
  { path: '/terpene-atlas/', markers: ['THC Terpene Atlas', 'All Tools'] },
  { path: '/ph-meter/', markers: ['pH Meter', 'All Tools', 'This page does not measure pH by itself', 'expectedSamplePh', 'renderCalibrationPair', 'Do not pour used buffer back into the stock bottle'] },
  { path: '/tds-meter/', markers: ['TDS / EC Meter', 'All Tools', '500 convention', '640 approximation', '650 meter convention', '700 convention', 'previousEcUnit', 'not proof of the meter setting', 'laboratory gravimetric measurement of total dissolved solids'] },
  { path: '/vpd-chart/', markers: ['VPD Chart', 'All Tools', 'Leaf offset', 'Low-demand reference', 'Moderate reference', 'Higher-demand reference', 'Dew-boundary rows', 'normalizeVpdProfile', "from '/assets/thc-cultivation-data-ui-v1.mjs'", "from '/assets/thc-cultivation-math-v1.mjs'", "from '/assets/thc-measurement-core-v1.mjs'", 'syncRangesFromNumbers();render();'] },
  { path: '/ppfd-chart/', markers: ['THC Light Lab', 'All Tools', 'Canopy mapper', 'Survey record', 'Variable-light DLI schedule', 'Import full survey', 'Measurement protocol', 'Metric (m / cm)', 'Sensor calibration / check date', 'Setup differs in', 'Direct comparison caution:', 'Skip to Light Lab', 'THC Light Lab — Survey Report', 'Delta vs baseline', 'paired readings', 'Within ±10% of average', 'Perimeter ÷ center average', 'Approx. point spacing', 'not universal target bands', 'DLI is withheld until the time blocks fit within one day.', 'normalizeImportedSurvey', "return{x:w/(c-1),y:d/(r-1)", 'CSV grid must be between 3×3 and 9×9.'] },
  { path: '/unit-converter/', markers: ['THC Cultivation Unit Converter', 'All Tools', 'Conductivity', 'normalizeSnapshot', 'Non-temperature measurements cannot be negative.', 'Backup contains no valid conversion snapshots.'] },
  { path: '/dilution-calculator/', markers: ['THC Solution Dilution Calculator', 'All Tools', 'Serial dilution steps', 'normalizePlan', 'No dilution amount is reported until the inputs are valid.', 'Backup contains no valid dilution plans.'] },
  { path: '/root-zone-temperature/', markers: ['THC Root-Zone Temperature Reference', 'All Tools', 'Root-zone trend', 'Backup JSON', 'normalizeRootRecord', 'Backup contains no valid root-zone readings.', 'recalculated from canonical measurements', 'cannot be below absolute zero', "timings=['Lights on','Lights off','Before irrigation','After irrigation']", 'id="rootOut" aria-live="polite"'] },
  { path: '/plant-growth-tracker/', markers: ['THC Plant Growth Tracker', 'All Tools', 'Filtered growth summary', 'Growth trend', 'growthLineChart', 'normalizeGrowthRecord', 'Backup contains no valid plant-growth intervals.', 'growth rates recalculated from canonical measurements', 'safePhotoLink(x.photoRef)', 'id="growthOut" aria-live="polite"'] },
  { path: '/photoperiod-planner/', markers: ['THC Photoperiod & Lighting Schedule', 'All Tools', 'Compare saved schedules', 'Backup JSON', 'normalizeSchedule', 'Backup contains no valid photoperiod schedules.', 'effective hours and DLI recalculated from canonical inputs'] },
  { path: '/co2-ventilation/', markers: ['THC Ventilation & CO₂ Reference', 'All Tools', 'target ACH', 'normalizeVentPlan', 'Backup contains no valid ventilation plans.', 'recalculated from canonical inputs', 'ACH is a room-air exchange calculation, not a CO₂ exposure or enrichment target'] },
  { path: '/breeder-pedigree/', markers: ['DTF Breeding & Pedigree Builder', 'Backup JSON', 'Interactive lineage network', 'normalizeBreederRecord', 'normalizePedigreeCollection', 'Backup contains no structurally valid pedigree records.', 'graph-integrity validation'] },
  { path: '/grow-planner/', markers: ['THC Grow Cycle Planner', 'Backup JSON', 'Cycle timeline', 'normalizeGrowPlan', 'buildPlanStages', 'Backup contains no valid grow plans.', 'Stage dates were recalculated from each saved start date and canonical stage durations.'] },
  { path: '/ipm-scout/', markers: ['THC IPM Scout', 'Backup JSON', 'Selected route trend', 'normalizeScoutRecord', 'Backup contains no valid IPM scouting records.', 'date, route, area, severity, count and threshold validation'] },
  { path: '/substrate-calculator/', markers: ['THC Substrate & Container Calculator', 'All Tools', 'Purchase overage', 'Component percentages must total 100% before this plan can be saved.', 'normalizePlan', 'Backup contains no valid substrate plans.'] },
  { path: '/dry-cure-lab/', markers: ['THC Dry & Cure Lab', 'All Tools', 'Save harvest to GrowLens', 'Backup JSON', 'normalizeDryCheckpoint', 'normalizeDryProgram', 'Backup contains no valid dry/cure checkpoints or programs.', 'weight-loss, dew-point, and program deltas recalculated from canonical measurements'] },
  { path: '/environment-control/', markers: ['THC Environmental Control Center', 'All Tools', 'Environment history trend', 'vpdChart', 'Latest history', 'Backup JSON', 'normalizeEnvironmentRecord', 'normalizeGuardrailProfile', 'Backup contains no valid environment readings.', 'VPD, dew point, DLI, and alerts recalculated from canonical measurements.', 'Optional telemetry dashboard failed to mount.', 'Optional telemetry alert board failed to mount.', 'Optional live environment adapter failed to mount.'] },
  { path: '/dew-point/', markers: ['THC Dew Point & Condensation Lab', 'All Tools', 'dew point', 'normalizeDewRecord', 'Backup contains no valid dew-point checks.', 'recalculated from stored air, RH and surface temperature'] },
  { path: '/dryback-lab/', markers: ['THC Irrigation & Dryback Lab', 'All Tools', 'History filter & summary', 'Irrigation / dryback history trend', 'drybackChart', 'Backup JSON', 'normalizeDrybackEvent', "raw={low:THC.num('dry'),wet:THC.num('wet'),current:THC.num('current'),hours:THC.num('hours')", 'raw-input events were recalculated from canonical measurements.'] },
  { path: '/fertigation-lab/', markers: ['THC Fertigation Lab', 'All Tools', 'Target vs achieved recipe worksheet', 'Source-water N (mg/L)', 'Saved recipe library', 'normalizeFertigationRecipe', 'normalizeMixRecord', 'Backup contains no valid fertigation workspace records.', 'final pH must be 0–14 when entered'] },
  { path: '/water-quality-lab/', markers: ['THC Water Quality Lab', 'All Tools', 'Change from prior report', 'Backup JSON', 'normalizeSavedWaterReport', 'Backup contains no valid water-quality reports.', 'full chemistry, date, pH, EC and temperature validation'] },
];

const errors = [];

const assets = [
  { path: '/assets/thc-tool-suite-v1.js', markers: ['thc-cultivation-context-v1', 'addEnvironmentReading', 'addIrrigationRecord', 'backupJson', 'restoreJson'] },
  { path: '/assets/thc-tool-suite-v1.css', markers: ['.top', '.shell', '.fields'] },
  { path: '/assets/thc-measurement-journal-v1.js', markers: ['THCMeasurementJournal', 'create'] },
  { path: '/assets/thc-cultivation-data-ui-v1.mjs', markers: ['export function collectManualCultivationMeasurement'] },
  { path: '/assets/thc-cultivation-math-v1.mjs', markers: ['export function dliFromPpfd', 'export function serialDilution', 'export function deliveredCfmForAirChanges', 'export function relativeHumidityForLeafVpd'] },
  { path: '/assets/thc-measurement-core-v1.mjs', markers: ['export function evaluateBandSeries', 'export function normalizeHeader'] },
  { path: '/assets/thc-light-lab-math-v1.mjs', markers: ['calculateStableLight', 'calculateVariableLight', 'dliRangeForMap'] },
  { path: '/assets/vendor/papaparse-5.7.0.min.js', markers: ['Papa'] },
  { path: '/assets/vendor/uplot-1.6.32.min.js', markers: ['uPlot'] },
  { path: '/assets/vendor/uplot-1.6.32.min.css', markers: ['.uplot'] },
  { path: '/assets/breeder-pedigree-graph-v1.js', markers: ['THCBreederGraph', 'cytoscape'] },
  { path: '/assets/vendor/cytoscape-3.34.3.min.js', markers: ['cytoscape'] },
];


for (const route of routes) {
  const url = new URL(route.path, baseUrl);
  url.searchParams.set('dtf_cultivation_tools_verify', tag);
  let response;
  let body = '';
  try {
    response = await fetch(url, {
      redirect: 'manual',
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache',
        'User-Agent': 'DTFSeeds-Cultivation-Reference-Verification/1.0',
      },
      signal: AbortSignal.timeout(20000),
    });
    body = await response.text();
  } catch (error) {
    errors.push(`${route.path}: request failed: ${error.message}`);
    continue;
  }

  if (response.status !== 200) {
    errors.push(`${route.path}: expected HTTP 200, received ${response.status}`);
    continue;
  }
  if (response.headers.get('location')) {
    errors.push(`${route.path}: unexpected redirect to ${response.headers.get('location')}`);
  }
  if (body.length < 500) {
    errors.push(`${route.path}: response is suspiciously small (${body.length} bytes)`);
  }
  for (const marker of route.markers) {
    if (!body.toLowerCase().includes(marker.toLowerCase())) {
      errors.push(`${route.path}: missing live marker: ${marker}`);
    }
  }
}

if (errors.length) {
  console.error(`Cultivation reference live verification failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}


for (const asset of assets) {
  const url = new URL(asset.path, baseUrl);
  url.searchParams.set('dtf_cultivation_assets_verify', tag);
  let response;
  let body = '';
  try {
    response = await fetch(url, {
      redirect: 'manual',
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache',
        'User-Agent': 'DTFSeeds-Cultivation-Asset-Verification/1.0',
      },
      signal: AbortSignal.timeout(20000),
    });
    body = await response.text();
  } catch (error) {
    errors.push(`${asset.path}: asset request failed: ${error.message}`);
    continue;
  }

  if (response.status !== 200) {
    errors.push(`${asset.path}: expected HTTP 200, received ${response.status}`);
    continue;
  }
  if (body.length < 50) {
    errors.push(`${asset.path}: asset response is suspiciously small (${body.length} bytes)`);
  }
  for (const marker of asset.markers) {
    if (!body.includes(marker)) errors.push(`${asset.path}: missing live asset marker: ${marker}`);
  }
}

if (errors.length) {
  console.error(`Cultivation shared-asset live verification failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('Cultivation reference live verification passed for the tools hub, atlases, and the complete canonical cultivation tool suite plus shared runtime assets.');
