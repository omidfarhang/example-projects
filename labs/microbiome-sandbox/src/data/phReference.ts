import type { RegionId } from './regions';

/** Illustrative pH band for educators — not patient-specific targets. */
export interface PhReferenceBand {
  typicalMin: number;
  typicalMax: number;
  label: string;
  note: string;
  citation: string;
}

/** Cited typical ranges per tissue (literature summaries, not clinical guidance). */
export const PH_REFERENCE: Record<RegionId, PhReferenceBand> = {
  vaginal: {
    typicalMin: 3.8,
    typicalMax: 4.5,
    label: 'Healthy vaginal mucosa',
    note: 'Lactobacilli maintain acidity; values above ~4.5 often correlate with dysbiosis in reviews.',
    citation: 'Boskey et al., Am J Obstet Gynecol 2001',
  },
  oral: {
    typicalMin: 6.2,
    typicalMax: 7.0,
    label: 'Resting saliva',
    note: 'Drops after sugar intake; plaque micro-niches can be much more acidic.',
    citation: 'Dawes, Oral Dis 2003',
  },
  gut: {
    typicalMin: 5.5,
    typicalMax: 7.0,
    label: 'Lumen (proximal → distal gradient)',
    note: 'Single slider averages colon/fecal niches that span wider extremes in vivo.',
    citation: 'Fallingborg, Aliment Pharmacol Ther 1999',
  },
  skin: {
    typicalMin: 4.5,
    typicalMax: 5.5,
    label: 'Acid mantle',
    note: 'Surface pH varies by body site and hygiene; model uses regional average.',
    citation: 'Lambers et al., Int J Cosmet Sci 2006',
  },
  scalp: {
    typicalMin: 4.5,
    typicalMax: 5.5,
    label: 'Scalp surface',
    note: 'Sebum and Malassezia niches can diverge from bulk scalp measurements.',
    citation: 'Lambers et al., Int J Cosmet Sci 2006',
  },
  ear: {
    typicalMin: 4.5,
    typicalMax: 6.0,
    label: 'Ear canal skin',
    note: 'Cerumen buffers pH; deep canal micro-niches not resolved in this model.',
    citation: 'Chai & Chai, Am J Otolaryngol 1994',
  },
  nose: {
    typicalMin: 6.5,
    typicalMax: 7.2,
    label: 'Nasal mucus',
    note: 'Inflammation and infection shift pH; slider is a simplified mucosal average.',
    citation: 'Washington et al., Rhinology 2000',
  },
};

const PH_SLIDER_MIN = 4;
const PH_SLIDER_MAX = 8;

/** Map pH value to percentage along the 4–8 slider track. */
export function phToSliderPercent(ph: number): number {
  return clampPercent(((ph - PH_SLIDER_MIN) / (PH_SLIDER_MAX - PH_SLIDER_MIN)) * 100);
}

function clampPercent(v: number): number {
  return Math.min(100, Math.max(0, v));
}

export function phBandStyle(band: PhReferenceBand): { left: string; width: string } {
  const left = phToSliderPercent(band.typicalMin);
  const right = phToSliderPercent(band.typicalMax);
  return {
    left: `${left}%`,
    width: `${Math.max(0.5, right - left)}%`,
  };
}

export function phInReferenceBand(ph: number, band: PhReferenceBand): boolean {
  return ph >= band.typicalMin && ph <= band.typicalMax;
}
