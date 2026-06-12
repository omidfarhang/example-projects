import type { PostbioticId } from './postbiotics';
import type { ProductId } from './products';
import type { RegionId } from './regions';
import type { PrebioticId, StrainId } from './strains';

export interface RegionSuggestions {
  strains?: StrainId[];
  prebiotics?: PrebioticId[];
  postbiotics?: PostbioticId[];
  products?: ProductId[];
}

/** Curated catalog shortcuts per tissue — replaces duplicate strain inoculation buttons. */
export const REGION_SUGGESTIONS: Record<RegionId, RegionSuggestions> = {
  ear: {
    strains: ['lrham', 'ssaliv_k12', 'ssaliv_m18', 'lparacasei'],
    products: ['oral_probiotic_lozenge'],
  },
  scalp: {
    strains: ['lrham', 'lacid', 'sepidermidis'],
    products: ['probiotic_topical_cream'],
  },
  nose: {
    strains: ['lrham', 'binf', 'ssaliv_k12', 'lparacasei', 'lreuteri'],
    products: ['oral_probiotic_lozenge'],
  },
  oral: {
    strains: ['lsaliv', 'lacid', 'sboul', 'ssaliv_k12', 'ssaliv_m18', 'lgasseri', 'lparacasei'],
    prebiotics: ['pectin'],
    postbiotics: ['acetate'],
    products: ['oral_probiotic_lozenge', 'probiotic_yogurt', 'kombucha'],
  },
  skin: {
    strains: ['lacid', 'lrham', 'sepidermidis'],
    products: ['probiotic_topical_cream'],
  },
  vaginal: {
    strains: ['lacid', 'lrham', 'lreuteri', 'lgasseri', 'binf'],
    products: ['vaginal_probiotic_capsule'],
  },
  gut: {
    strains: ['lplant', 'lcasei', 'blactis', 'blongum', 'bbifidum', 'bbreve', 'lferment', 'binf'],
    prebiotics: ['inulin', 'fos', 'gos', 'resistant_starch'],
    postbiotics: ['scfa_mix', 'butyrate'],
    products: ['synbiotic_supplement', 'kefir_drink', 'probiotic_yogurt', 'kimchi', 'sauerkraut'],
  },
};
