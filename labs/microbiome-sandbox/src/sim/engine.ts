import type { EnvVarId } from '../data/envVars';
import { getProduct, type ProductId } from '../data/products';
import { getPostbiotic, postbioticRegionMultiplier, type PostbioticId } from '../data/postbiotics';
import { getRegion, type RegionId } from '../data/regions';
import { getStressor, type StressorBiomeDelta } from '../data/stressors';
import type { PresetId } from '../data/presets';
import {
  getStrain,
  PREBIOTICS,
  STRAINS,
  type PrebioticId,
  type StrainId,
  type BiomeEffect,
} from '../data/strains';
import { buildProductImpact, formatImpactEvent } from '../ui/actionImpact';
import { applyBiomeEffects, scaleBiomeEffect, scaleCount } from './bioticEffects';
import type { BiomeState, MicrobeNode, MicrobeType, SimSnapshot } from './types';

const FIXED_DT = 1 / 30;
const MAX_NODES = 400;
export const POPULATION_SCALE = 1000;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export class SimEngine {
  private tick = 0;
  private nodes: MicrobeNode[] = [];
  private nextId = 1;
  private events: string[] = [];
  private rand: () => number;
  private prevCounts = { probiotic: 0, pathogen: 0, allergen: 0, commensal: 0 };
  private trends = { probiotic: 0, pathogen: 0, allergen: 0, commensal: 0 };
  private allergenAdhesion = 0;

  region: RegionId = 'nose';

  biome: BiomeState = {
    ph: 6.8,
    moisture: 0.7,
    temperature: 0.55,
    sebum: 0.35,
    cerumen: 0.3,
    salinity: 0.4,
    oxygenation: 0.75,
    sweatRate: 0.25,
    oxygenTension: 0.15,
    integrity: 0.85,
    inflammation: 0.1,
    biofilm: 0.05,
    sugarLoad: 0,
    probioticCount: 0,
    pathogenCount: 0,
    allergenCount: 0,
    commensalCount: 0,
    postbioticLevel: 0,
  };

  constructor(
    public preset: PresetId,
    region: RegionId = 'nose',
    seed = 42,
  ) {
    this.rand = seededRandom(seed);
    this.setRegion(region);
  }

  private seedFromRegion() {
    const def = getRegion(this.region);
    const b = def.baseline;

    this.spawnBatch('commensal', 'commensal', b.commensals);
    for (const p of b.probiotics) {
      this.spawnBatch('probiotic', p.strain, p.count);
    }
    for (const p of b.pathogens ?? []) {
      this.spawnBatch(p.kind, p.strain, p.count);
    }
    for (const p of b.prebiotics ?? []) {
      this.spawnBatch('prebiotic', p.strain, p.count);
    }

    this.biome.integrity = b.integrity ?? 0.85;
    this.biome.inflammation = b.inflammation ?? 0.1;
    this.biome.biofilm = b.biofilm ?? 0.05;
    this.applyEnv(def.env);
    this.biome.sugarLoad = 0;
    this.biome.postbioticLevel = 0;
    this.allergenAdhesion = 0;
    this.updateCounts();
  }

  setPreset(preset: PresetId, env?: Partial<Record<EnvVarId, number>>) {
    this.preset = preset;
    this.reset();
    if (env) this.applyEnv(env);
  }

  setRegion(id: RegionId, force = false) {
    if (!force && this.region === id && this.nodes.length > 0) return;
    this.region = id;
    this.reset();
  }

  reset() {
    this.tick = 0;
    this.nodes = [];
    this.events = [];
    this.seedFromRegion();
  }

  private spawnBatch(type: MicrobeType, strain: string, count: number, opts?: { fromAbove?: boolean }) {
    const epithelial = type === 'commensal' || type === 'pathogen' || type === 'yeast' || type === 'probiotic';
    for (let i = 0; i < count && this.nodes.length < MAX_NODES; i++) {
      const fromAbove = opts?.fromAbove ?? false;
      this.nodes.push({
        id: this.nextId++,
        type,
        strain,
        vitality: 0.7 + this.rand() * 0.3,
        x: (this.rand() - 0.5) * 3.4,
        y: fromAbove
          ? 0.55 + this.rand() * 0.7
          : epithelial
            ? -0.55 + this.rand() * 0.65
            : (this.rand() - 0.5) * 1.2,
        z: (this.rand() - 0.5) * 1.4,
        vx: (this.rand() - 0.5) * 0.018,
        vy: fromAbove ? -0.015 - this.rand() * 0.01 : (this.rand() - 0.5) * 0.012,
      });
    }
  }

  private adjustVitality(types: MicrobeType[], delta: number) {
    for (const n of this.nodes.filter((n) => types.includes(n.type))) {
      n.vitality = clamp(n.vitality + delta, 0, 1);
    }
  }

  private isActionAllowed(actionId: string, kind: 'trigger' | 'inoculation'): boolean {
    const def = getRegion(this.region);
    const list = kind === 'trigger' ? def.triggers : def.regionalCare;
    return list.some((a) => a.id === actionId);
  }

  private applyStrainBiomeEffects(effects?: BiomeEffect) {
    if (!effects) return;
    const b = this.biome;
    applyBiomeEffects(b, effects);
    if (effects.biofilm !== undefined && effects.biofilm < 0) {
      b.biofilm = Math.max(0, b.biofilm);
    }
    if (effects.commensalVitality !== undefined) {
      this.adjustVitality(['commensal'], effects.commensalVitality);
    }
    if (effects.yeastVitality !== undefined) {
      this.adjustVitality(['yeast'], effects.yeastVitality);
    }
  }

  /** Apply a single strain from the library (probiotic or commensal). */
  inoculateStrain(strainId: StrainId) {
    const def = getStrain(strainId);
    const microbeType = def.kind === 'commensal' ? 'commensal' : 'probiotic';
    this.spawnBatch(microbeType, def.name, def.spawnCount);
    this.applyStrainBiomeEffects(def.effects);
    this.events.push(this.legacyStrainEvent(strainId));
    this.updateCounts();
  }

  /** Add prebiotic substrate from the catalog. */
  inoculatePrebiotic(prebioticId: PrebioticId) {
    const def = PREBIOTICS[prebioticId];
    this.spawnBatch('prebiotic', def.name, def.spawnCount);
    this.events.push(`${def.name} prebiotic added — substrate for probiotics`);
    this.updateCounts();
  }

  /** Apply a postbiotic metabolite directly (raises postbioticLevel scalar). */
  applyPostbiotic(postbioticId: PostbioticId) {
    const def = getPostbiotic(postbioticId);
    const mult = postbioticRegionMultiplier(def, this.region);

    if (mult < 1) {
      this.events.push(
        `${def.label} — reduced efficacy outside ${def.preferredRegions.join('/')}`,
      );
    }

    this.applyStrainBiomeEffects(scaleBiomeEffect(def.effects, mult));
    this.events.push(`${def.label} applied — postbiotic metabolites active`);
    this.updateCounts();
  }

  /** Apply a whole supplement or fermented food product. */
  applyProduct(productId: ProductId) {
    const product = getProduct(productId);
    const mult = product.preferredRegions.includes(this.region)
      ? product.preferredMultiplier
      : product.otherMultiplier;

    if (mult < 1) {
      this.events.push(
        `${product.label} — reduced efficacy outside ${product.preferredRegions.join('/')}`,
      );
    }

    for (const dose of product.strains) {
      const strain = STRAINS[dose.id];
      const count = scaleCount(strain.spawnCount, dose.dose * mult);
      this.spawnBatch('probiotic', strain.name, count);
      if (strain.effects) {
        this.applyStrainBiomeEffects(scaleBiomeEffect(strain.effects, dose.dose * mult));
      }
    }

    for (const pre of product.prebiotics ?? []) {
      const preDef = PREBIOTICS[pre.id];
      const count = scaleCount(preDef.spawnCount, pre.dose * mult);
      this.spawnBatch('prebiotic', preDef.name, count);
    }

    if (product.effects) {
      this.applyStrainBiomeEffects(scaleBiomeEffect(product.effects, mult));
    }

    const impact = buildProductImpact(productId, this.region);
    this.events.push(formatImpactEvent(impact));
    this.updateCounts();
  }

  trigger(id: string) {
    if (!this.isActionAllowed(id, 'trigger')) {
      this.events.push(`Trigger "${id}" not available for ${this.region} tissue`);
      return;
    }

    const def = getStressor(id);
    if (!def) {
      this.events.push(`Unknown trigger "${id}"`);
      return;
    }

    if (def.biome) {
      this.applyStressorBiome(def.biome);
    }
    for (const spawn of def.spawns ?? []) {
      this.spawnBatch(spawn.type, spawn.strain, spawn.count, spawn.fromAbove ? { fromAbove: true } : undefined);
    }
    for (const line of def.log) {
      this.events.push(line);
    }

    this.updateCounts();
  }

  private applyStressorBiome(e: StressorBiomeDelta) {
    const b = this.biome;

    const add = (field: keyof BiomeState, delta: number | undefined, min?: number, max?: number) => {
      if (delta === undefined) return;
      let next = (b[field] as number) + delta;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      (b[field] as number) = next;
    };

    add('ph', e.ph, e.phMin, e.phMax);
    add('moisture', e.moisture, e.moistureMin, e.moistureMax);
    add('temperature', e.temperature, e.temperatureMin, e.temperatureMax);
    add('sebum', e.sebum, e.sebumMin, e.sebumMax);
    add('cerumen', e.cerumen, undefined, e.cerumenMax);
    add('salinity', e.salinity, undefined, e.salinityMax);
    add('oxygenation', e.oxygenation, e.oxygenationMin, undefined);
    add('oxygenTension', e.oxygenTension);
    add('sweatRate', e.sweatRate, undefined, e.sweatRateMax);
    add('integrity', e.integrity, e.integrityMin, 1);
    if (e.inflammation !== undefined) {
      b.inflammation = clamp(b.inflammation + e.inflammation, 0, 1);
    }
    if (e.biofilm !== undefined) {
      b.biofilm = clamp(b.biofilm + e.biofilm, 0, 1);
    }
    add('sugarLoad', e.sugarLoad, undefined, e.sugarLoadMax);
    add('postbioticLevel', e.postbioticLevel, e.postbioticMin, 1);

    if (e.allergenAdhesion !== undefined) {
      this.allergenAdhesion = e.allergenAdhesionMax !== undefined
        ? Math.min(e.allergenAdhesionMax, this.allergenAdhesion + e.allergenAdhesion)
        : this.allergenAdhesion + e.allergenAdhesion;
    }

    if (e.commensalVitality !== undefined) this.adjustVitality(['commensal'], e.commensalVitality);
    if (e.probioticVitality !== undefined) this.adjustVitality(['probiotic'], e.probioticVitality);
    if (e.pathogenVitality !== undefined) this.adjustVitality(['pathogen', 'yeast'], e.pathogenVitality);
    if (e.yeastVitality !== undefined) this.adjustVitality(['yeast'], e.yeastVitality);
  }

  inoculate(actionId: string) {
    if (!this.isActionAllowed(actionId, 'inoculation')) {
      this.events.push(`Inoculation "${actionId}" not available for ${this.region} tissue`);
      return;
    }

    const b = this.biome;

    const strainLegacy: Record<string, StrainId> = {
      lrham: 'lrham',
      lacid: 'lacid',
      binf: 'binf',
      lplant: 'lplant',
      lsaliv: 'lsaliv',
      sboul: 'sboul',
      lcasei: 'lcasei',
      lreuteri: 'lreuteri',
      blactis: 'blactis',
      blongum: 'blongum',
      bbifidum: 'bbifidum',
      lbulgaricus: 'lbulgaricus',
      sthermo: 'sthermo',
    };

    if (strainLegacy[actionId]) {
      const id = strainLegacy[actionId];
      const def = getStrain(id);
      this.spawnBatch('probiotic', def.name, def.spawnCount);
      this.applyStrainBiomeEffects(def.effects);
      this.events.push(this.legacyStrainEvent(id));
      this.updateCounts();
      return;
    }

    if (actionId === 'prebiotic') {
      this.inoculatePrebiotic('inulin');
      return;
    }
    if (actionId === 'prebiotic_fos') {
      this.inoculatePrebiotic('fos');
      return;
    }

    if (actionId === 'scfa') {
      this.applyPostbiotic('scfa_mix');
      return;
    }

    if (actionId === 's_epidermidis') {
      this.inoculateStrain('sepidermidis');
      return;
    }

    if (actionId === 'saline_mist') {
      b.moisture = clamp(b.moisture + 0.15, 0, 1);
      b.inflammation = Math.max(0, b.inflammation - 0.1);
      this.allergenAdhesion = Math.max(0, this.allergenAdhesion - 0.2);
      this.events.push('Saline mist — moisture restored, inflammation easing');
    } else if (actionId === 'ph_serum') {
      b.ph = clamp(b.ph - 0.35, 3.8, 7);
      b.moisture = clamp(b.moisture + 0.05, 0, 1);
      this.events.push('pH balancing serum — local acidity restored');
    }

    this.updateCounts();
  }

  private legacyStrainEvent(id: StrainId): string {
    const messages: Partial<Record<StrainId, string>> = {
      lrham: 'L. rhamnosus inoculated — competing for attachment',
      lacid: 'L. acidophilus acidifying local pH',
      binf: 'B. infantis applied — commensal support boosted',
      lplant: 'L. plantarum seeded — competing for attachment',
      lsaliv: 'L. salivarius applied — oral commensal niche restored',
      sboul: 'S. boulardii seeded — antifungal competition active',
      lcasei: 'L. casei inoculated — immune-modulatory strain active',
      lreuteri: 'L. reuteri applied — antimicrobial metabolites rising',
      blactis: 'B. lactis seeded — bifidobacterial niche expanding',
      blongum: 'B. longum applied — fiber fermenting commensals supported',
      bbifidum: 'B. bifidum inoculated — early-life commensal pattern',
      lbulgaricus: 'L. bulgaricus applied — yogurt culture acidifying',
      sthermo: 'S. thermophilus seeded — fermented dairy culture active',
      ssaliv_k12: 'S. salivarius K12 applied — oral BLIS activity, biofilm competition',
      ssaliv_m18: 'S. salivarius M18 applied — dental plaque & gum niche restoration',
      lparacasei: 'L. paracasei inoculated — immune-modulatory strain active',
      lgasseri: 'L. gasseri applied — vaginal/oral acidification and barrier support',
      lferment: 'L. fermentum seeded — fermentation and SCFA production rising',
      bbreve: 'B. breve inoculated — infant-style bifidobacterial niche expanding',
      sepidermidis: 'S. epidermidis applied — commensal biofilm competition',
    };
    return messages[id] ?? `${getStrain(id).name} inoculated — strain colony forming`;
  }

  applyEnv(env: Partial<Record<EnvVarId, number>>) {
    for (const [key, value] of Object.entries(env)) {
      if (value !== undefined) {
        (this.biome as Record<string, number>)[key] = value;
      }
    }
  }

  setEnv(env: Partial<Record<EnvVarId, number>>) {
    this.applyEnv(env);
  }

  step(dt: number) {
    const steps = Math.min(4, Math.ceil(dt / FIXED_DT));
    for (let s = 0; s < steps; s++) {
      this.tick++;
      this.simulateTick();
    }
    this.updateTrends();
    return this.snapshot();
  }

  private probioticGrowthRate(ph: number, region: RegionId): number {
    if (region === 'oral' || region === 'vaginal') {
      if (ph >= 3.8 && ph <= 5.2) return 0.004;
      if (ph >= 3.5 && ph <= 6.0) return 0.002;
      return 0.0005;
    }
    if (ph >= 5.5 && ph <= 6.8) return 0.004;
    if (ph >= 5.0 && ph <= 7.2) return 0.002;
    return 0.0005;
  }

  private tempMultiplier(temp: number): number {
    const dist = Math.abs(temp - 0.55);
    return Math.max(0.35, 1 - dist * 1.4);
  }

  private pathogenGrowthRate(ph: number, moisture: number, sugarLoad: number): number {
    let rate = ph > 7.2 ? 0.004 : ph > 7 ? 0.003 : 0.001;
    if (moisture > 0.75 && ph > 7) rate += 0.002;
    rate += sugarLoad * 0.003;
    return rate;
  }

  private simulateTick() {
    const b = this.biome;
    const region = this.region;

    b.sugarLoad = Math.max(0, b.sugarLoad - 0.001);
    const tempMul = this.tempMultiplier(b.temperature);

    if (region === 'scalp') {
      b.moisture = clamp(b.moisture + b.sweatRate * 0.0004 - 0.0001, 0, 1);
    }
    if (region === 'ear' && b.cerumen > 0.55) {
      b.oxygenation = Math.max(0.1, b.oxygenation - 0.0005);
    }

    for (const node of this.nodes) {
      if (node.type === 'commensal' || node.type === 'pathogen' || node.type === 'yeast') {
        node.vy -= 0.0008;
        node.vx += Math.sin(this.tick * 0.04 + node.id * 1.7) * 0.00015;
      } else if (node.type === 'probiotic') {
        node.vy -= 0.0004;
        node.vx += Math.sin(this.tick * 0.03 + node.id) * 0.00012;
      } else if (node.type === 'prebiotic') {
        node.vy += Math.sin(this.tick * 0.04 + node.id) * 0.0006;
        node.vx += Math.cos(this.tick * 0.035 + node.id * 0.8) * 0.0004;
      }

      node.x += node.vx;
      node.y += node.vy;

      if (node.type === 'allergen') {
        node.vy = Math.min(node.vy, -0.004 - this.allergenAdhesion * 0.002);
        node.vx += Math.sin(this.tick * 0.05 + node.id) * 0.0005;
        if (node.y < -0.15) node.vy = Math.abs(node.vy) * 0.3;
        if ((region === 'nose' || region === 'ear') && b.moisture < 0.45) {
          node.vitality = Math.min(1, node.vitality + 0.0015);
        }
      }

      if (Math.abs(node.x) > 1.8) node.vx *= -1;
      if (Math.abs(node.y) > 0.9) node.vy *= -1;

      if (node.type === 'probiotic') {
        let rate = this.probioticGrowthRate(b.ph, region) * tempMul;
        if (region === 'gut' && b.moisture >= 0.55 && b.moisture <= 0.75) {
          rate += 0.001;
        }
        if (region === 'gut' && b.oxygenTension > 0.35) rate *= 0.5;
        if (region === 'vaginal' && b.oxygenTension < 0.2) rate += 0.001;
        if (region === 'vaginal' && b.ph > 5.0) rate *= 0.4;
        if (region === 'oral' && b.moisture > 0.6) rate += 0.0008;
        if (region === 'oral' && b.moisture < 0.35) rate *= 0.5;
        if ((region === 'nose' || region === 'ear') && b.oxygenation < 0.4) rate *= 0.7;
        node.vitality = Math.min(1, node.vitality + rate);
      } else if (node.type === 'pathogen' || node.type === 'yeast') {
        let rate = this.pathogenGrowthRate(b.ph, b.moisture, b.sugarLoad) * tempMul;
        if ((region === 'skin' || region === 'scalp') && b.moisture > 0.8 && b.ph > 7) {
          rate += 0.002;
        }
        if (region === 'scalp' && b.sebum > 0.55 && node.type === 'yeast') {
          rate += 0.0025;
        }
        if (region === 'ear' && b.cerumen > 0.6 && b.oxygenation < 0.45) {
          rate += 0.0015;
        }
        if (region === 'ear' && b.salinity > 0.7) rate *= 0.75;
        if ((region === 'nose' || region === 'ear') && b.oxygenation < 0.35) {
          rate += 0.001;
        }
        if ((region === 'oral' || region === 'vaginal') && node.type === 'yeast') {
          if (b.ph > 5.5) rate += 0.003;
          if (b.moisture < 0.4 && region === 'oral') rate += 0.002;
          if (b.sugarLoad > 0.3) rate += 0.002;
        }
        if (region === 'vaginal' && b.ph > 5.0 && node.type === 'yeast') {
          rate += 0.0025;
        }
        node.vitality = Math.min(1, node.vitality + rate);
      } else if (node.type === 'commensal') {
        if (region === 'vaginal' && b.ph > 5.5) {
          node.vitality = Math.max(0.05, node.vitality - 0.0015);
        } else if (b.ph < 5.5 || b.ph > 7.5) {
          node.vitality = Math.max(0.05, node.vitality - 0.001);
        } else {
          node.vitality = Math.min(1, node.vitality + 0.0005);
        }
      } else if (node.type === 'allergen') {
        node.vitality = Math.max(0.2, node.vitality - 0.001);
      } else if (node.type === 'prebiotic') {
        const nearbyProbiotic = this.nodes.some(
          (n) => n.type === 'probiotic' && Math.hypot(n.x - node.x, n.y - node.y) < 0.4,
        );
        if (nearbyProbiotic) {
          let conversion = 0.008;
          if (region === 'gut' && b.moisture < 0.45) conversion *= 0.4;
          node.vitality -= conversion;
          b.postbioticLevel = clamp(b.postbioticLevel + conversion * 0.5, 0, 1);
        }
      }
    }

    const probiotics = this.nodes.filter((n) => n.type === 'probiotic' && n.vitality > 0.4);
    for (const p of probiotics) {
      for (const target of this.nodes) {
        if (target.type === 'pathogen' || target.type === 'allergen' || target.type === 'yeast') {
          const d = Math.hypot(p.x - target.x, p.y - target.y);
          if (d < 0.35) {
            target.vitality = Math.max(0, target.vitality - 0.006);
          }
        }
      }
    }

    this.nodes = this.nodes.filter((n) => n.vitality > 0.05);

    if (b.inflammation > 0.3) {
      b.integrity = Math.max(0.15, b.integrity - 0.0008);
    }
    if (b.postbioticLevel > 0.2) {
      b.integrity = clamp(b.integrity + 0.001, 0, 1);
      b.inflammation = Math.max(0, b.inflammation - 0.0005);
    }

    if (b.ph > 7 && b.moisture > 0.5) {
      b.biofilm = clamp(b.biofilm + 0.0008, 0, 1);
    }
    if (region === 'scalp' && b.sebum > 0.5) {
      b.biofilm = clamp(b.biofilm + 0.0012, 0, 1);
    }
    if (region === 'ear' && b.cerumen > 0.45) {
      b.biofilm = clamp(b.biofilm + 0.0006, 0, 1);
    }
    if (region === 'oral' && b.moisture < 0.4) {
      b.biofilm = clamp(b.biofilm + 0.001, 0, 1);
    }
    if (region === 'vaginal' && b.ph > 5.2) {
      b.biofilm = clamp(b.biofilm + 0.0012, 0, 1);
    }
    if (b.ph < 6 && b.biofilm > 0) {
      b.biofilm = Math.max(0, b.biofilm - 0.002);
    }

    if (region === 'skin' || region === 'scalp') {
      if (b.moisture < 0.35) {
        b.integrity = Math.max(0.15, b.integrity - 0.001 * 1.5);
      }
    } else if (region === 'nose' || region === 'ear') {
      if (b.moisture < 0.4) {
        b.integrity = Math.max(0.15, b.integrity - 0.0006);
      }
    } else if (region === 'oral') {
      if (b.moisture < 0.35) {
        b.integrity = Math.max(0.15, b.integrity - 0.0009);
      }
    } else if (region === 'vaginal') {
      if (b.ph > 5.0) {
        b.integrity = Math.max(0.15, b.integrity - 0.001);
      }
    }

    this.updateCounts();
  }

  private updateCounts() {
    const b = this.biome;
    b.probioticCount = this.nodes.filter((n) => n.type === 'probiotic').length;
    b.pathogenCount = this.nodes.filter((n) => n.type === 'pathogen' || n.type === 'yeast').length;
    b.allergenCount = this.nodes.filter((n) => n.type === 'allergen').length;
    b.commensalCount = this.nodes.filter((n) => n.type === 'commensal').length;
  }

  private updateTrends() {
    const b = this.biome;
    this.trends.probiotic = Math.sign(b.probioticCount - this.prevCounts.probiotic);
    this.trends.pathogen = Math.sign(b.pathogenCount - this.prevCounts.pathogen);
    this.trends.allergen = Math.sign(b.allergenCount - this.prevCounts.allergen);
    this.trends.commensal = Math.sign(b.commensalCount - this.prevCounts.commensal);
    this.prevCounts = {
      probiotic: b.probioticCount,
      pathogen: b.pathogenCount,
      allergen: b.allergenCount,
      commensal: b.commensalCount,
    };
  }

  getTrends() {
    return { ...this.trends };
  }

  getDynamicScenario(): string {
    const b = this.biome;
    const last = this.events[this.events.length - 1];
    if (last) {
      return `${last} · barrier ${Math.round(b.integrity * 100)}% · inflammation ${Math.round(b.inflammation * 100)}%`;
    }
    return '';
  }

  snapshot(): SimSnapshot {
    return {
      tick: this.tick,
      biome: { ...this.biome },
      nodes: this.nodes.map((n) => ({ ...n })),
      events: [...this.events].slice(-8),
    };
  }
}
