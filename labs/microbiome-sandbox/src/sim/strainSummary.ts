import type { MicrobeNode, MicrobeType } from './types';

export interface StrainPresence {
  strain: string;
  count: number;
}

export interface LiveStrainSummary {
  probiotics: StrainPresence[];
  commensals: StrainPresence[];
  pathogens: StrainPresence[];
  allergens: StrainPresence[];
  prebiotics: StrainPresence[];
}

const MIN_VITALITY = 0.12;

function collect(nodes: MicrobeNode[], types: MicrobeType[]): StrainPresence[] {
  const counts = new Map<string, number>();
  for (const n of nodes) {
    if (!types.includes(n.type) || n.vitality < MIN_VITALITY) continue;
    counts.set(n.strain, (counts.get(n.strain) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([strain, count]) => ({ strain, count }));
}

export function summarizeLiveStrains(nodes: MicrobeNode[]): LiveStrainSummary {
  return {
    probiotics: collect(nodes, ['probiotic']),
    commensals: collect(nodes, ['commensal']),
    pathogens: collect(nodes, ['pathogen', 'yeast']),
    allergens: collect(nodes, ['allergen']),
    prebiotics: collect(nodes, ['prebiotic']),
  };
}

export function formatStrainList(entries: StrainPresence[], maxNames = 8): string {
  if (entries.length === 0) return '';
  const names = entries.map((e) => e.strain);
  if (names.length <= maxNames) return names.join(', ');
  const shown = names.slice(0, maxNames - 1).join(', ');
  return `${shown}, +${names.length - maxNames + 1} more`;
}

export function totalCells(entries: StrainPresence[]): number {
  return entries.reduce((sum, e) => sum + e.count, 0);
}
