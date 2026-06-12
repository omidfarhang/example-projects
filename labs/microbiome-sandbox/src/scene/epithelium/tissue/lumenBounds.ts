import type { EpitheliumKind } from '../types';

/** 3D volume where microbes swim, aligned to each tissue cross-section. */
export interface LumenBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  /** Epithelial attachment band — commensals & pathogens dock here. */
  epithelialY: number;
  /** Mucus / sebum layer — probiotics colonize here. */
  mucusY: number;
  allergenBase: number;
  allergenHeight: number;
}

export const LUMEN_BOUNDS: Record<EpitheliumKind, LumenBounds> = {
  sinus: {
    xMin: -2.35,
    xMax: 2.35,
    yMin: 0.52,
    yMax: 1.32,
    zMin: 0.02,
    zMax: 0.42,
    epithelialY: 0.56,
    mucusY: 0.72,
    allergenBase: 0.98,
    allergenHeight: 0.42,
  },
  skin: {
    xMin: -2.45,
    xMax: 2.45,
    yMin: 0.5,
    yMax: 0.98,
    zMin: 0.06,
    zMax: 0.58,
    epithelialY: 0.52,
    mucusY: 0.64,
    allergenBase: 0.82,
    allergenHeight: 0.22,
  },
  gut: {
    xMin: -2.4,
    xMax: 2.4,
    yMin: 0.78,
    yMax: 1.05,
    zMin: 0.04,
    zMax: 0.48,
    epithelialY: 0.72,
    mucusY: 0.82,
    allergenBase: 0.92,
    allergenHeight: 0.18,
  },
  ear: {
    xMin: -2.1,
    xMax: 2.1,
    yMin: 0.48,
    yMax: 1.18,
    zMin: 0.04,
    zMax: 0.44,
    epithelialY: 0.5,
    mucusY: 0.62,
    allergenBase: 0.88,
    allergenHeight: 0.35,
  },
  scalp: {
    xMin: -2.45,
    xMax: 2.45,
    yMin: 0.48,
    yMax: 1.05,
    zMin: 0.06,
    zMax: 0.6,
    epithelialY: 0.5,
    mucusY: 0.66,
    allergenBase: 0.88,
    allergenHeight: 0.2,
  },
  oral: {
    xMin: -2.35,
    xMax: 2.35,
    yMin: 0.46,
    yMax: 0.95,
    zMin: 0.05,
    zMax: 0.5,
    epithelialY: 0.48,
    mucusY: 0.58,
    allergenBase: 0.78,
    allergenHeight: 0.2,
  },
  vaginal: {
    xMin: -2.2,
    xMax: 2.2,
    yMin: 0.44,
    yMax: 0.92,
    zMin: 0.04,
    zMax: 0.46,
    epithelialY: 0.46,
    mucusY: 0.56,
    allergenBase: 0.76,
    allergenHeight: 0.18,
  },
};

/** Epithelial receptor columns — attachment sites along the tissue surface. */
export const RECEPTOR_SITES: Record<EpitheliumKind, number[]> = {
  sinus: Array.from({ length: 12 }, (_, i) => -2.5 + i * (5 / 11)),
  skin: Array.from({ length: 13 }, (_, i) => -2.5 + i * (5.2 / 12)),
  gut: Array.from({ length: 11 }, (_, i) => -2.6 + 0.32 + i * ((5.2 - 0.64) / 10)),
  ear: Array.from({ length: 10 }, (_, i) => -2.1 + i * (4.2 / 9)),
  scalp: [-1.35, 0, 1.35, -0.68, 0.68, -2.0, 2.0],
  oral: Array.from({ length: 11 }, (_, i) => -2.3 + i * (4.6 / 10)),
  vaginal: Array.from({ length: 10 }, (_, i) => -2.1 + i * (4.2 / 9)),
};

