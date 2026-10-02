import assert from 'node:assert/strict';
import {indexResearchEvidence,researchEvidenceForKind,validateResearchEvidenceDataset} from '../site/public-route-patch/assets/thc-research-evidence-v1.mjs';
const good={schema:'thc-research-evidence-dataset',version:1,datasetId:'pilot',generatedAt:'2026-10-02T00:00:00Z',sources:[{sourceId:'ncbi:PRJ1',provider:'NCBI',retrievedAt:'2026-10-02T00:00:00Z',identifiers:{bioproject:'PRJ1'}}],records:[{recordId:'srr:1',kind:'genomics-run',sourceId:'ncbi:PRJ1',identifiers:{run:'SRR1'},facts:{bases:{value:100,unit:'bp'}}}]};
assert.deepEqual(validateResearchEvidenceDataset(good),[]);
assert.equal(researchEvidenceForKind(indexResearchEvidence(good),'genomics-run').length,1);
assert(validateResearchEvidenceDataset({...good,version:2}).some(x=>x.includes('version')));
const bad=structuredClone(good); bad.records[0].sourceId='missing'; assert(validateResearchEvidenceDataset(bad).some(x=>x.includes('unknown sourceId')));
const noUnit=structuredClone(good); delete noUnit.records[0].facts.bases.unit; assert(validateResearchEvidenceDataset(noUnit).some(x=>x.includes('requires unit')));
console.log('research evidence consumption contract tests passed');
