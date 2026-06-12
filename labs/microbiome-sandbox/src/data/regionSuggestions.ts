import type { ProductId } from './products';
import type { RegionId } from './regions';
import type { PrebioticId, StrainId } from './strains';

export interface RegionSuggestions {
  strains?: StrainId[];
  prebiotics?: PrebioticId[];
  products?: ProductId[];
}

/** Curated catalog shortcuts per tissue — replaces duplicate strain inoculation buttons. */
export const REGION_SUGGESTIONS: Record<RegionId, RegionSuggestions> = {
  ear: {
    strains: ['lrham', 'ssaliv_k12', 'ssaliv_m18'],
    products: ['oral_probiotic_lozenge'],
  },
  scalp: {
    strains: ['lrham', 'lacid'],
  },
  nose: {
    strains: ['lrham', 'binf', 'ssaliv_k12'],
    products: ['oral_probiotic_lozenge'],
  },
  oral: {
    strains: ['lsaliv', 'lacid', 'sboul', 'ssaliv_k12', 'ssaliv_m18'],
    products: ['oral_probiotic_lozenge', 'probiotic_yogurt'],
  },
  skin: {
    strains: ['lacid', 'lrham'],
  },
  vaginal: {
    strains: ['lacid', 'lrham', 'lreuteri'],
  },
  gut: {
    strains: ['lplant', 'lcasei', 'blactis', 'blongum'],
    prebiotics: ['inulin', 'fos'],
    products: ['synbiotic_supplement', 'kefir_drink', 'kimchi'],
  },
};
