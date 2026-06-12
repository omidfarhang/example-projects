export type EpitheliumKind = 'sinus' | 'skin' | 'gut';

export interface EpitheliumState {
  inflammation: number;
  integrity: number;
  biofilm: number;
  postbioticLevel: number;
  ph: number;
  moisture: number;
}
