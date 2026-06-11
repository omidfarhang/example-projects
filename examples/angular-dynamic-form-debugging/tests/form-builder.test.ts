import assert from 'node:assert/strict';

import '@angular/compiler';

import type * as FormBuilderModule from '../src/app/form-builder';

const {
  buildControlsBuggy,
  buildControlsFixed,
  getValidators,
  sampleMetadata,
} = (await import(new URL('../src/app/form-builder.ts', import.meta.url).href)) as typeof FormBuilderModule;

const buggyBeforeLoad = buildControlsBuggy(null);
assert.equal(Object.keys(buggyBeforeLoad).length, 0);

const fixedAfterLoad = buildControlsFixed(sampleMetadata.fields);
assert.equal(Object.keys(fixedAfterLoad).length, 2);
assert.equal(typeof getValidators(sampleMetadata.fields[0])[0], 'function');
assert.equal(typeof fixedAfterLoad['name'][1][0], 'function');

console.log('form-builder tests passed');
