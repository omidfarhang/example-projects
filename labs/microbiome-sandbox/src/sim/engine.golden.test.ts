import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  runAllergyNoseSequence,
  runLifecycleGutSequence,
  type GoldenCheckpoint,
} from './engine.golden.helpers';

const FIXTURE_PATH = join(import.meta.dirname, 'fixtures/engine-golden.json');

interface GoldenFixture {
  seed: number;
  scenarios: Record<string, GoldenCheckpoint[]>;
}

const golden: GoldenFixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));

describe('SimEngine golden snapshots (SIM-01)', () => {
  it('matches fixture for allergy/nose action sequence (seed 42)', () => {
    expect(runAllergyNoseSequence()).toEqual(golden.scenarios.allergy_nose);
  });

  it('matches fixture for lifecycle/gut action sequence (seed 42)', () => {
    expect(runLifecycleGutSequence()).toEqual(golden.scenarios.lifecycle_gut);
  });

  it('is deterministic across repeated runs', () => {
    expect(runAllergyNoseSequence()).toEqual(runAllergyNoseSequence());
    expect(runLifecycleGutSequence()).toEqual(runLifecycleGutSequence());
  });
});
