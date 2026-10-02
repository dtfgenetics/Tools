import assert from 'node:assert/strict';
import {loadReviewedEvidence,reviewedEvidenceUrl,validateReviewedEvidenceBundle} from '../site/public-route-patch/assets/thc-reviewed-evidence-v1.mjs';
assert.equal(reviewedEvidenceUrl,'/thc-grow-doc/data/rag_claims_v1.json');
const good={schema_version:'grow-doc-rag-claims-published-v1',publication_policy:{reviewed_claims_only:true,weight_training_eligible:false},claims:[{claim_sha256:'a'.repeat(64),source_id:'s',claim:'c',citation_locator:'p.1',scope:{study:'x'}}]};
assert.equal(validateReviewedEvidenceBundle(good),good);
await loadReviewedEvidence({fetchImpl:async url=>({ok:url===reviewedEvidenceUrl,status:200,json:async()=>good})});
for(const bad of [{...good,schema_version:'bad'},{...good,publication_policy:{reviewed_claims_only:false,weight_training_eligible:false}},{...good,claims:[{claim_sha256:'bad'}]}])assert.throws(()=>validateReviewedEvidenceBundle(bad));
console.log('reviewed evidence client: PASS');
