import assert from 'node:assert/strict';

import {
  buildControlsBuggy,
  buildControlsFixed,
  sampleMetadata,
} from '../src/app/form-builder.ts';

const buggyBeforeLoad = buildControlsBuggy(null);
assert.equal(Object.keys(buggyBeforeLoad).length, 0);

const fixedAfterLoad = buildControlsFixed(sampleMetadata.fields);
assert.equal(Object.keys(fixedAfterLoad).length, 2);
assert.deepEqual(fixedAfterLoad.name[1], [{ required: true }]);

console.log('form-builder tests passed');
