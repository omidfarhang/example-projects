import type { PresetId } from './presets';
import type { RegionId } from './regions';

/** Region-specific exploration blurbs shown when a preset's narrative focuses elsewhere (CONTENT-01). */
export const PRESET_REGION_NARRATIVES: Partial<
  Record<PresetId, Partial<Record<RegionId, string>>>
> = {
  allergy: {
    ear:
      'Ear canal: allergen spikes, dry air, and cerumen buildup stress the squamous barrier. Try allergen + dry_air triggers, then L. rhamnosus or S. salivarius K12 for recovery.',
    scalp:
      'Scalp: friction irritants and sebum shifts stress the follicular barrier — dust and irritant particles behave like secondary allergen niches. Explore sebum surge and topical lactobacilli.',
  },
  candida: {
    ear:
      'Ear canal: alkaline pH and moisture shifts can favor yeast in the canal — antibiotic ear drops deplete commensals. Acidifying lactobacilli help restore balance.',
    scalp:
      'Scalp: sebum surge triggers Malassezia yeast bloom — related Candida dynamics on a lipid-rich, follicular barrier. Try seborrheic flare then L. acidophilus or topical cream.',
  },
};

export function regionExplorationBlurb(presetId: PresetId, regionId: RegionId): string | undefined {
  return PRESET_REGION_NARRATIVES[presetId]?.[regionId];
}
