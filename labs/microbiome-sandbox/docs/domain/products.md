# Products & Foods

Whole supplements, topical treatments, and fermented foods deliver **multiple strains and prebiotics** in one action. Individual strains are documented in [Biotics](biotics.md).

Sources: [`src/data/products.ts`](../../src/data/products.ts), [`src/sim/engine.ts`](../../src/sim/engine.ts) — `applyProduct()`

---

## How products work

1. User clicks a product button (available in **all regions**); the **Action Preview** panel opens alongside the catalog
2. Engine spawns each strain at `spawnCount × dose × regionMultiplier`
3. Per-strain biome effects from the strain catalog applied (scaled by `dose × regionMultiplier`)
4. Prebiotics in the product spawn similarly
5. Product-level biome bonus applied once (scaled by region multiplier)
6. Event log records a structured summary (strains added + top biome deltas); reduced efficacy noted outside preferred regions

**Region multipliers:**

| Product | Form | Preferred regions | Preferred × | Other regions × |
| --- | --- | --- | --- | --- |
| Multi-strain synbiotic capsule | capsule | gut, oral | 1.0 | 0.65 |
| Oral probiotic lozenge | lozenge | oral, nose, ear | 1.0 | 0.35 |
| Vaginal probiotic capsule | capsule | vaginal | 1.0 | 0.40 |
| Probiotic topical cream | topical | skin, scalp | 1.0 | 0.45 |
| Kefir drink | drink | gut, oral | 1.0 | 0.50 |
| Probiotic yogurt | food | gut, oral | 1.0 | 0.55 |
| Kimchi | food | gut | 1.0 | 0.45 |
| Sauerkraut | food | gut | 1.0 | 0.50 |
| Kombucha drink | drink | gut, oral | 1.0 | 0.48 |
| Miso | food | gut | 1.0 | 0.52 |

Per-region **Suggested** shortcuts live in [`regionSuggestions.ts`](../../src/data/regionSuggestions.ts).

---

## Multi-strain synbiotic capsule (`synbiotic_supplement`)

**Form: capsule** (swallowed enteric-style capsule with prebiotic — **not** a lozenge).

| Component | Strains / prebiotics |
| --- | --- |
| Probiotics | L. acidophilus, L. casei, L. rhamnosus, L. salivarius, L. reuteri, B. lactis, B. longum, B. bifidum |
| Prebiotic | FOS |
| Biome bonus | integrity +0.06 (scaled) |

---

## Oral probiotic lozenge (`oral_probiotic_lozenge`)

**Form: lozenge** (dissolves slowly in the mouth — **not** a swallowed capsule).

| Component | Strains |
| --- | --- |
| Probiotics | S. salivarius K12, S. salivarius M18 (>10⁹ CFU educational label) |
| Biome bonus | biofilm −0.15, moisture +0.12 (saliva film), integrity +0.08 |

**Target tissues:** oral mucosa, gums, throat, nose, ear — full efficacy in `oral`, `nose`, `ear`; strongly reduced elsewhere (lozenge does not colonize gut/skin the same way).

**Try it:** oral region after `thrush_bloom` or `dry_mouth`, or nose/ear after allergen stress.

---

## Vaginal probiotic capsule (`vaginal_probiotic_capsule`)

**Form: capsule** (insertable — targets vaginal Lactobacillus dominance).

| Component | Strains |
| --- | --- |
| Probiotics | L. acidophilus, L. rhamnosus, L. reuteri |
| Biome bonus | pH −0.35, integrity +0.08 |

**Target tissues:** vaginal mucosa — full efficacy in `vaginal`; reduced elsewhere.

**Try it:** vaginal region after `alkaline_flush` or `glycogen_spike`.

---

## Probiotic topical cream (`probiotic_topical_cream`)

**Form: topical** (skin/scalp cream — not swallowed).

| Component | Strains |
| --- | --- |
| Probiotics | L. acidophilus, L. rhamnosus |
| Biome bonus | pH −0.20, biofilm −0.12, moisture +0.08 |

**Target tissues:** epidermis and scalp — full efficacy in `skin`, `scalp`; reduced elsewhere.

**Try it:** skin after `alkaline` or `eczema_flare`, scalp after `sebum_surge`.

---

## Kefir drink (`kefir_drink`)

Fermented milk with diverse lactic acid bacteria.

| Component | Strains |
| --- | --- |
| Probiotics | L. casei, L. acidophilus, L. reuteri, B. lactis, B. longum, L. bulgaricus |
| Biome bonus | postbioticLevel +0.08, pH −0.12, moisture +0.05 |

---

## Probiotic yogurt (`probiotic_yogurt`)

Cultured dairy typical of commercial probiotic yogurt.

| Component | Strains |
| --- | --- |
| Probiotics | L. acidophilus, L. bulgaricus, S. thermophilus, B. lactis, L. casei |
| Biome bonus | pH −0.18, biofilm −0.08, integrity +0.05 |

---

## Kimchi (`kimchi`)

Fermented vegetables — high L. plantarum with fiber.

| Component | Strains / prebiotics |
| --- | --- |
| Probiotics | L. plantarum, L. casei, L. salivarius, L. reuteri |
| Prebiotic | inulin (vegetable fiber) |
| Biome bonus | pH −0.22, postbioticLevel +0.06 |

---

## Sauerkraut (`sauerkraut`)

Fermented cabbage — European counterpart to kimchi, L. plantarum-rich.

| Component | Strains / prebiotics |
| --- | --- |
| Probiotics | L. plantarum, L. casei, L. reuteri |
| Prebiotic | inulin (cabbage fiber) |
| Biome bonus | pH −0.18, postbioticLevel +0.05 |

---

## Kombucha drink (`kombucha`)

Fermented tea with lactic acid bacteria and S. boulardii.

| Component | Strains |
| --- | --- |
| Probiotics | L. casei, L. acidophilus, S. boulardii |
| Biome bonus | pH −0.10, yeastVitality −0.15, postbioticLevel +0.04 |

**Try it:** gut or oral in the **candida** preset after yeast bloom stressors.

---

## Miso (`miso`)

Fermented soybean paste — diverse lactobacilli and bifidobacteria.

| Component | Strains |
| --- | --- |
| Probiotics | L. casei, L. plantarum, B. bifidum, B. lactis |
| Biome bonus | pH −0.12, postbioticLevel +0.05, integrity +0.04 |

---

## Individual strains vs products

| Approach | UI section | Use when |
| --- | --- | --- |
| Single strain | Individual Strains | Isolating one species effect |
| Prebiotic only | Prebiotics (+ INULIN / FOS) | Feeding existing probiotics |
| Whole product | Products & Fermented Foods | Real-world supplement or food |

Region-specific quick actions (legacy buttons) remain under **Stressors & Region Actions**.

---

## Related docs

- [Biotics](biotics.md)
- [Actions reference](actions-reference.md)
- [Extending the lab](../development/extending.md)
