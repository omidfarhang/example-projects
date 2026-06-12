export type EpitheliumKind = 'sinus' | 'skin' | 'gut' | 'ear' | 'scalp';

export interface EpitheliumState {
  inflammation: number;
  integrity: number;
  biofilm: number;
  postbioticLevel: number;
  ph: number;
  moisture: number;
  sebum: number;
  cerumen: number;
  sweatRate: number;
}
