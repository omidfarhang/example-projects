export type EpitheliumKind = 'sinus' | 'skin' | 'gut' | 'ear' | 'scalp' | 'oral' | 'vaginal';

export interface EpitheliumState {
  inflammation: number;
  integrity: number;
  biofilm: number;
  postbioticLevel: number;
  /** Brief boost when postbioticLevel rises — syncs lumen particles with SCFA tissue glow. */
  scfaGlowBoost?: number;
  /** Acute immune signaling — pink lumen haze, not center glow. */
  immuneActivity?: number;
  ph: number;
  moisture: number;
  sebum: number;
  cerumen: number;
  sweatRate: number;
}
