# Assumptions and Limits

What Bio-Dynamics simplifies, omits, and must not be interpreted as. Read this before using the documentation to guide scientific or product improvements.

---

## Educational scope

Bio-Dynamics teaches **qualitative intuition**:

- Environmental shifts change microbial growth conditions
- Probiotics can compete with pathogens and support barrier recovery
- Prebiotics feed probiotics; postbiotics (SCFA) support epithelial integrity

It does **not** predict real-world outcomes for any individual, strain, dose, or tissue.

---

## Spatial model limits

| Assumption | Reality gap |
| --- | --- |
| Microbes occupy random x/y/z positions in a unit box | Real microbiota have structured niches ( crypts, follicles, mucus layers) |
| Suppression uses strain-specific 2D radius and strength | Real competition involves bacteriocins, immune cells, receptor binding |
| Allergens "fall from above" | Simplified particle model for visual clarity |
| Positions map to 3D visuals via coordinate transform | Visual placement is illustrative, not measured |

---

## Strain and population limits

| Assumption | Reality gap |
| --- | --- |
| Strain names are educational labels | Not tied to specific commercial products or CFU doses |
| Population displayed as count × 1000 | Arbitrary display scaling (`POPULATION_SCALE = 1000`) |
| Max 400 agent nodes | Real tissues harbor vastly more cells; many species collapsed |
| Generic "commensal" bucket | Real commensals are diverse species with different roles |
| Pathogen + yeast share one dashboard stat | Simplified UI aggregation |

---

## Postbiotic modeling limits

| Assumption | Reality gap |
| --- | --- |
| Postbiotics are a single scalar `postbioticLevel` | Real postbiotics include butyrate, propionate, acetate, enzymes, etc. |
| No postbiotic microbe nodes | SCFA shown as lumen particle field + epithelial glow, not individual agents |
| Conversion is proximity-based instant feedback | Real fermentation has lag, metabolite diffusion, transporter dynamics |
| Direct `scfa` button adds +0.3 instantly | No oral/gut pharmacokinetic model |

---

## Environmental limits

| Assumption | Reality gap |
| --- | --- |
| pH range 4–8 on a single slider | Tissue pH varies by micro-niche; slider is regional average |
| Temperature 0–1 maps to 34–38°C | Body temperature regulation not modeled |
| Nine env variables capture tissue state | Omits detailed immune signaling, IgA, bile acids, peristalsis, hormones (advanced mode adds simplified `immuneActivity` proxy only) |
| Slider changes apply instantly | No gradual equilibration or homeostatic response |

---

## Action and pharmacology limits

| Assumption | Reality gap |
| --- | --- |
| Triggers/inoculations have immediate effect | Real interventions have onset, duration, and clearance |
| Antibiotics use route-specific spectra (otic, topical, gut, vaginal) | No resistance, dose-response, or pharmacokinetics |
| Same probiotic action spawns fixed node count everywhere | No colonization probability or mucosal adhesion model |
| Region gating is binary | Real interventions may be systemic, not tissue-local |

---

## Simulation engine limits

| Assumption | Reality gap |
| --- | --- |
| Deterministic LCG seed 42 | Same seed ≠ clinical reproducibility |
| Fixed 30 Hz tick, max 4 substeps | Time acceleration varies with frame rate |
| No persistence between sessions | Refresh resets all state |
| No save/load or URL-encoded state | Cannot share mid-simulation snapshots |
| No test suite | Behavior verified manually only |

---

## Visualization limits

| Assumption | Reality gap |
| --- | --- |
| Low-poly body and cross-sections | Anatomical proportions approximate |
| Instanced capsules/spheres represent microbes | Shape/color encode type, not morphology |
| Inflammation shown as emissive redness | Not histology or thermography |
| Magnification labels (80×–400×) | Labels for narrative, not true optical scale |

---

## UI and accessibility limits

| Assumption | Reality gap |
| --- | --- |
| Mouse-driven 3D orbit and hotspot clicks | Limited keyboard/screen-reader support |
| Canvas WebGL required | No software fallback |
| English-only labels and event log | No i18n |

---

## Explicit non-goals

Bio-Dynamics will **not** (in current scope):

1. Provide medical advice or diagnosis
2. Model individual patient microbiome profiles
3. Replace peer-reviewed clinical evidence
4. Simulate drug-drug interactions or systemic metabolism
5. Represent CFU dosing or regulatory probiotic claims
6. Connect to live biological or wearable data

---

## Using limits to improve the app

When extending the simulation, decide whether each change:

- **Improves educational clarity** (good target)
- **Implies false clinical precision** (avoid without disclaimers)

See [Roadmap](../roadmap.md) for prioritized gaps that balance these goals.

---

## Related docs

- [Overview](../overview.md)
- [Simulation model overview](model-overview.md)
- [Roadmap](../roadmap.md)
