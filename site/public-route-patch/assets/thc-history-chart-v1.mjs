const finite=value=>{const n=Number(value);return Number.isFinite(n)?n:0};

export function historyBarModel(rows,{
  valueKey,
  value,
  maxItems=12,
  scale='zero',
  minHeightPercent,
  format=v=>String(v),
  unit='',
  warn=()=>false
}={}){
  const list=(Array.isArray(rows)?rows:[]).slice(-Math.max(1,Number(maxItems)||12));
  const getValue=typeof value==='function'?value:(row=>finite(row?.[valueKey]));
  const values=list.map(row=>finite(getValue(row)));
  if(!values.length)return [];
  const min=Math.min(...values);
  const max=Math.max(...values);
  const span=Math.max(1,max-min);
  const zeroMax=Math.max(1,max);
  const floor=Number.isFinite(Number(minHeightPercent))
    ?Math.max(0,Math.min(100,Number(minHeightPercent)))
    :(scale==='extent'?8:3);
  return list.map((row,index)=>{
    const numeric=values[index];
    const raw=scale==='extent'
      ?((numeric-min)/span)*(100-floor)+floor
      :(numeric/zeroMax)*100;
    const heightPct=Math.max(floor,Math.min(100,raw));
    const label=String(format(numeric,row));
    return {
      row,
      value:numeric,
      heightPct,
      warn:Boolean(warn(numeric,row)),
      label,
      title:label+(unit?' '+unit:'')
    };
  });
}

export function renderHistoryBars(container,rows,options={}){
  if(!container)throw new Error('History chart container is required.');
  const model=historyBarModel(rows,options);
  container.replaceChildren();
  if(!model.length){
    const empty=document.createElement('p');
    empty.className='muted';
    empty.textContent=options.emptyText||'Save readings to build a trend.';
    container.append(empty);
    return model;
  }
  const frag=document.createDocumentFragment();
  for(const item of model){
    const wrap=document.createElement('div');
    wrap.className='history-bar-wrap';
    wrap.title=item.title;
    const bar=document.createElement('div');
    bar.className='history-bar'+(item.warn?' warn':'');
    bar.style.height=item.heightPct+'%';
    const label=document.createElement('div');
    label.className='history-bar-label';
    label.textContent=item.label;
    wrap.append(bar,label);
    frag.append(wrap);
  }
  container.append(frag);
  return model;
}
