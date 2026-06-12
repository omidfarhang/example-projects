# Actions Reference

Exhaustive catalog of every trigger (stressor) and inoculation (intervention) in Bio-Dynamics.

Source: [`src/sim/engine.ts`](../src/sim/engine.ts) (`trigger()`, `inoculate()`), region availability from [`src/data/regions.ts`](../src/data/regions.ts).

Actions are **region-gated**: calling a disallowed action logs `"Trigger/Inoculation \"{id}\" not available for {region} tissue"` and has no effect.

---

## Triggers

### `allergen` — TRIGGER ALLERGEN SPIKE

**Regions:** ear, nose

| Effect | Value |
| --- | --- |
| Spawn | 35 pollen allergens (from above) |
| inflammation | +0.45 (clamp 0–1) |
| integrity | −0.25 (floor 0.2) |
| commensal vitality | −0.25 |

**Event log:**

- "Allergen spike detected — epithelial stress rising"
- "Commensals retreating from tight junctions"

---

### `dry_air` — DRY AIR EXPOSURE

**Regions:** ear, nose

| Effect | Value |
| --- | --- |
| moisture | −0.25 (floor 0.1) |
| integrity | −0.12 (floor 0.2) |
| allergenAdhesion | +0.3 (clamp 0–1) |

**Event log:** "Dry air exposure — mucus layer thinning"

---

### `histamine` — HISTAMINE SURGE

**Regions:** nose

| Effect | Value |
| --- | --- |
| inflammation | +0.35 |
| commensal vitality | −0.15 |

**Event log:** "Histamine surge — nasal inflammation rising"

---

### `cerumen_impaction` — CERUMEN IMPACTION

**Regions:** ear

| Effect | Value |
| --- | --- |
| cerumen | +0.35 |
| oxygenation | −0.3 (floor 0.15) |
| integrity | −0.15 (floor 0.2) |

**Event log:** "Cerumen impaction — canal narrowed, oxygenation falling"

---

### `swim_exposure` — SWIM / WATER EXPOSURE

**Regions:** ear

| Effect | Value |
| --- | --- |
| moisture | +0.22 |
| salinity | +0.18 |
| Spawn | 6 P. aeruginosa |

**Event log:** "Swim exposure — moisture and salinity spike"

---

### `sebum_surge` — SEBUM SURGE

**Regions:** scalp

| Effect | Value |
| --- | --- |
| sebum | +0.35 |
| biofilm | +0.2 |
| Spawn | 14 Malassezia (yeast) |

**Event log:** "Sebum surge — lipid film thickens, Malassezia bloom"

---

### `harsh_shampoo` — HARSH SHAMPOO (ALKALINE)

**Regions:** scalp

| Effect | Value |
| --- | --- |
| ph | +0.8 (cap 8) |
| sebum | −0.25 (floor 0.05) |
| commensal vitality | −0.2 |

**Event log:** "Harsh shampoo — alkaline wash strips sebum film"

---

### `friction_irritant` — FRICTION / IRRITANT

**Regions:** scalp, skin

| Effect | Value |
| --- | --- |
| integrity | −0.2 (floor 0.2) |
| inflammation | +0.25 |
| Spawn | 18 irritant allergens (from above) |

**Event log:** "Friction/irritant — barrier micro-tears forming"

---

### `thrush_bloom` — ORAL THRUSH BLOOM

**Regions:** oral

| Effect | Value |
| --- | --- |
| Spawn | 22 C. albicans (yeast) |
| biofilm | +0.3 |
| inflammation | +0.2 |

**Event log:** "Oral thrush bloom — C. albicans patches spreading"

---

### `dry_mouth` — DRY MOUTH (XEROSTOMIA)

**Regions:** oral

| Effect | Value |
| --- | --- |
| moisture | −0.35 (floor 0.12) |
| salinity | +0.1 |
| Spawn | 10 C. albicans (yeast) |

**Event log:** "Dry mouth — saliva film depleted, yeast adhesion rising"

---

### `sugar_exposure` — SUGAR / CARB EXPOSURE

**Regions:** oral

| Effect | Value |
| --- | --- |
| sugarLoad | +0.7 |
| ph | +0.3 (cap 7.5) |
| Spawn | 8 S. mutans |

**Event log:** "Sugar exposure — acid-tolerant pathogens mobilizing"

---

### `alkaline` — RAISE pH + SUGAR LOAD

**Regions:** skin

| Effect | Value |
| --- | --- |
| ph | +0.6 (cap 8) |
| sugarLoad | +0.6 |
| Spawn | 28 C. albicans, 8 S. aureus |
| biofilm | +0.35 |

**Event log:** "Alkaline shift + sugar load — C. albicans expansion"

---

### `topical_antibiotic` — TOPICAL ANTIBIOTIC

**Regions:** skin

| Effect | Value |
| --- | --- |
| commensal vitality | −0.4 |
| probiotic vitality | −0.2 |
| pathogen/yeast vitality | −0.1 |

**Event log:** "Topical antibiotic — commensal diversity reduced"

---

### `alkaline_flush` — ALKALINE FLUSH (pH DISRUPTION)

**Regions:** vaginal

| Effect | Value |
| --- | --- |
| ph | +1.2 (cap 7.5) |
| integrity | −0.18 (floor 0.2) |
| Spawn | 16 C. albicans, 6 Gardnerella |

**Event log:** "Alkaline flush — vaginal pH disrupted, Candida bloom risk"

---

### `antibiotic_course` — ANTIBIOTIC COURSE

**Regions:** vaginal

| Effect | Value |
| --- | --- |
| commensal vitality | −0.45 |
| probiotic vitality | −0.3 |
| ph | +0.4 (cap 6.5) |
| integrity | −0.12 (floor 0.2) |

**Event log:** "Antibiotic course — Lactobacillus depleted, pH rising"

---

### `glycogen_spike` — GLYCOGEN / SUGAR SPIKE

**Regions:** vaginal

| Effect | Value |
| --- | --- |
| sugarLoad | +0.55 |
| moisture | +0.12 |
| Spawn | 12 C. albicans (yeast) |

**Event log:** "Glycogen spike — yeast substrate surge in mucosa"

---

### `stress` — SIMULATE MILD STRESS

**Regions:** gut

| Effect | Value |
| --- | --- |
| integrity | −0.15 (floor 0.3) |
| inflammation | +0.2 |

**Event log:** "Mild stress applied to epithelium"

---

### `enteropathogen_bloom` — ENTEROPATHOGEN BLOOM

**Regions:** gut

| Effect | Value |
| --- | --- |
| Spawn | 12 Enteropathogen |
| inflammation | +0.3 |

**Event log:** "Enteropathogen bloom — gut inflammation rising"

---

### `antibiotic_disruption` — ANTIBIOTIC DISRUPTION

**Regions:** gut

| Effect | Value |
| --- | --- |
| commensal vitality | −0.35 |
| integrity | −0.1 (floor 0.2) |
| postbioticLevel | −0.2 (floor 0) |

**Event log:** "Antibiotic disruption — commensals depleted, SCFA falling"

---

## Inoculations

### `prebiotic` — ADD PREBIOTIC FIBER

**Regions:** gut

| Effect | Value |
| --- | --- |
| Spawn | 20 inulin (prebiotic) |

**Event log:** "Prebiotic fiber added — substrate for probiotics"

---

### `scfa` — RELEASE SCFA BOOST

**Regions:** gut

| Effect | Value |
| --- | --- |
| postbioticLevel | +0.3 |
| integrity | +0.12 |
| inflammation | −0.15 |

**Event log:** "SCFA postbiotic surge — barrier recovery"

---

### `lacid` — INOCULATE / APPLY L. ACIDOPHILUS

**Regions:** oral, skin, vaginal

| Effect | Value |
| --- | --- |
| Spawn | 18 L. acidophilus |
| ph | −0.5 (clamp 3.8–7) |
| biofilm | −0.2 (floor 0) |

**Event log:** "L. acidophilus acidifying local pH"

---

### `lrham` — SPRAY / APPLY / SEED L. RHAMNOSUS

**Regions:** ear, scalp, nose, vaginal

| Effect | Value |
| --- | --- |
| Spawn | 16 L. rhamnosus |
| inflammation | −0.18 (floor 0) |
| integrity | +0.1 |

**Event log:** "L. rhamnosus inoculated — competing for attachment"

---

### `binf` — APPLY B. INFANTIS

**Regions:** nose

| Effect | Value |
| --- | --- |
| Spawn | 14 B. infantis |
| commensal vitality | +0.2 |
| integrity | +0.08 |

**Event log:** "B. infantis applied — commensal support boosted"

---

### `lplant` — SEED L. PLANTARUM

**Regions:** gut

| Effect | Value |
| --- | --- |
| Spawn | 16 L. plantarum |
| inflammation | −0.18 |
| integrity | +0.1 |

**Event log:** "L. plantarum seeded — competing for attachment"

---

### `lsaliv` — APPLY L. SALIVARIUS

**Regions:** oral

| Effect | Value |
| --- | --- |
| Spawn | 18 L. salivarius |
| ph | −0.2 (floor 5.5) |
| biofilm | −0.15 |

**Event log:** "L. salivarius applied — oral commensal niche restored"

---

### `sboul` — SEED S. BOULARDII

**Regions:** oral

| Effect | Value |
| --- | --- |
| Spawn | 14 S. boulardii |
| yeast vitality | −0.25 |
| inflammation | −0.12 |

**Event log:** "S. boulardii seeded — antifungal competition active"

---

### `saline_mist` — SALINE MIST

**Regions:** ear, nose

| Effect | Value |
| --- | --- |
| moisture | +0.15 |
| inflammation | −0.1 |
| allergenAdhesion | −0.2 (floor 0) |

**Event log:** "Saline mist — moisture restored, inflammation easing"

---

### `s_epidermidis` — APPLY S. EPIDERMIDIS

**Regions:** scalp, skin

| Effect | Value |
| --- | --- |
| Spawn | 20 S. epidermidis (commensal) |
| biofilm | −0.15 |

**Event log:** "S. epidermidis applied — commensal biofilm competition"

---

### `ph_serum` — pH BALANCING / RESTORING SERUM

**Regions:** scalp, skin, vaginal

| Effect | Value |
| --- | --- |
| ph | −0.35 (clamp 3.8–7) |
| moisture | +0.05 |

**Event log:** "pH balancing serum — local acidity restored"

---

## Region action matrix

### Triggers by region

| Region | Triggers |
| --- | --- |
| ear | allergen, dry_air, cerumen_impaction, swim_exposure |
| scalp | sebum_surge, harsh_shampoo, friction_irritant |
| nose | allergen, dry_air, histamine |
| oral | thrush_bloom, dry_mouth, sugar_exposure |
| skin | alkaline, topical_antibiotic, friction_irritant |
| vaginal | alkaline_flush, antibiotic_course, glycogen_spike |
| gut | stress, enteropathogen_bloom, antibiotic_disruption |

### Inoculations by region

| Region | Inoculations |
| --- | --- |
| ear | lrham, saline_mist |
| scalp | lrham, s_epidermidis, ph_serum |
| nose | lrham, binf, saline_mist |
| oral | lsaliv, lacid, sboul |
| skin | lacid, s_epidermidis, ph_serum |
| vaginal | lacid, lrham, ph_serum |
| gut | prebiotic, lplant, scfa |

---

## Individual strain panel (all regions)

Available via dashboard **Individual Strains** row. Source: [`src/data/strains.ts`](../../src/data/strains.ts), `inoculateStrain()`.

| Action ID | Strain | Spawn | Primary effects |
| --- | --- | --- | --- |
| `lrham` | L. rhamnosus | 16 | inflammation −0.18, integrity +0.1 |
| `lacid` | L. acidophilus | 18 | pH −0.5, biofilm −0.2 |
| `lcasei` | L. casei | 14 | inflammation −0.12, integrity +0.08 |
| `lsaliv` | L. salivarius | 18 | pH −0.2, biofilm −0.15 |
| `lreuteri` | L. reuteri | 12 | inflammation −0.14, integrity +0.09, pH −0.15 |
| `blactis` | B. lactis | 14 | commensal +0.15, postbiotic +0.04 |
| `blongum` | B. longum | 12 | commensal +0.12, postbiotic +0.05 |
| `bbifidum` | B. bifidum | 12 | commensal +0.14, postbiotic +0.04 |
| `binf` | B. infantis | 14 | commensal +0.2, integrity +0.08 |
| `lplant` | L. plantarum | 16 | inflammation −0.18, integrity +0.1 |
| `lbulgaricus` | L. bulgaricus | 10 | pH −0.25, biofilm −0.1 |
| `sthermo` | S. thermophilus | 10 | pH −0.15 |
| `sboul` | S. boulardii | 14 | yeast −0.25, inflammation −0.12 |
| `ssaliv_k12` | S. salivarius K12 | 16 | biofilm −0.18, inflammation −0.1, moisture +0.08 |
| `ssaliv_m18` | S. salivarius M18 | 16 | biofilm −0.22, integrity +0.06 |

Hover any strain button to preview effects in the **Action Preview** panel.

---

## Prebiotic panel (all regions)

| Action ID | Substrate | Spawn | Effect |
| --- | --- | --- | --- |
| `inulin` | Inulin | 20 | Prebiotic nodes; convert to SCFA near probiotics (r=0.4) |
| `fos` | FOS | 18 | Prebiotic nodes; convert to SCFA near probiotics (r=0.4) |

Gut region also exposes `prebiotic` (inulin) and `prebiotic_fos` (FOS) as quick inoculations.

---

## Products & fermented foods (all regions)

Source: [`src/data/products.ts`](../../src/data/products.ts), `applyProduct()`. See [Products](products.md) for full strain bundles.

| Action ID | Label | Preferred regions |
| --- | --- | --- |
| `synbiotic_supplement` | Multi-strain synbiotic capsule | gut, oral |
| `oral_probiotic_lozenge` | Oral probiotic lozenge | oral, nose, ear |
| `kefir_drink` | Kefir drink | gut, oral |
| `probiotic_yogurt` | Probiotic yogurt | gut, oral |
| `kimchi` | Kimchi (fermented) | gut |

Products spawn strains, apply per-strain biome effects (scaled), apply product bonus, and log a structured event summary.

---

## Visual burst mapping

[`SceneManager.playBurst()`](../src/scene/SceneManager.ts) maps action IDs to burst categories for micro-view feedback: `allergen`, `alkaline`, `stress`, `probiotic`, `default`. Product IDs have distinct burst colors (lozenge = blue, fermented = amber/gold).

---

## Related docs

- [Biotics](biotics.md)
- [Body regions](regions.md)
- [Simulation dynamics](../simulation/dynamics.md)
