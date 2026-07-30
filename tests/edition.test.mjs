import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {validateEdition,loadEdition} from '../scripts/lib/edition.mjs';
const sample=JSON.parse(await fs.readFile(new URL('../examples/edition-003.example.json',import.meta.url)));
const copy=()=>structuredClone(sample);
test('valid edition import',()=>assert.equal(validateEdition(copy()).valid,true));
test('malformed JSON has a useful error',async()=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'beacon-'));const file=path.join(dir,'bad.json');await fs.writeFile(file,'{bad');await assert.rejects(loadEdition(file),/Malformed JSON/)});
test('missing required field',()=>{const v=copy();delete v.theme;assert.match(validateEdition(v).errors.map(e=>e.path).join(),/\.theme/)});
test('invalid date',()=>{const v=copy();v.publication_date='2026-02-30';assert.match(validateEdition(v).errors.map(e=>e.path).join(),/publication_date/)});
test('broken source URL',()=>{const v=copy();v.stories[0].sources[0].url='broken';assert.match(validateEdition(v).errors.map(e=>e.path).join(),/sources\[0\]\.url/)});
test('missing article slug',()=>{const v=copy();delete v.stories[0].slug;assert.match(validateEdition(v).errors.map(e=>e.path).join(),/stories\[0\]\.slug/)});
