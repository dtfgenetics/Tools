const clean=(v,max=160)=>String(v??'').trim().slice(0,max);
const finiteOrNull=v=>{if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
export function createCultivationContext(input={}){
  return {schema:'thc-cultivation-context',version:1,createdAt:clean(input.createdAt||new Date().toISOString(),40),zone:clean(input.zone),plantId:clean(input.plantId),cycleId:clean(input.cycleId),stage:clean(input.stage,80),sourceTool:clean(input.sourceTool,80),recipeId:clean(input.recipeId),measurement:{ph:finiteOrNull(input.ph),ecMsCm:finiteOrNull(input.ecMsCm),tempC:finiteOrNull(input.tempC),rhPct:finiteOrNull(input.rhPct),ppfd:finiteOrNull(input.ppfd),vwcPct:finiteOrNull(input.vwcPct)},notes:clean(input.notes,500)};
}
export function normalizeCultivationContext(input){
  if(!input||input.schema!=='thc-cultivation-context'||Number(input.version)!==1)return null;
  return createCultivationContext(input);
}
export function mergeCultivationContext(base={},patch={}){
  const a=normalizeCultivationContext(base)||createCultivationContext(base),b=createCultivationContext({...a,...patch});
  b.measurement={...a.measurement,...Object.fromEntries(Object.entries(b.measurement).filter(([,v])=>v!==null))};
  return b;
}
export function contextSummary(ctx){
  const c=normalizeCultivationContext(ctx);if(!c)return [];
  const out=[];if(c.zone)out.push(['Zone',c.zone]);if(c.plantId)out.push(['Plant',c.plantId]);if(c.cycleId)out.push(['Cycle',c.cycleId]);if(c.stage)out.push(['Stage',c.stage]);
  for(const [k,label,unit] of [['ph','pH',''],['ecMsCm','EC',' mS/cm'],['tempC','Temp',' °C'],['rhPct','RH','%'],['ppfd','PPFD',' µmol/m²/s'],['vwcPct','VWC','%']])if(c.measurement[k]!==null)out.push([label,String(c.measurement[k])+unit]);
  return out;
}
