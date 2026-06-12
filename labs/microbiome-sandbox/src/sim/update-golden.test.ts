import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { it } from 'vitest';
import { runAllergyNoseSequence, runLifecycleGutSequence } from './engine.golden.helpers';

/** Run with UPDATE_GOLDEN=1 to refresh fixtures after intentional sim changes. */
it('writes engine golden fixture', () => {
  if (process.env.UPDATE_GOLDEN !== '1') return;

  const golden = {
    seed: 42,
    scenarios: {
      allergy_nose: runAllergyNoseSequence(),
      lifecycle_gut: runLifecycleGutSequence(),
    },
  };

  const out = join(import.meta.dirname, 'fixtures/engine-golden.json');
  mkdirSync(join(import.meta.dirname, 'fixtures'), { recursive: true });
  writeFileSync(out, `${JSON.stringify(golden, null, 2)}\n`);
});
