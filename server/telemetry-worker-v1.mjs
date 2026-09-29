import {createPulseProvider} from './providers/pulse-v1.mjs';
import {createTelemetryGateway} from './telemetry-gateway-v1.mjs';

export function createTelemetryWorker(env={},options={}){
  const fetchFn=options.fetchFn??globalThis.fetch?.bind(globalThis);
  const pulse=createPulseProvider({
    apiKey:env?.PULSE_API_KEY??'',
    fetchFn
  });
  const gateway=createTelemetryGateway({providers:[pulse]});

  return {
    fetch(request){
      return gateway(request);
    }
  };
}

export default {
  fetch(request,env){
    return createTelemetryWorker(env).fetch(request);
  }
};
