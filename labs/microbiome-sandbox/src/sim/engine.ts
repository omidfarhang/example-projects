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

export class SimEngine {
  private tick = 0;
  private nodes: MicrobeNode[] = [];
  private nextId = 1;
  private events: string[] = [];
  private rand: () => number;
  private prevCounts = { probiotic: 0, pathogen: 0, allergen: 0, commensal: 0 };
  private trends = { probiotic: 0, pathogen: 0, allergen: 0, commensal: 0 };

  biome: BiomeState = {
    ph: 6.8,
    moisture: 0.7,
    integrity: 0.85,
    inflammation: 0.1,
    biofilm: 0.05,
    probioticCount: 0,
    pathogenCount: 0,
    allergenCount: 0,
    commensalCount: 0,
    postbioticLevel: 0,
  };

  constructor(
    public preset: PresetId,
    seed = 42,
  ) {
    this.rand = seededRandom(seed);
    this.seedBaseline();
  }

  private seedBaseline() {
    if (this.preset === 'allergy') {
      this.spawnBatch('commensal', 'commensal', 50);
      this.spawnBatch('probiotic', 'L. rhamnosus', 8);
      this.spawnBatch('pathogen', 'S. aureus', 6);
      this.spawnBatch('pathogen', 'H. influenzae', 4);
      this.biome.inflammation = 0.08;
    } else if (this.preset === 'candida') {
      this.spawnBatch('commensal', 'commensal', 30);
      this.spawnBatch('probiotic', 'L. acidophilus', 6);
      this.spawnBatch('yeast', 'C. albicans', 10);
      this.spawnBatch('pathogen', 'S. aureus', 4);
      this.biome.ph = 7.2;
      this.biome.biofilm = 0.15;
    } else {
      this.spawnBatch('commensal', 'commensal', 35);
      this.spawnBatch('probiotic', 'L. plantarum', 10);
      this.spawnBatch('prebiotic', 'inulin', 8);
      this.biome.integrity = 0.75;
    }
    this.updateCounts();
  }

  setPreset(preset: PresetId, env: { ph: number; moisture: number }) {
    this.preset = preset;
    this.biome.ph = env.ph;
    this.biome.moisture = env.moisture;
    this.reset();
  }

  reset() {
    this.tick = 0;
    this.nodes = [];
    this.events = [];
    this.biome.integrity = this.preset === 'lifecycle' ? 0.75 : 0.85;
    this.biome.inflammation = 0.1;
    this.biome.biofilm = this.preset === 'candida' ? 0.15 : 0.05;
    this.biome.postbioticLevel = 0;
    this.seedBaseline();
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

  trigger(id: string) {
    if (id === 'allergen') {
      this.spawnBatch('allergen', 'pollen', 35, { fromAbove: true });
      this.biome.inflammation = Math.min(1, this.biome.inflammation + 0.45);
      this.biome.integrity = Math.max(0.2, this.biome.integrity - 0.25);
      for (const n of this.nodes.filter((n) => n.type === 'commensal')) {
        n.vitality = Math.max(0, n.vitality - 0.25);
      }
      this.events.push('Allergen spike detected — epithelial stress rising');
      this.events.push('Commensals retreating from tight junctions');
    } else if (id === 'alkaline') {
      this.biome.ph = Math.min(8, this.biome.ph + 0.6);
      this.spawnBatch('yeast', 'C. albicans', 28);
      this.spawnBatch('pathogen', 'S. aureus', 8);
      this.biome.biofilm = Math.min(1, this.biome.biofilm + 0.35);
      this.events.push('Alkaline shift — C. albicans expansion');
    } else if (id === 'stress') {
      this.biome.integrity = Math.max(0.3, this.biome.integrity - 0.15);
      this.biome.inflammation = Math.min(1, this.biome.inflammation + 0.2);
      this.events.push('Mild stress applied to epithelium');
    }
    this.updateCounts();
  }

  inoculate(strain: string) {
    if (strain === 'prebiotic') {
      this.spawnBatch('prebiotic', 'inulin', 20);
      this.events.push('Prebiotic fiber added — substrate for probiotics');
    } else if (strain === 'postbiotic') {
      this.biome.postbioticLevel = Math.min(1, this.biome.postbioticLevel + 0.3);
      this.biome.integrity = Math.min(1, this.biome.integrity + 0.12);
      this.biome.inflammation = Math.max(0, this.biome.inflammation - 0.15);
      this.events.push('SCFA postbiotic surge — barrier recovery');
    } else if (strain === 'L. acidophilus') {
      this.spawnBatch('probiotic', strain, 18);
      this.biome.ph = Math.max(4.5, this.biome.ph - 0.5);
      this.biome.biofilm = Math.max(0, this.biome.biofilm - 0.2);
      this.events.push('L. acidophilus acidifying local pH');
    } else {
      this.spawnBatch('probiotic', strain, 16);
      this.biome.inflammation = Math.max(0, this.biome.inflammation - 0.18);
      this.biome.integrity = Math.min(1, this.biome.integrity + 0.1);
      this.events.push(`${strain} inoculated — competing for attachment`);
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

  private simulateTick() {
    const b = this.biome;

    for (const node of this.nodes) {
      // Epithelial receptor affinity — commensals & pathogens dock low, allergens float high.
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
        node.vy = Math.min(node.vy, -0.004);
        node.vx += Math.sin(this.tick * 0.05 + node.id) * 0.0005;
        if (node.y < -0.15) node.vy = Math.abs(node.vy) * 0.3;
      }

      if (Math.abs(node.x) > 1.8) node.vx *= -1;
      if (Math.abs(node.y) > 0.9) node.vy *= -1;

      if (node.type === 'probiotic') {
        node.vitality = Math.min(1, node.vitality + 0.002);
      } else if (node.type === 'pathogen' || node.type === 'yeast') {
        const phBoost = b.ph > 7 ? 0.003 : 0.001;
        const moistureBoost = b.moisture > 0.75 && b.ph > 7 ? 0.002 : 0;
        node.vitality = Math.min(1, node.vitality + phBoost + moistureBoost);
      } else if (node.type === 'allergen') {
        node.vitality = Math.max(0.2, node.vitality - 0.001);
      } else if (node.type === 'prebiotic') {
        const nearbyProbiotic = this.nodes.some(
          (n) => n.type === 'probiotic' && Math.hypot(n.x - node.x, n.y - node.y) < 0.4,
        );
        if (nearbyProbiotic) {
          node.vitality -= 0.008;
          b.postbioticLevel = Math.min(1, b.postbioticLevel + 0.004);
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
      b.integrity = Math.min(1, b.integrity + 0.001);
      b.inflammation = Math.max(0, b.inflammation - 0.0005);
    }
    if (b.ph < 6 && b.biofilm > 0) {
      b.biofilm = Math.max(0, b.biofilm - 0.002);
    }
    if (b.moisture < 0.4 && this.preset === 'candida') {
      b.integrity = Math.max(0.15, b.integrity - 0.0005);
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
