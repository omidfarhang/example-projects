import type { BiomeState } from './types';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Tryptophan availability proxy (0–1) — educational gut-brain axis signal.
 * Rises when gut inflammation is low and SCFA/postbiotic output is strong;
 * falls under immune stress and barrier damage.
 */
export function computeTryptophanTarget(
  b: Pick<BiomeState, 'postbioticLevel' | 'inflammation' | 'immuneActivity' | 'integrity'>,
): number {
  const calmMucosa = (1 - b.inflammation * 0.85) * (1 - b.immuneActivity * 0.45);
  const scfaSupport = b.postbioticLevel * 0.55;
  const barrierSupport = Math.max(0, b.integrity - 0.55) * 0.35;

  return clamp(calmMucosa * 0.28 + scfaSupport + barrierSupport, 0.02, 0.92);
}

export function stepTryptophanSupport(
  b: Pick<BiomeState, 'tryptophanSupport' | 'postbioticLevel' | 'inflammation' | 'immuneActivity' | 'integrity'>,
  rate = 0.016,
): number {
  const target = computeTryptophanTarget(b);
  return clamp(b.tryptophanSupport + (target - b.tryptophanSupport) * rate, 0, 1);
}
