import type { EpitheliumKind } from './epithelium/types';

export interface TissueLayerGuide {
  name: string;
  color: string;
}

export interface TissueGuide {
  /** One-line cross-section orientation. */
  orientation: string;
  /** What the colored particles represent in this view. */
  microbeHint: string;
  layers: TissueLayerGuide[];
}

/** Educational copy keyed to pictogram stripe colors — matches TISSUE_PICTOGRAMS. */
export const TISSUE_GUIDES: Record<EpitheliumKind, TissueGuide> = {
  gut: {
    orientation: 'Longitudinal slice through small-intestine wall — lumen above, muscle below.',
    microbeHint: 'Green rods = probiotics in mucus · slate rods on villi = commensals · red spikes = pathogens',
    layers: [
      { name: 'Lumen / chyme', color: '#1a3858' },
      { name: 'Villi & crypts', color: '#e8a8a0' },
      { name: 'Lamina propria', color: '#f8ece8' },
      { name: 'Muscularis', color: '#7a4858' },
    ],
  },
  skin: {
    orientation: 'Vertical skin barrier — surface film on top, dermis below.',
    microbeHint: 'Commensals colonize stratum corneum · pathogens invade follicle pockets',
    layers: [
      { name: 'Stratum corneum', color: '#f8ead8' },
      { name: 'Epidermis', color: '#d8a890' },
      { name: 'Dermis', color: '#c08878' },
      { name: 'Subcutis', color: '#b87870' },
    ],
  },
  sinus: {
    orientation: 'Nasal cavity cross-section — vaulted lumen, turbinates & ciliated epithelium.',
    microbeHint: 'Amber grains drift from lumen air · commensals on cilia brush',
    layers: [
      { name: 'Sinus cavity', color: '#1a4870' },
      { name: 'Ciliated epithelium', color: '#a86860' },
      { name: 'Turbinates', color: '#e8b0a8' },
    ],
  },
  ear: {
    orientation: 'Ear canal slice — cerumen layer, canal lumen, tympanic membrane at depth.',
    microbeHint: 'Wax traps commensals · pathogens bloom when cerumen or pH shifts',
    layers: [
      { name: 'Canal lumen', color: '#2a1810' },
      { name: 'Cerumen film', color: '#d4a040' },
      { name: 'Canal epithelium', color: '#c89878' },
      { name: 'Tympanic membrane', color: '#f0e8d8' },
    ],
  },
  scalp: {
    orientation: 'Scalp cross-section — hair follicles, sebum film, sweat ducts.',
    microbeHint: 'Malassezia yeast (purple) on sebum · probiotics in follicle pockets',
    layers: [
      { name: 'Sebum film', color: '#f0d878' },
      { name: 'Epidermis', color: '#f0e0c8' },
      { name: 'Follicle / gland', color: '#8a5048' },
      { name: 'Subcutis', color: '#c8a878' },
    ],
  },
  oral: {
    orientation: 'Oral mucosa slice — saliva film, papillae, thrush-prone epithelium.',
    microbeHint: 'Candida yeast patches on mucosa · S. salivarius in saliva biofilm',
    layers: [
      { name: 'Oral cavity', color: '#281820' },
      { name: 'Saliva film', color: '#d8eef8' },
      { name: 'Mucosa', color: '#e8b0a8' },
      { name: 'Muscle', color: '#a86860' },
    ],
  },
  vaginal: {
    orientation: 'Vaginal canal cross-section — glycogen mucus, rugae folds, squamous epithelium.',
    microbeHint: 'Lactobacilli (green) acidify mucus · pathogens when pH rises',
    layers: [
      { name: 'Lumen', color: '#2a1828' },
      { name: 'Glycogen mucus', color: '#f0e0f0' },
      { name: 'Squamous epithelium', color: '#e8b0a8' },
      { name: 'Lamina propria', color: '#a86860' },
    ],
  },
};

export function getTissueGuide(kind: EpitheliumKind): TissueGuide {
  return TISSUE_GUIDES[kind];
}
