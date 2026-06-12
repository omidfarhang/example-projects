import { getRegion, type RegionId } from '../data/regions';
import type { PresetId } from '../data/presets';
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
    this.biome.ph = def.env.ph;
    this.biome.moisture = def.env.moisture;
    this.biome.sugarLoad = 0;
    this.biome.postbioticLevel = 0;
    this.allergenAdhesion = 0;
    this.updateCounts();
  }

  setPreset(preset: PresetId, env?: { ph: number; moisture: number }) {
    this.preset = preset;
    this.reset();
    if (env) {
      this.biome.ph = env.ph;
      this.biome.moisture = env.moisture;
    }
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
    const list = kind === 'trigger' ? def.triggers : def.inoculations;
    return list.some((a) => a.id === actionId);
  }

  trigger(id: string) {
    if (!this.isActionAllowed(id, 'trigger')) {
      this.events.push(`Trigger "${id}" not available for ${this.region} tissue`);
      return;
    }

    const b = this.biome;

    if (id === 'allergen') {
      this.spawnBatch('allergen', 'pollen', 35, { fromAbove: true });
      b.inflammation = clamp(b.inflammation + 0.45, 0, 1);
      b.integrity = Math.max(0.2, b.integrity - 0.25);
      this.adjustVitality(['commensal'], -0.25);
      this.events.push('Allergen spike detected — epithelial stress rising');
      this.events.push('Commensals retreating from tight junctions');
    } else if (id === 'dry_air') {
      b.moisture = Math.max(0.1, b.moisture - 0.25);
      b.integrity = Math.max(0.2, b.integrity - 0.12);
      this.allergenAdhesion = Math.min(1, this.allergenAdhesion + 0.3);
      this.events.push('Dry air exposure — mucus layer thinning');
    } else if (id === 'histamine') {
      b.inflammation = clamp(b.inflammation + 0.35, 0, 1);
      this.adjustVitality(['commensal'], -0.15);
      this.events.push('Histamine surge — nasal inflammation rising');
    } else if (id === 'alkaline') {
      b.ph = Math.min(8, b.ph + 0.6);
      b.sugarLoad = Math.min(1, b.sugarLoad + 0.6);
      this.spawnBatch('yeast', 'C. albicans', 28);
      this.spawnBatch('pathogen', 'S. aureus', 8);
      b.biofilm = clamp(b.biofilm + 0.35, 0, 1);
      this.events.push('Alkaline shift + sugar load — C. albicans expansion');
    } else if (id === 'topical_antibiotic') {
      this.adjustVitality(['commensal'], -0.4);
      this.adjustVitality(['probiotic'], -0.2);
      this.adjustVitality(['pathogen', 'yeast'], -0.1);
      this.events.push('Topical antibiotic — commensal diversity reduced');
    } else if (id === 'friction_irritant') {
      b.integrity = Math.max(0.2, b.integrity - 0.2);
      b.inflammation = clamp(b.inflammation + 0.25, 0, 1);
      this.spawnBatch('allergen', 'irritant', 18, { fromAbove: true });
      this.events.push('Friction/irritant — barrier micro-tears forming');
    } else if (id === 'stress') {
      b.integrity = Math.max(0.3, b.integrity - 0.15);
      b.inflammation = clamp(b.inflammation + 0.2, 0, 1);
      this.events.push('Mild stress applied to epithelium');
    } else if (id === 'enteropathogen_bloom') {
      this.spawnBatch('pathogen', 'Enteropathogen', 12);
      b.inflammation = clamp(b.inflammation + 0.3, 0, 1);
      this.events.push('Enteropathogen bloom — gut inflammation rising');
    } else if (id === 'antibiotic_disruption') {
      this.adjustVitality(['commensal'], -0.35);
      b.integrity = Math.max(0.2, b.integrity - 0.1);
      b.postbioticLevel = Math.max(0, b.postbioticLevel - 0.2);
      this.events.push('Antibiotic disruption — commensals depleted, SCFA falling');
    }

    this.updateCounts();
  }

  inoculate(actionId: string) {
    if (!this.isActionAllowed(actionId, 'inoculation')) {
      this.events.push(`Inoculation "${actionId}" not available for ${this.region} tissue`);
      return;
    }

    const b = this.biome;

    if (actionId === 'prebiotic') {
      this.spawnBatch('prebiotic', 'inulin', 20);
      this.events.push('Prebiotic fiber added — substrate for probiotics');
    } else if (actionId === 'scfa') {
      b.postbioticLevel = clamp(b.postbioticLevel + 0.3, 0, 1);
      b.integrity = clamp(b.integrity + 0.12, 0, 1);
      b.inflammation = Math.max(0, b.inflammation - 0.15);
      this.events.push('SCFA postbiotic surge — barrier recovery');
    } else if (actionId === 'lacid') {
      this.spawnBatch('probiotic', 'L. acidophilus', 18);
      b.ph = Math.max(4.5, b.ph - 0.5);
      b.biofilm = Math.max(0, b.biofilm - 0.2);
      this.events.push('L. acidophilus acidifying local pH');
    } else if (actionId === 'lrham') {
      this.spawnBatch('probiotic', 'L. rhamnosus', 16);
      b.inflammation = Math.max(0, b.inflammation - 0.18);
      b.integrity = clamp(b.integrity + 0.1, 0, 1);
      this.events.push('L. rhamnosus inoculated — competing for attachment');
    } else if (actionId === 'binf') {
      this.spawnBatch('probiotic', 'B. infantis', 14);
      this.adjustVitality(['commensal'], 0.2);
      b.integrity = clamp(b.integrity + 0.08, 0, 1);
      this.events.push('B. infantis applied — commensal support boosted');
    } else if (actionId === 'saline_mist') {
      b.moisture = clamp(b.moisture + 0.15, 0, 1);
      b.inflammation = Math.max(0, b.inflammation - 0.1);
      this.allergenAdhesion = Math.max(0, this.allergenAdhesion - 0.2);
      this.events.push('Saline mist — moisture restored, inflammation easing');
    } else if (actionId === 's_epidermidis') {
      this.spawnBatch('commensal', 'S. epidermidis', 20);
      b.biofilm = Math.max(0, b.biofilm - 0.15);
      this.events.push('S. epidermidis applied — commensal biofilm competition');
    } else if (actionId === 'ph_serum') {
      b.ph = Math.max(4.5, b.ph - 0.3);
      b.moisture = clamp(b.moisture + 0.05, 0, 1);
      this.events.push('pH balancing serum — local acidity restored');
    } else if (actionId === 'lplant') {
      this.spawnBatch('probiotic', 'L. plantarum', 16);
      b.inflammation = Math.max(0, b.inflammation - 0.18);
      b.integrity = clamp(b.integrity + 0.1, 0, 1);
      this.events.push('L. plantarum seeded — competing for attachment');
    }

    this.updateCounts();
  }

  setEnv(ph: number, moisture: number) {
    this.biome.ph = ph;
    this.biome.moisture = moisture;
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

  private probioticGrowthRate(ph: number): number {
    if (ph >= 5.5 && ph <= 6.8) return 0.004;
    if (ph >= 5.0 && ph <= 7.2) return 0.002;
    return 0.0005;
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
        if (region === 'nose' && b.moisture < 0.45) {
          node.vitality = Math.min(1, node.vitality + 0.0015);
        }
      }

      if (Math.abs(node.x) > 1.8) node.vx *= -1;
      if (Math.abs(node.y) > 0.9) node.vy *= -1;

      if (node.type === 'probiotic') {
        let rate = this.probioticGrowthRate(b.ph);
        if (region === 'gut' && b.moisture >= 0.55 && b.moisture <= 0.75) {
          rate += 0.001;
        }
        node.vitality = Math.min(1, node.vitality + rate);
      } else if (node.type === 'pathogen' || node.type === 'yeast') {
        let rate = this.pathogenGrowthRate(b.ph, b.moisture, b.sugarLoad);
        if (region === 'skin' && b.moisture > 0.8 && b.ph > 7) {
          rate += 0.002;
        }
        node.vitality = Math.min(1, node.vitality + rate);
      } else if (node.type === 'commensal') {
        if (b.ph < 5.5 || b.ph > 7.5) {
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
    if (b.ph < 6 && b.biofilm > 0) {
      b.biofilm = Math.max(0, b.biofilm - 0.002);
    }

    if (region === 'skin') {
      if (b.moisture < 0.35) {
        b.integrity = Math.max(0.15, b.integrity - 0.001 * 1.5);
      }
    } else if (region === 'nose') {
      if (b.moisture < 0.4) {
        b.integrity = Math.max(0.15, b.integrity - 0.0006);
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
