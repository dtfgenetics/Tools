import assert from 'node:assert/strict';
import {parseMolecularFormula,formulaDerivedProperties} from '../site/public-route-patch/assets/thc-chemistry-formula-v1.mjs';

assert.deepEqual(parseMolecularFormula('C10H16'),{C:10,H:16});
assert.deepEqual(parseMolecularFormula('C10H18O2'),{C:10,H:18,O:2});
assert.deepEqual(parseMolecularFormula('C6H5Cl'),{C:6,H:5,Cl:1});
assert.equal(parseMolecularFormula('C10H16(OH)2'),null);
assert.equal(parseMolecularFormula(''),null);

const limonene=formulaDerivedProperties('C10H16');
assert.equal(limonene.valid,true);
assert.ok(Math.abs(limonene.molarMassGmol-136.238)<0.01);
assert.equal(limonene.dbe,3);

const oxygenated=formulaDerivedProperties('C10H18O');
assert.ok(Math.abs(oxygenated.molarMassGmol-154.253)<0.01);
assert.equal(oxygenated.dbe,2);

const invalid=formulaDerivedProperties('bad');
assert.equal(invalid.valid,false);
assert.equal(invalid.molarMassGmol,null);
assert.equal(invalid.dbe,null);
console.log('chemistry formula core: ok');
