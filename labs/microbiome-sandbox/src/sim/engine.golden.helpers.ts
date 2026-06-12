import type { BiomeState } from './types';
import { SimEngine } from './engine';

export interface GoldenCheckpoint {
  label: string;
  tick: number;
  biome: Record<string, number>;
}

function roundBiome(b: BiomeState, digits = 4): Record<string, number> {
  const r = (n: number) => Math.round(n * 10 ** digits) / 10 ** digits;
  return Object.fromEntries(Object.entries(b).map(([k, v]) => [k, r(v as number)]));
}

function capture(engine: SimEngine, label: string): GoldenCheckpoint {
  return {
    label,
    tick: engine.getTick(),
    biome: roundBiome(engine.biome),
  };
}

export function runAllergyNoseSequence(): GoldenCheckpoint[] {
  const engine = new SimEngine('allergy', 'nose', 42);
  const checkpoints = [capture(engine, 'baseline')];

  engine.trigger('histamine');
  checkpoints.push(capture(engine, 'after_histamine'));

  engine.inoculate('saline_mist');
  checkpoints.push(capture(engine, 'after_saline_mist'));

  engine.step(3);
  checkpoints.push(capture(engine, 'after_3s_sim'));

  return checkpoints;
}

export function runLifecycleGutSequence(): GoldenCheckpoint[] {
  const engine = new SimEngine('lifecycle', 'gut', 42);
  const checkpoints = [capture(engine, 'baseline')];

  engine.inoculate('scfa');
  checkpoints.push(capture(engine, 'after_scfa'));

  engine.inoculateStrain('lplant');
  checkpoints.push(capture(engine, 'after_lplant'));

  engine.step(5);
  checkpoints.push(capture(engine, 'after_5s_sim'));

  return checkpoints;
}
