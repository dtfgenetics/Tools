const json=(value,status=200)=>new Response(JSON.stringify(value),{
  status,
  headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    'x-content-type-options':'nosniff'
  }
});

const cleanPath=request=>{
  try{return new URL(request.url).pathname.replace(/\/+$/,'')||'/'}catch{return '/'}
};

export function createTelemetryGateway({providers=[]}={}){
  const map=new Map((Array.isArray(providers)?providers:[]).map(provider=>[provider.id,provider]));

  return async function handleTelemetryGateway(request){
    if(!(request instanceof Request))return json({error:'Invalid request.'},400);
    if(request.method!=='GET')return json({error:'Method not allowed.'},405);

    const path=cleanPath(request);
    if(path==='/api/telemetry/providers'){
      return json({providers:[...map.values()].map(provider=>({
        id:provider.id,
        label:provider.label||provider.id,
        configured:Boolean(provider.configured)
      }))});
    }

    const deviceMatch=path.match(/^\/api\/telemetry\/([a-z0-9-]+)\/devices$/i);
    const recentMatch=path.match(/^\/api\/telemetry\/([a-z0-9-]+)\/devices\/([^/]+)\/recent$/i);
    const match=deviceMatch||recentMatch;
    if(!match)return json({error:'Not found.'},404);

    const provider=map.get(match[1]);
    if(!provider)return json({error:'Not found.'},404);
    if(!provider.configured)return json({error:'Provider is not configured.'},503);

    try{
      if(deviceMatch){
        const devices=await provider.listDevices();
        return json({provider:provider.id,devices});
      }
      const packet=await provider.getRecent(match[2]);
      return json({provider:provider.id,packet});
    }catch(error){
      const message=String(error?.message||'');
      if(/device id/i.test(message))return json({error:'Invalid device ID.'},400);
      if(/not configured/i.test(message))return json({error:'Provider is not configured.'},503);
      if(/authentication failed/i.test(message))return json({error:'Provider authentication failed.'},502);
      if(/rate limit/i.test(message))return json({error:'Provider rate limit reached.'},429);
      return json({error:'Provider request failed.'},502);
    }
  };
}
