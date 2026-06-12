import type { RegionId } from './regions';
import { ARTICLES } from './articles';

export type PresetId = 'allergy' | 'candida' | 'lifecycle';

export interface PresetDef {
  id: PresetId;
  title: string;
  scenario: string;
  scenarioLifestage?: string;
  articleKey: keyof typeof ARTICLES;
  defaultRegion: RegionId;
  env: { ph: number; moisture: number };
}

export const PRESETS: Record<PresetId, PresetDef> = {
  allergy: {
    id: 'allergy',
    title: 'Allergy & Barrier Defense',
    scenario:
      'Select a tissue region on the body map, then run region-specific triggers and inoculations. On nose/sinus tissue, allergen spikes and histamine surges stress the barrier — probiotics help commensals compete for attachment sites.',
    scenarioLifestage:
      'Life-stage context: early-life microbiome training shapes how the nasal barrier responds to allergens. Select nose/sinus and use region-specific inoculations to restore barrier integrity across ages.',
    articleKey: 'allergies',
    defaultRegion: 'nose',
    env: { ph: 6.8, moisture: 0.72 },
  },
  candida: {
    id: 'candida',
    title: 'Candida & pH Balance',
    scenario:
      'Select skin or gut tissue and adjust pH and moisture to see how the biome shifts. Alkaline pH and sugar load favor C. albicans — acidifying inoculations and pH balancing restore equilibrium.',
    articleKey: 'candidiasis',
    defaultRegion: 'skin',
    env: { ph: 7.4, moisture: 0.55 },
  },
  lifecycle: {
    id: 'lifecycle',
    title: 'Biotic Lifecycle Sandbox',
    scenario:
      'Free-play across unlocked regions. Select gut tissue to add prebiotic fiber, watch probiotics consume it, and observe postbiotic SCFA particles healing epithelial integrity.',
    articleKey: 'lifecycle',
    defaultRegion: 'gut',
    env: { ph: 6.2, moisture: 0.65 },
  },
};

export function parseUrlState(): {
  preset: PresetId;
  region: RegionId;
  context?: string;
} {
  const params = new URLSearchParams(window.location.search);
  const preset = (params.get('preset') as PresetId) || 'allergy';
  const region = (params.get('region') as RegionId) || PRESETS[preset]?.defaultRegion || 'nose';
  const context = params.get('context') ?? undefined;
  return {
    preset: PRESETS[preset] ? preset : 'allergy',
    region,
    context,
  };
}
