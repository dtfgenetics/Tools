import {normalizeTelemetryPacket} from './thc-live-data-core-v1.mjs';
import {
  telemetryHealthSummary,
  zoneTelemetrySummary,
  telemetryMetricCoverage,
  telemetryTableModel
} from './thc-telemetry-dashboard-core-v1.mjs';

const COLLECTION_KEYS=['devices','deviceViewDtos','records','items','data','packets'];

const collectionRows=input=>{
  if(Array.isArray(input))return input;
  if(!input||typeof input!=='object')throw new Error('Telemetry collection must be an array or object collection.');
  for(const key of COLLECTION_KEYS)if(Array.isArray(input[key]))return input[key];
  return [input];
};

export function normalizeTelemetryCollection(input,options={}){
  return collectionRows(input)
    .filter(row=>row&&typeof row==='object'&&!Array.isArray(row))
    .map((row,index)=>normalizeTelemetryPacket(row,{
      sourceId:options.sourceId??row.sourceId??'batch-json',
      deviceId:row.deviceId??row.sensorId??row.id??row.guid??('device-'+(index+1)),
      zone:row.zone??row.room??row.roomName??options.zone
    }));
}

const LABELS={
  temperatureC:'Temperature °C',
  humidity:'RH %',
  vpd:'VPD kPa',
  co2:'CO₂ ppm',
  ppfd:'PPFD',
  ec:'EC mS/cm',
  ph:'pH',
  vwc:'VWC %',
  rootTemperatureC:'Root temp °C',
  leafTemperatureC:'Leaf temp °C',
  solutionTemperatureC:'Solution temp °C',
  dewPointC:'Dew point °C'
};

export function metricLabel(key){
  if(LABELS[key])return LABELS[key];
  return String(key||'').replace(/([a-z0-9])([A-Z])/g,'$1 $2');
}

const clear=node=>{while(node?.firstChild)node.removeChild(node.firstChild)};
const text=(doc,tag,value,className='')=>{
  const node=doc.createElement(tag);
  if(className)node.className=className;
  node.textContent=String(value??'');
  return node;
};

const appendCell=(doc,row,value)=>{
  const cell=doc.createElement('td');
  cell.textContent=value===null||value===undefined||value===''?'—':String(value);
  row.appendChild(cell);
};

export function mountTelemetryDashboard({
  container,
  defaultSourceId='batch-json',
  staleMinutes=10,
  metricKeys=['temperatureC','humidity','vpd','co2','ppfd','vwc','ec','ph','rootTemperatureC']
}={}){
  if(!container||typeof container.querySelector!=='function')throw new Error('Telemetry dashboard requires a container.');
  container.innerHTML=
    '<div class="panel"><h2>Multi-sensor snapshot</h2>'+
    '<p class="muted">Paste a read-only JSON array or provider response to compare the latest packet from each device and zone. This workspace is volatile and does not save sensor packets.</p>'+
    '<div class="fields">'+
    '<div class="field"><label>Source label</label><input data-telemetry-source value="'+String(defaultSourceId).replaceAll('"','&quot;')+'" autocomplete="off"></div>'+
    '<div class="field"><label>Stale after (minutes)</label><input data-telemetry-stale type="number" min="1" step="1" value="'+Math.max(1,Number(staleMinutes)||10)+'"></div>'+
    '</div>'+
    '<div class="field"><label>Telemetry collection JSON</label><textarea data-telemetry-json rows="8" spellcheck="false" placeholder=\'[{"deviceId":"sensor-1","zone":"Room A","createdAt":"2026-09-28T19:00:00Z","temperatureC":25,"humidity":60}]\'></textarea></div>'+
    '<div class="toolbar"><button class="btn primary" data-telemetry-load type="button">Load snapshot</button></div>'+
    '<div class="result" data-telemetry-status aria-live="polite">No multi-sensor snapshot loaded.</div>'+
    '<div class="metric-grid" data-telemetry-health></div>'+
    '<div class="grid2"><div><h3>Zone health</h3><div class="table-wrap"><table><thead><tr><th>Zone</th><th>Devices</th><th>Fresh</th><th>Stale</th></tr></thead><tbody data-telemetry-zones></tbody></table></div></div>'+
    '<div><h3>Metric coverage</h3><div class="table-wrap"><table><thead><tr><th>Metric</th><th>Devices reporting</th></tr></thead><tbody data-telemetry-coverage></tbody></table></div></div></div>'+
    '<h3>Latest device packets</h3><div class="table-wrap" tabindex="0"><table><thead data-telemetry-head></thead><tbody data-telemetry-body></tbody></table></div></div>';

  const doc=container.ownerDocument;
  const source=container.querySelector('[data-telemetry-source]');
  const stale=container.querySelector('[data-telemetry-stale]');
  const json=container.querySelector('[data-telemetry-json]');
  const status=container.querySelector('[data-telemetry-status]');
  const healthNode=container.querySelector('[data-telemetry-health]');
  const zonesNode=container.querySelector('[data-telemetry-zones]');
  const coverageNode=container.querySelector('[data-telemetry-coverage]');
  const headNode=container.querySelector('[data-telemetry-head]');
  const bodyNode=container.querySelector('[data-telemetry-body]');
  const loadButton=container.querySelector('[data-telemetry-load]');
  let packets=[];

  const render=()=>{
    const options={staleAfterMs:Math.max(1,Number(stale.value)||10)*60*1000};
    const health=telemetryHealthSummary(packets,options);
    const zones=zoneTelemetrySummary(packets,options);
    const coverage=telemetryMetricCoverage(packets);
    const available=new Set(coverage.map(x=>x.metric));
    const keys=metricKeys.filter(key=>available.has(key));
    for(const extra of coverage.map(x=>x.metric))if(!keys.includes(extra))keys.push(extra);
    const table=telemetryTableModel(packets,{...options,metricKeys:keys});

    clear(healthNode);
    for(const [value,label] of [[health.devices,'Devices'],[health.zones,'Zones'],[health.fresh,'Fresh'],[health.stale,'Stale']]){
      const card=text(doc,'div','', 'metric');
      card.appendChild(text(doc,'b',value));
      card.appendChild(text(doc,'span',label));
      healthNode.appendChild(card);
    }

    clear(zonesNode);
    for(const zone of zones){
      const row=doc.createElement('tr');
      appendCell(doc,row,zone.zone);
      appendCell(doc,row,zone.devices);
      appendCell(doc,row,zone.fresh);
      appendCell(doc,row,zone.stale);
      zonesNode.appendChild(row);
    }

    clear(coverageNode);
    for(const item of coverage){
      const row=doc.createElement('tr');
      appendCell(doc,row,metricLabel(item.metric));
      appendCell(doc,row,item.devices);
      coverageNode.appendChild(row);
    }

    clear(headNode);
    const headerRow=doc.createElement('tr');
    for(const column of table.columns){
      const th=doc.createElement('th');
      th.textContent=column==='deviceId'?'Device':column==='sourceId'?'Source':column==='observedAt'?'Observed':metricLabel(column);
      headerRow.appendChild(th);
    }
    headNode.appendChild(headerRow);

    clear(bodyNode);
    for(const item of table.rows){
      const row=doc.createElement('tr');
      for(const column of table.columns){
        let value=item[column];
        if(column==='observedAt'&&value){
          const date=new Date(value);
          value=Number.isFinite(date.getTime())?date.toLocaleString():value;
        }
        appendCell(doc,row,value);
      }
      bodyNode.appendChild(row);
    }
    status.textContent=health.devices
      ? health.devices+' latest device packet'+(health.devices===1?'':'s')+' across '+health.zones+' zone'+(health.zones===1?'':'s')+'. '+health.fresh+' fresh · '+health.stale+' stale.'
      : 'No valid timestamped device packets were found.';
  };

  const load=()=>{
    try{
      const raw=JSON.parse(String(json.value||''));
      packets=normalizeTelemetryCollection(raw,{sourceId:source.value.trim()||defaultSourceId});
      render();
      return packets;
    }catch(error){
      packets=[];
      render();
      status.textContent=error instanceof Error?error.message:'Could not load telemetry collection.';
      return [];
    }
  };

  loadButton.addEventListener('click',load);
  return {load,getPackets:()=>packets.slice(),render};
}
