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
  inoculations: { id: string; label: string; strain: string }[];
  triggers: { id: string; label: string }[];
}

export const PRESETS: Record<PresetId, PresetDef> = {
  allergy: {
    id: 'allergy',
    title: 'Allergy & Barrier Defense',
    scenario:
      'You triggered an Allergen Spike in the nasal epithelium. Pollen-like particles attach while commensals retreat. Spray L. rhamnosus or B. infantis to block pathogen attachment and restore barrier integrity.',
    scenarioLifestage:
      'Life-stage context: early-life microbiome training shapes how the nasal barrier responds to allergens. The same inoculation pattern helps commensals compete for attachment sites across ages.',
    articleKey: 'allergies',
    defaultRegion: 'nose',
    env: { ph: 6.8, moisture: 0.72 },
    inoculations: [
      { id: 'lrham', label: 'SPRAY L. RHAMNOSUS', strain: 'L. rhamnosus' },
      { id: 'binf', label: 'APPLY B. INFANTIS', strain: 'B. infantis' },
    ],
    triggers: [{ id: 'allergen', label: 'TRIGGER ALLERGEN SPIKE' }],
  },
  candida: {
    id: 'candida',
    title: 'Candida & pH Balance',
    scenario:
      'Alkaline pH and high sugar tilt the biome toward C. albicans. Biofilm clusters expand on skin or gut epithelium. Inoculate L. acidophilus to acidify locally and halt yeast overgrowth.',
    articleKey: 'candidiasis',
    defaultRegion: 'skin',
    env: { ph: 7.4, moisture: 0.55 },
    inoculations: [{ id: 'lacid', label: 'INOCULATE L. ACIDOPHILUS', strain: 'L. acidophilus' }],
    triggers: [{ id: 'alkaline', label: 'RAISE pH + SUGAR LOAD' }],
  },
  lifecycle: {
    id: 'lifecycle',
    title: 'Biotic Lifecycle Sandbox',
    scenario:
      'Free-play across unlocked regions. Add prebiotic fiber, watch probiotics consume it, and observe postbiotic SCFA particles healing epithelial integrity.',
    articleKey: 'lifecycle',
    defaultRegion: 'gut',
    env: { ph: 6.2, moisture: 0.65 },
    inoculations: [
      { id: 'fiber', label: 'ADD PREBIOTIC FIBER', strain: 'prebiotic' },
      { id: 'lplant', label: 'SEED L. PLANTARUM', strain: 'L. plantarum' },
      { id: 'scfa', label: 'RELEASE SCFA BOOST', strain: 'postbiotic' },
    ],
    triggers: [{ id: 'stress', label: 'SIMULATE MILD STRESS' }],
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
