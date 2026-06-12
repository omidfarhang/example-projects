import type { BiomeState } from './types';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Emergent tissue inflammation target from microbiome pressure, barrier state, and immune signaling. */
export function computeInflammationTarget(b: Pick<
  BiomeState,
  'pathogenCount' | 'allergenCount' | 'integrity' | 'biofilm' | 'immuneActivity'
>): number {
  const pathogenPressure = Math.min(1, b.pathogenCount / 28);
  const allergenPressure = Math.min(1, b.allergenCount / 22);
  const barrierDefect = Math.max(0, (0.72 - b.integrity) / 0.57);
  const biofilmPressure = b.biofilm;

  return clamp(
    0.025 +
      pathogenPressure * 0.38 +
      allergenPressure * 0.32 +
      barrierDefect * 0.24 +
      biofilmPressure * 0.14 +
      b.immuneActivity * 0.26,
    0.02,
    0.96,
  );
}

/** Per-tick immune-activity decay and probiotic/postbiotic calming. */
export function decayImmuneActivity(
  b: Pick<BiomeState, 'immuneActivity' | 'postbioticLevel' | 'pathogenCount' | 'inflammation'>,
): number {
  let decay = 0.0007;
  if (b.postbioticLevel > 0.25) decay += 0.00035;
  if (b.inflammation < 0.15 && b.pathogenCount < 8) decay += 0.0002;
  return Math.max(0, b.immuneActivity - decay);
}

/** Smooth inflammation toward emergent target; SCFA-rich niches recover faster. */
export function stepEmergentInflammation(
  b: Pick<BiomeState, 'inflammation' | 'postbioticLevel' | 'pathogenCount' | 'allergenCount' | 'integrity' | 'biofilm' | 'immuneActivity'>,
  rate = 0.018,
): number {
  const target = computeInflammationTarget(b);
  let blend = rate;
  if (b.postbioticLevel > 0.2) blend += 0.004;
  if (b.pathogenCount < 6 && b.allergenCount < 4) blend += 0.003;
  return clamp(b.inflammation + (target - b.inflammation) * blend, 0, 1);
}
