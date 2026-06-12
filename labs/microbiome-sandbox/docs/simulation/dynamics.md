# Simulation Dynamics

Per-tick rules governing microbe movement, growth, competition, conversion, and emergent biome effects.

Source: [`src/sim/engine.ts`](../src/sim/engine.ts) — `simulateTick()`, growth helpers

---

## Tick order

Each `simulateTick()` executes in this order:

1. Decay `sugarLoad` (region-specific rate — oral fastest, gut slowest; see `sugarLoadDecay.ts`)
2. Compute temperature multiplier
3. Region-specific env drift (scalp moisture, ear oxygenation)
4. For each node: movement, boundary reflection, type-specific vitality update
5. Probiotic suppression pass (strain-specific radius and strength — see `strains.ts` `competition`)
6. Prune nodes with vitality ≤ 0.05
7. Emergent biome updates (integrity, inflammation dynamics, biofilm; gut tryptophan on gut tissue)
8. Region-specific integrity decay from low moisture / high vaginal pH
9. `updateInflammationDynamics()` then `updateCounts()`

---

## Movement

### Commensals, pathogens, yeast

- Vertical drift: `vy -= 0.0008` (gravity-like)
- Horizontal wobble: `vx += sin(tick × 0.04 + id × 1.7) × 0.00015`

### Probiotics

- Lighter drift: `vy -= 0.0004`
- Wobble: `vx += sin(tick × 0.03 + id) × 0.00012`

### Prebiotics

- Floating: `vy` and `vx` driven by sinusoids (lumen drift)

### Allergens

- Fall faster with adhesion: `vy = min(vy, −0.004 − adhesion × 0.002)`
- Extra horizontal wobble
- Bounce at y = −0.15: `vy = abs(vy) × 0.3`
- In dry nose/ear (moisture < 0.45): vitality +0.0015/tick

### Boundaries

- Reflect at |x| > 1.8: `vx *= −1`
- Reflect at |y| > 0.9: `vy *= −1`

---

## Growth rates

### Temperature multiplier

```text
tempMul = max(0.35, 1 − |temperature − 0.55| × 1.4)
```

Optimal growth at temperature = 0.55 (~36.2°C displayed).

### Probiotics — `probioticGrowthRate(ph, region)`

| Region | Optimal pH (rate 0.004) | Acceptable (rate 0.002) | Poor (rate 0.0005) |
| --- | --- | --- | --- |
| oral, vaginal | 3.8–5.2 | 3.5–6.0 | otherwise |
| other | 5.5–6.8 | 5.0–7.2 | otherwise |

**Region modifiers** (added to base rate unless noted):

| Region | Condition | Modifier |
| --- | --- | --- |
| gut | moisture 0.55–0.75 | +0.001 |
| gut | oxygenTension > 0.35 | rate × 0.5 |
| vaginal | oxygenTension < 0.2 | +0.001 |
| vaginal | ph > 5.0 | rate × 0.4 |
| oral | moisture > 0.6 | +0.0008 |
| oral | moisture < 0.35 | rate × 0.5 |
| nose, ear | oxygenation < 0.4 | rate × 0.7 |

Final: `vitality += rate × tempMul` (cap 1)

### Pathogens and yeast — `pathogenGrowthRate(ph, moisture, sugarLoad)`

Base rate:

- pH > 7.2 → 0.004
- pH > 7 → 0.003
- else → 0.001

Bonuses:

- moisture > 0.75 and pH > 7 → +0.002
- sugarLoad × 0.003

**Region modifiers:**

| Region | Condition | Modifier |
| --- | --- | --- |
| skin, scalp | moisture > 0.8 and pH > 7 | +0.002 |
| scalp | sebum > 0.55 (yeast) | +0.0025 |
| ear | cerumen > 0.6 and oxygenation < 0.45 | +0.0015 |
| ear | salinity > 0.7 | rate × 0.75 |
| nose, ear | oxygenation < 0.35 | +0.001 |
| oral, vaginal | yeast and pH > 5.5 | +0.003 |
| oral | yeast and moisture < 0.4 | +0.002 |
| oral, vaginal | yeast and sugarLoad > 0.3 | +0.002 |
| vaginal | yeast and pH > 5.0 | +0.0025 |

### Commensals

- If vaginal and pH > 5.5: vitality −0.0015/tick (floor 0.05)
- Else if pH < 5.5 or pH > 7.5: vitality −0.001/tick
- Else: vitality +0.0005/tick (cap 1)

### Allergens

- vitality −0.001/tick (floor 0.2)

### Prebiotics

If probiotic within distance 0.4:

- conversion = 0.008/tick (×0.4 in gut when moisture < 0.45)
- prebiotic vitality − conversion
- postbioticLevel + conversion × 0.5

---

## Competition

Probiotics with vitality > 0.4 suppress nearby targets using **strain-specific** radius and per-tick strength (`StrainDef.competition` in `strains.ts`; defaults: radius 0.35, strength 0.006):

```text
for each probiotic p:
  { radius, strength } = getStrainCompetition(p.strain)
  for each node target where type in (pathogen, allergen, yeast):
    if distance(p, target) < radius:
      target.vitality -= strength
```

Examples: L. acidophilus (0.40 / 0.008), S. boulardii (0.30 / 0.010 — tight, aggressive yeast competitor).

No suppression of commensals or other probiotics.

---

## Emergent biome effects

Source modules: [`inflammationDynamics.ts`](../../src/sim/inflammationDynamics.ts), [`gutBrainDynamics.ts`](../../src/sim/gutBrainDynamics.ts)

### Inflammation and immune signaling

**`inflammation`** is an **emergent tissue load**, not a direct +/- on most actions. Each tick (and after each trigger/inoculation via `syncEmergentInflammation()`), it moves toward a target computed from:

| Input | Weight in target |
| --- | --- |
| Pathogen + yeast count | High |
| Allergen count | High |
| Low barrier integrity | Medium |
| Biofilm level | Medium |
| `immuneActivity` (acute immune signaling) | Medium |

**`immuneActivity`** rises when immune-mediator stressors fire (`histamine`, allergens, smoke, NSAIDs, cortisol, etc.) and decays over time — faster when postbiotics are high and pathogen load is low. Postbiotics and a few probiotic strains apply small **`immuneActivity`** reductions on apply.

**Action apply effects** use `BiomeEffect` fields: `ph`, `integrity`, `biofilm`, `postbioticLevel`, `immuneActivity`, `commensalVitality`, `yeastVitality` — not direct `inflammation`.

### Inflammation → integrity

If inflammation > 0.3: integrity −0.0008/tick (floor 0.15)

### Postbiotic → recovery

If postbioticLevel > 0.2:

- integrity +0.001/tick

(Postbiotic-driven inflammation easing is handled by the emergent inflammation target, not a separate per-tick subtraction.)

### Gut-brain: tryptophan support (gut only)

**`tryptophanSupport`** (0–1) is an educational proxy for tryptophan / serotonin-precursor availability along the gut-brain axis. Updated each tick on **gut** tissue only. Rises when:

- Gut inflammation is low
- `postbioticLevel` (SCFA) is strong
- Barrier integrity is healthy
- `immuneActivity` is calm

Falls under psychosocial stress, sleep deprivation, and other immune/barrier insults. Visible in the dashboard on **Lifecycle preset + Gut region** as **Tryptophan support**.

~90% of body serotonin is produced in the gut in real physiology; the sim links calm mucosa + SCFA to this scalar — not mood prediction.

### Biofilm growth

| Condition | Rate |
| --- | --- |
| pH > 7 and moisture > 0.5 | +0.0008/tick |
| scalp and sebum > 0.5 | +0.0012/tick |
| ear and cerumen > 0.45 | +0.0006/tick |
| oral and moisture < 0.4 | +0.001/tick |
| vaginal and pH > 5.2 | +0.0012/tick |

**Biofilm decay:** if pH < 6: biofilm −0.002/tick

### Integrity decay (low moisture / high vaginal pH)

| Region | Condition | Rate |
| --- | --- | --- |
| skin, scalp | moisture < 0.35 | −0.0015/tick |
| nose, ear | moisture < 0.4 | −0.0006/tick |
| oral | moisture < 0.35 | −0.0009/tick |
| vaginal | pH > 5.0 | −0.001/tick |

All integrity decay floors at 0.15.

### Sugar load

Per-tick decay by region (`sugarLoadDecay.ts`):

| Region | Decay/tick | Rationale |
| --- | --- | --- |
| oral | 0.0015 | Saliva washout |
| skin, scalp | 0.0018 | Epidermal turnover / sweat |
| nose, ear | 0.0012 | Mucociliary clearance |
| vaginal | 0.0010 | Mucosal turnover |
| gut | 0.0006 | Lumen buffering / fermentation |

Also increased by diet triggers and day-meal simulation on gut/oral.

### Scalp moisture drift

`moisture += sweatRate × 0.0004 − 0.0001` per tick (clamped 0–1)

### Ear oxygenation drift

If cerumen > 0.55: oxygenation −0.0005/tick (floor 0.1)

---

## Node pruning

After all updates: `nodes = nodes.filter(n => n.vitality > 0.05)`

Pruned nodes disappear from visualization immediately.

---

## Population counting

```text
probioticCount  = count(type === 'probiotic')
pathogenCount   = count(type === 'pathogen' || type === 'yeast')
allergenCount   = count(type === 'allergen')
commensalCount  = count(type === 'commensal')
```

Prebiotic nodes are not included in dashboard population stats.

---

## Related docs

- [Model overview](model-overview.md)
- [Actions reference](../domain/actions-reference.md)
- [Environment](../domain/environment.md)
