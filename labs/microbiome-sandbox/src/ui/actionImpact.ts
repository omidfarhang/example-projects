import { ARTICLES } from '../data/articles';
import type { PostbioticId } from '../data/postbiotics';
import { POSTBIOTICS, postbioticRegionMultiplier } from '../data/postbiotics';
import type { ProductId } from '../data/products';
import { PRODUCTS, productRegionMultiplier } from '../data/products';
import { antibioticSpectrumWhy, resolveStressorBiome } from '../data/antibioticSpectra';
import { getInoculation } from '../data/inoculations';
import type { RegionId } from '../data/regions';
import { getRegion } from '../data/regions';
import { getStressor, type StressorBiomeDelta } from '../data/stressors';
import type { BiomeEffect, PrebioticId, StrainId } from '../data/strains';
import { PREBIOTICS, STRAINS } from '../data/strains';
import { mergeBiomeEffects, scaleBiomeEffect, scaleCount } from '../sim/bioticEffects';

export type ActionCategory = 'catalog' | 'stressor' | 'regional';
export type ImpactSourceKind = 'strain' | 'prebiotic' | 'postbiotic' | 'product' | 'stressor' | 'regional';

export type ImpactMetric =
  | 'integrity'
  | 'inflammation'
  | 'biofilm'
  | 'ph'
  | 'moisture'
  | 'postbiotic'
  | 'commensal'
  | 'yeast';

export interface ImpactAdd {
  label: string;
  count: number;
  type: 'probiotic' | 'commensal' | 'prebiotic';
}

export interface ImpactDelta {
  metric: ImpactMetric;
  delta: number;
  direction: 'up' | 'down';
  source: 'product' | 'strains' | 'strain' | 'stressor' | 'regional';
}

export interface ActionImpact {
  title: string;
  form?: string;
  efficacyPct: number;
  preferredRegions?: string[];
  adds: ImpactAdd[];
  deltas: ImpactDelta[];
  why: string;
  warning?: string;
  category?: ActionCategory;
  article?: { title: string; url: string; claim: string };
}

const METRIC_LABELS: Record<ImpactMetric, string> = {
  integrity: 'integrity',
  inflammation: 'inflammation',
  biofilm: 'biofilm',
  ph: 'pH',
  moisture: 'moisture',
  postbiotic: 'SCFA',
  commensal: 'commensals',
  yeast: 'yeast',
};

function directionFor(metric: ImpactMetric, delta: number): 'up' | 'down' {
  if (delta === 0) return 'up';
  const harmfulWhenUp = metric === 'inflammation' || metric === 'biofilm' || metric === 'ph' || metric === 'yeast';
  if (harmfulWhenUp) return delta > 0 ? 'up' : 'down';
  return delta > 0 ? 'up' : 'down';
}

function biomeToDeltas(effects: BiomeEffect, source: ImpactDelta['source']): ImpactDelta[] {
  const deltas: ImpactDelta[] = [];
  const push = (metric: ImpactMetric, value: number | undefined) => {
    if (value === undefined || Math.abs(value) < 0.001) return;
    deltas.push({ metric, delta: value, direction: directionFor(metric, value), source });
  };
  push('ph', effects.ph);
  push('moisture', effects.moisture);
  push('integrity', effects.integrity);
  push('inflammation', effects.inflammation);
  push('biofilm', effects.biofilm);
  push('postbiotic', effects.postbioticLevel);
  push('commensal', effects.commensalVitality);
  push('yeast', effects.yeastVitality);
  return deltas;
}

function aggregateDeltas(groups: ImpactDelta[]): ImpactDelta[] {
  const byKey = new Map<string, ImpactDelta>();
  for (const d of groups) {
    const key = `${d.metric}:${d.source}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.delta += d.delta;
      existing.direction = directionFor(d.metric, existing.delta);
    } else {
      byKey.set(key, { ...d });
    }
  }
  return [...byKey.values()].filter((d) => Math.abs(d.delta) >= 0.001);
}

function formatDeltaMagnitude(metric: ImpactMetric, delta: number): string {
  if (metric === 'ph') return Math.abs(delta).toFixed(2);
  if (metric === 'commensal' || metric === 'yeast') {
    return `${Math.round(Math.abs(delta) * 100)}% vitality`;
  }
  return `${Math.round(Math.abs(delta) * 100)}%`;
}

export function formatImpactDelta(d: ImpactDelta): string {
  const arrow = d.direction === 'down' ? '↓' : '↑';
  const label = METRIC_LABELS[d.metric];
  const mag = formatDeltaMagnitude(d.metric, d.delta);
  const src =
    d.source === 'product'
      ? ' (product)'
      : d.source === 'strains'
        ? ' (strains)'
        : d.source === 'stressor'
          ? ' (stressor)'
          : d.source === 'regional'
            ? ' (treatment)'
            : '';
  return `${arrow} ${label} ${mag}${src}`;
}

export function formatImpactEvent(impact: ActionImpact): string {
  const adds = impact.adds.map((a) => `${a.count}× ${a.label}`).join(', ');
  const topDeltas = impact.deltas
    .slice(0, 4)
    .map((d) => formatImpactDelta(d))
    .join('; ');
  const eff =
    impact.efficacyPct < 100
      ? ` (${impact.efficacyPct}% efficacy)`
      : '';
  return `${impact.title}${eff} — adds ${adds}${topDeltas ? '; ' + topDeltas : ''}`;
}

export function buildStrainImpact(strainId: StrainId, regionId: RegionId): ActionImpact {
  const strain = STRAINS[strainId];
  const count = strain.spawnCount;
  const microbeType = strain.kind === 'commensal' ? 'commensal' : 'probiotic';
  const article =
    strain.articleKey && strain.articleClaim
      ? {
          title: ARTICLES[strain.articleKey].title,
          url: ARTICLES[strain.articleKey].url,
          claim: strain.articleClaim,
        }
      : undefined;
  return {
    title: strain.name,
    efficacyPct: 100,
    adds: [{ label: strain.name, count, type: microbeType }],
    deltas: biomeToDeltas(strain.effects ?? {}, 'strain'),
    why: strain.why,
    article,
    category: 'catalog',
  };
}

export function buildPrebioticImpact(prebioticId: PrebioticId, _regionId: RegionId): ActionImpact {
  const pre = PREBIOTICS[prebioticId];
  return {
    title: pre.name.toUpperCase(),
    efficacyPct: 100,
    adds: [{ label: pre.name.toUpperCase(), count: pre.spawnCount, type: 'prebiotic' }],
    deltas: [],
    why: pre.why,
    category: 'catalog',
  };
}

export function buildPostbioticImpact(postbioticId: PostbioticId, regionId: RegionId): ActionImpact {
  const def = POSTBIOTICS[postbioticId];
  const mult = postbioticRegionMultiplier(def, regionId);
  const efficacyPct = Math.round(mult * 100);
  const warning =
    mult < 1
      ? `Reduced efficacy outside ${def.preferredRegions.join(', ')} — ${efficacyPct}% dose applied.`
      : undefined;

  return {
    title: def.label,
    form: 'metabolite',
    efficacyPct,
    preferredRegions: def.preferredRegions,
    adds: [],
    deltas: biomeToDeltas(scaleBiomeEffect(def.effects, mult), 'strain'),
    why: def.why,
    warning,
    category: 'catalog',
  };
}

export function buildProductImpact(productId: ProductId, regionId: RegionId): ActionImpact {
  const product = PRODUCTS[productId];
  const mult = productRegionMultiplier(product, regionId);
  const efficacyPct = Math.round(mult * 100);

  const adds: ImpactAdd[] = [];
  for (const dose of product.strains) {
    const strain = STRAINS[dose.id];
    adds.push({
      label: strain.name,
      count: scaleCount(strain.spawnCount, dose.dose * mult),
      type: 'probiotic',
    });
  }
  for (const pre of product.prebiotics ?? []) {
    const preDef = PREBIOTICS[pre.id];
    adds.push({
      label: preDef.name.toUpperCase(),
      count: scaleCount(preDef.spawnCount, pre.dose * mult),
      type: 'prebiotic',
    });
  }

  const productEffects = product.effects ? scaleBiomeEffect(product.effects, mult) : undefined;
  const strainEffects = product.strains
    .map((dose) => {
      const strain = STRAINS[dose.id];
      return strain.effects ? scaleBiomeEffect(strain.effects, dose.dose * mult) : undefined;
    })
    .filter(Boolean) as BiomeEffect[];

  const mergedStrainEffects = mergeBiomeEffects(...strainEffects);
  const productDeltas = biomeToDeltas(productEffects ?? {}, 'product');
  const strainDeltas = biomeToDeltas(mergedStrainEffects, 'strains');
  const deltas = aggregateDeltas([...productDeltas, ...strainDeltas]);

  const warning =
    mult < 1
      ? `Reduced efficacy outside ${product.preferredRegions.join(', ')} — ${efficacyPct}% dose applied.`
      : undefined;

  return {
    title: product.label,
    form: product.form,
    efficacyPct,
    preferredRegions: product.preferredRegions,
    adds,
    deltas,
    why: product.why,
    warning,
    category: 'catalog',
  };
}

function stressorBiomeToDeltas(e: StressorBiomeDelta): ImpactDelta[] {
  const deltas: ImpactDelta[] = [];
  const push = (metric: ImpactMetric, value: number | undefined) => {
    if (value === undefined || Math.abs(value) < 0.001) return;
    deltas.push({ metric, delta: value, direction: directionFor(metric, value), source: 'stressor' });
  };
  push('ph', e.ph);
  push('moisture', e.moisture);
  push('integrity', e.integrity);
  push('inflammation', e.inflammation);
  push('biofilm', e.biofilm);
  push('postbiotic', e.postbioticLevel);
  push('commensal', e.commensalVitality);
  push('yeast', e.yeastVitality);
  return deltas;
}

function spawnTypeLabel(type: string): 'probiotic' | 'prebiotic' {
  return type === 'prebiotic' ? 'prebiotic' : 'probiotic';
}

export function buildStressorImpact(stressorId: string, regionId: RegionId): ActionImpact {
  const def = getStressor(stressorId);
  if (!def) {
    return {
      title: stressorId,
      efficacyPct: 100,
      adds: [],
      deltas: [],
      why: 'Unknown stressor',
      category: 'stressor',
    };
  }

  const adds: ImpactAdd[] = (def.spawns ?? []).map((s) => ({
    label: s.strain,
    count: s.count,
    type: spawnTypeLabel(s.type),
  }));

  const biome = resolveStressorBiome(def, regionId);
  const spectrumNote = def.antibioticRoute ? antibioticSpectrumWhy(def.antibioticRoute) : undefined;
  const why = spectrumNote ? `${spectrumNote} · ${def.log.join(' · ')}` : def.log.join(' · ');

  return {
    title: def.label,
    efficacyPct: 100,
    adds,
    deltas: biome ? stressorBiomeToDeltas(biome) : [],
    why,
    category: 'stressor',
  };
}

export function buildRegionalCareImpact(actionId: string, regionId: RegionId): ActionImpact {
  const region = getRegion(regionId);
  const regional = region.regionalCare.find((a) => a.id === actionId);
  const def = getInoculation(actionId);

  if (!regional || !def) {
    return {
      title: actionId,
      efficacyPct: 100,
      adds: [],
      deltas: [],
      why: 'Unknown regional treatment',
      category: 'regional',
    };
  }

  if (def.strain) {
    const strainImpact = buildStrainImpact(def.strain, regionId);
    return { ...strainImpact, title: regional.label, category: 'regional' };
  }

  if (def.postbiotic) {
    const postImpact = buildPostbioticImpact(def.postbiotic, regionId);
    return { ...postImpact, title: regional.label, category: 'regional' };
  }

  const deltas = def.biome
    ? stressorBiomeToDeltas(def.biome).map((d) => ({ ...d, source: 'regional' as const }))
    : [];

  return {
    title: regional.label,
    efficacyPct: 100,
    adds: def.impactAdds ?? [],
    deltas,
    why: def.why,
    category: 'regional',
  };
}

export function buildImpactForSource(kind: ImpactSourceKind, id: string, regionId: RegionId): ActionImpact {
  if (kind === 'stressor') return buildStressorImpact(id, regionId);
  if (kind === 'regional') return buildRegionalCareImpact(id, regionId);
  if (kind === 'strain') return buildStrainImpact(id as StrainId, regionId);
  if (kind === 'prebiotic') return buildPrebioticImpact(id as PrebioticId, regionId);
  if (kind === 'postbiotic') return buildPostbioticImpact(id as PostbioticId, regionId);
  return buildProductImpact(id as ProductId, regionId);
}

export function deltasForMeters(deltas: ImpactDelta[]): ImpactMetric[] {
  const metrics = new Set<ImpactMetric>();
  for (const d of deltas) {
    if (d.metric === 'integrity' || d.metric === 'inflammation') {
      metrics.add(d.metric);
    }
  }
  return [...metrics];
}
