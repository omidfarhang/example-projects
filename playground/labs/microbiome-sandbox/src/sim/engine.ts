import type { PresetId } from '../data/presets';
import type { BiomeState, MicrobeNode, MicrobeType, SimSnapshot } from './types';

const FIXED_DT = 1 / 30;
const MAX_NODES = 400;

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
  private prevCounts = { probiotic: 0, pathogen: 0, allergen: 0 };
  private trends = { probiotic: 0, pathogen: 0, allergen: 0 };

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
    this.spawnBatch('commensal', 'commensal', 40);
    this.spawnBatch('probiotic', 'L. rhamnosus', 12);
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
    this.biome.integrity = 0.85;
    this.biome.inflammation = 0.1;
    this.biome.biofilm = 0.05;
    this.biome.postbioticLevel = 0;
    this.seedBaseline();
  }

  private spawnBatch(type: MicrobeType, strain: string, count: number) {
    for (let i = 0; i < count && this.nodes.length < MAX_NODES; i++) {
      this.nodes.push({
        id: this.nextId++,
        type,
        strain,
        vitality: 0.7 + this.rand() * 0.3,
        x: (this.rand() - 0.5) * 3,
        y: (this.rand() - 0.5) * 1.2,
        z: (this.rand() - 0.5) * 0.8,
        vx: (this.rand() - 0.5) * 0.02,
        vy: (this.rand() - 0.5) * 0.01,
      });
    }
  }

  trigger(id: string) {
    if (id === 'allergen') {
      this.spawnBatch('allergen', 'pollen', 35);
      this.biome.inflammation = Math.min(1, this.biome.inflammation + 0.45);
      this.biome.integrity = Math.max(0.2, this.biome.integrity - 0.25);
      this.events.push('Allergen spike detected — epithelial stress rising');
    } else if (id === 'alkaline') {
      this.biome.ph = Math.min(8, this.biome.ph + 0.6);
      this.spawnBatch('yeast', 'C. albicans', 28);
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
      node.x += node.vx;
      node.y += node.vy;
      if (Math.abs(node.x) > 1.8) node.vx *= -1;
      if (Math.abs(node.y) > 0.9) node.vy *= -1;

      if (node.type === 'probiotic') {
        node.vitality = Math.min(1, node.vitality + 0.002);
      } else if (node.type === 'pathogen' || node.type === 'yeast') {
        const phBoost = b.ph > 7 ? 0.003 : 0.001;
        node.vitality = Math.min(1, node.vitality + phBoost);
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

    // Probiotics suppress pathogens/allergens
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
    this.prevCounts = {
      probiotic: b.probioticCount,
      pathogen: b.pathogenCount,
      allergen: b.allergenCount,
    };
  }

  getTrends() {
    return { ...this.trends };
  }

  snapshot(): SimSnapshot {
    return {
      tick: this.tick,
      biome: { ...this.biome },
      nodes: this.nodes.map((n) => ({ ...n })),
      events: [...this.events].slice(-3),
    };
  }
}
