# Actions Reference

Exhaustive catalog of every trigger (stressor) and inoculation (intervention) in Bio-Dynamics.

**Stressor source of truth:** [`src/data/stressors.ts`](../src/data/stressors.ts) — 82 stressors across 7 body regions (region-gated). Engine applies them via data-driven `applyStressorBiome()`.

**Inoculation source:** [`src/sim/engine.ts`](../src/sim/engine.ts) (`inoculate()`), region availability from [`src/data/regions.ts`](../src/data/regions.ts).

Actions are **region-gated**: calling a disallowed action logs `"Trigger/Inoculation \"{id}\" not available for {region} tissue"` and has no effect.

---

## Triggers (stressors)

Each stressor defines biome deltas, optional microbe spawns, event-log messages, and a visual burst category (`allergen`, `alkaline`, `stress`, or `default`). See `StressorDef` in [`stressors.ts`](../src/data/stressors.ts) for the full schema.

### Ear canal (12)

| ID | Label |
| --- | --- |
| `allergen` | TRIGGER ALLERGEN SPIKE |
| `dry_air` | DRY AIR EXPOSURE |
| `cerumen_impaction` | CERUMEN IMPACTION |
| `swim_exposure` | SWIM / WATER EXPOSURE |
| `bacterial_ear_infection` | BACTERIAL OTITIS EXTERNA |
| `fungal_otitis` | FUNGAL OTITIS EXTERNA |
| `hearing_aid_occlusion` | HEARING AID OCCLUSION |
| `qtip_trauma` | Q-TIP / MICROTRAUMA |
| `chlorinated_pool_ear` | CHLORINATED POOL WATER |
| `smoke_pollution` | SMOKE / AIR POLLUTION |
| `contact_allergen` | CONTACT ALLERGEN (METAL) |
| `antibiotic_ear_drops` | ANTIBIOTIC EAR DROPS |

### Scalp (11)

| ID | Label |
| --- | --- |
| `sebum_surge` | SEBUM SURGE |
| `harsh_shampoo` | HARSH SHAMPOO (ALKALINE) |
| `friction_irritant` | FRICTION / IRRITANT |
| `heat_sweat_surge` | HEAT / SWEAT SURGE |
| `stress_cortisol` | PSYCHOSOCIAL STRESS (CORTISOL) |
| `chemical_hair_dye` | CHEMICAL HAIR DYE |
| `uv_sun_exposure` | UV / SUN EXPOSURE |
| `hard_water_wash` | HARD WATER / MINERAL BUILDUP |
| `hat_occlusion` | HAT / HELMET OCCLUSION |
| `dandruff_flare` | DANDRUFF / SEBORRHEIC FLARE |
| `chlorinated_pool_scalp` | CHLORINATED POOL (SCALP) |

### Nose / sinus (12)

| ID | Label |
| --- | --- |
| `allergen` | TRIGGER ALLERGEN SPIKE |
| `dry_air` | DRY AIR EXPOSURE |
| `smoke_pollution` | SMOKE / AIR POLLUTION |
| `histamine` | HISTAMINE SURGE |
| `viral_uri` | VIRAL UPPER RESPIRATORY INFECTION |
| `bacterial_sinusitis` | BACTERIAL SINUSITIS |
| `cigarette_smoke` | CIGARETTE SMOKE |
| `cold_air_burst` | COLD DRY AIR BURST |
| `pollution_pm25` | FINE PARTICULATE POLLUTION (PM2.5) |
| `mold_spore_exposure` | MOLD SPORE EXPOSURE |
| `occupational_dust` | OCCUPATIONAL DUST EXPOSURE |
| `decongestant_overuse` | DECONGESTANT OVERUSE (RHINITIS MEDICAMENTOSA) |

### Oral (13)

| ID | Label |
| --- | --- |
| `stress_cortisol` | PSYCHOSOCIAL STRESS (CORTISOL) |
| `cigarette_smoke` | CIGARETTE SMOKE |
| `thrush_bloom` | ORAL THRUSH BLOOM |
| `dry_mouth` | DRY MOUTH (XEROSTOMIA) |
| `sugar_exposure` | SUGAR / CARB EXPOSURE |
| `acid_reflux_lpr` | ACID REFLUX / LPR |
| `alcohol_exposure` | ALCOHOL EXPOSURE |
| `chlorhexidine_rinse` | CHLORHEXIDINE / ANTISEPTIC RINSE |
| `poor_oral_hygiene` | POOR ORAL HYGIENE / PLAQUE |
| `acidic_beverage` | ACIDIC BEVERAGE (SODA / CITRUS) |
| `mouth_breathing` | MOUTH BREATHING (NASAL OBSTRUCTION) |
| `immunosuppression` | IMMUNOSUPPRESSION |
| `radiation_xerostomia` | RADIATION-INDUCED XEROSTOMIA |

### Skin (15)

| ID | Label |
| --- | --- |
| `contact_allergen` | CONTACT ALLERGEN (METAL) |
| `friction_irritant` | FRICTION / IRRITANT |
| `heat_sweat_surge` | HEAT / SWEAT SURGE |
| `uv_sun_exposure` | UV / SUN EXPOSURE |
| `hard_water_wash` | HARD WATER / MINERAL BUILDUP |
| `alkaline` | RAISE pH + SUGAR LOAD |
| `topical_antibiotic` | TOPICAL ANTIBIOTIC |
| `occlusive_sweat` | OCCLUSIVE SWEAT / TIGHT CLOTHING |
| `detergent_residue` | HARSH DETERGENT / SOAP RESIDUE |
| `eczema_flare` | ECZEMA / ATOPIC FLARE |
| `hot_shower_soap` | HOT SHOWER + ALKALINE SOAP |
| `staph_colonization` | S. AUREUS COLONIZATION |
| `fungal_intertrigo` | FUNGAL INTERTRIGO |
| `dehydration` | DEHYDRATION / LOW TEWL RECOVERY |
| `hormonal_fluctuation` | HORMONAL FLUCTUATION |

### Vaginal (13)

| ID | Label |
| --- | --- |
| `immunosuppression` | IMMUNOSUPPRESSION |
| `hormonal_fluctuation` | HORMONAL FLUCTUATION |
| `alkaline_flush` | ALKALINE FLUSH (pH DISRUPTION) |
| `antibiotic_course` | ANTIBIOTIC COURSE |
| `glycogen_spike` | GLYCOGEN / SUGAR SPIKE |
| `douching` | DOUCHING / VAGINAL WASH |
| `menstrual_flow` | MENSTRUAL FLOW |
| `hormonal_contraceptive` | HORMONAL CONTRACEPTIVE SHIFT |
| `perfumed_products` | SCENTED / PERFUMED PRODUCTS |
| `synthetic_clothing` | SYNTHETIC / NON-BREATHABLE CLOTHING |
| `semen_exposure` | SEMEN EXPOSURE (pH ALKALINIZATION) |
| `heat_humidity` | HEAT / HUMIDITY EXPOSURE |
| `spermicide_irritant` | SPERMICIDE / CHEMICAL IRRITANT |

### Gut (21)

| ID | Label |
| --- | --- |
| `stress_cortisol` | PSYCHOSOCIAL STRESS (CORTISOL) |
| `alcohol_exposure` | ALCOHOL EXPOSURE |
| `immunosuppression` | IMMUNOSUPPRESSION |
| `stress` | SIMULATE MILD STRESS |
| `enteropathogen_bloom` | ENTEROPATHOGEN BLOOM |
| `antibiotic_disruption` | ANTIBIOTIC DISRUPTION |
| `low_fiber_diet` | LOW-FIBER / WESTERN DIET |
| `high_fat_meal` | HIGH-FAT / FATTY MEAL |
| `food_poisoning` | FOOD POISONING |
| `alcohol_binge` | ALCOHOL BINGE |
| `nsaid_exposure` | NSAID / ASPIRIN EXPOSURE |
| `gluten_challenge` | GLUTEN / FOOD SENSITIVITY CHALLENGE |
| `emulsifier_load` | EMULSIFIER / ULTRA-PROCESSED FOOD |
| `sleep_deprivation` | SLEEP DEPRIVATION |
| `viral_gastroenteritis` | VIRAL GASTROENTERITIS |
| `ppi_antacid` | PPI / ANTACID USE |
| `processed_food_load` | PROCESSED FOOD / ADDED SUGAR LOAD |
| `intense_exercise` | INTENSE EXERCISE (GUT ISCHEMIA) |
| `travelers_diarrhea` | TRAVELER'S DIARRHEA |
| `c_diff_after_antibiotics` | C. DIFF AFTER ANTIBIOTICS |
| `food_allergen` | FOOD ALLERGEN EXPOSURE |

### Stressor categories covered

| Category | Examples |
| --- | --- |
| **Environmental** | dry air, cold air, heat/humidity, UV, pollution, smoke, chlorinated water |
| **Hygiene / chemical** | harsh shampoo, detergent, douching, chlorhexidine, spermicide, hair dye |
| **Barrier / mechanical** | friction, Q-tip trauma, occlusion (hat, hearing aid, synthetic clothing) |
| **Diet / substrate** | sugar, glycogen, low fiber, processed food, emulsifiers, high-fat meal |
| **Infectious** | bacterial otitis/sinusitis, viral URI/gastroenteritis, enteropathogen bloom, C. diff |
| **Pharmacologic** | antibiotics (topical/systemic), NSAIDs, PPI/antacid, decongestant overuse |
| **Immune / hormonal** | histamine, allergens, immunosuppression, menstrual/hormonal shifts |
| **Psychophysiological** | cortisol stress, sleep deprivation, intense exercise |

Legacy per-trigger effect tables (original 18) are preserved in git history; all effect values now live in [`stressors.ts`](../src/data/stressors.ts).

**Antibiotic triggers** (`antibiotic_ear_drops`, `topical_antibiotic`, `antibiotic_course`, `antibiotic_disruption`, `c_diff_after_antibiotics`) resolve route-specific spectra from [`antibioticSpectra.ts`](../src/data/antibioticSpectra.ts): otic, topical, gut_broad, vaginal_systemic. Per-trigger `biome` fields merge as extras (e.g. C. diff adds inflammation and spawns on top of gut_broad).

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

**Regions:** nose, gut (strain panel; also in baseline)

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

| Region | Count | Triggers |
| --- | --- | --- |
| ear | 12 | allergen, dry_air, cerumen_impaction, swim_exposure, bacterial_ear_infection, fungal_otitis, hearing_aid_occlusion, qtip_trauma, chlorinated_pool_ear, smoke_pollution, contact_allergen, antibiotic_ear_drops |
| scalp | 11 | sebum_surge, harsh_shampoo, friction_irritant, heat_sweat_surge, stress_cortisol, chemical_hair_dye, uv_sun_exposure, hard_water_wash, hat_occlusion, dandruff_flare, chlorinated_pool_scalp |
| nose | 12 | allergen, dry_air, smoke_pollution, histamine, viral_uri, bacterial_sinusitis, cigarette_smoke, cold_air_burst, pollution_pm25, mold_spore_exposure, occupational_dust, decongestant_overuse |
| oral | 13 | stress_cortisol, cigarette_smoke, thrush_bloom, dry_mouth, sugar_exposure, acid_reflux_lpr, alcohol_exposure, chlorhexidine_rinse, poor_oral_hygiene, acidic_beverage, mouth_breathing, immunosuppression, radiation_xerostomia |
| skin | 15 | contact_allergen, friction_irritant, heat_sweat_surge, uv_sun_exposure, hard_water_wash, alkaline, topical_antibiotic, occlusive_sweat, detergent_residue, eczema_flare, hot_shower_soap, staph_colonization, fungal_intertrigo, dehydration, hormonal_fluctuation |
| vaginal | 13 | immunosuppression, hormonal_fluctuation, alkaline_flush, antibiotic_course, glycogen_spike, douching, menstrual_flow, hormonal_contraceptive, perfumed_products, synthetic_clothing, semen_exposure, heat_humidity, spermicide_irritant |
| gut | 21 | stress_cortisol, alcohol_exposure, immunosuppression, stress, enteropathogen_bloom, antibiotic_disruption, low_fiber_diet, high_fat_meal, food_poisoning, alcohol_binge, nsaid_exposure, gluten_challenge, emulsifier_load, sleep_deprivation, viral_gastroenteritis, ppi_antacid, processed_food_load, intense_exercise, travelers_diarrhea, c_diff_after_antibiotics, food_allergen |

### Regional care by region (non-strain only)

| Region | Regional care |
| --- | --- |
| ear | saline_mist |
| scalp | s_epidermidis, ph_serum |
| nose | saline_mist |
| oral | — |
| skin | s_epidermidis, ph_serum |
| vaginal | ph_serum |
| gut | scfa |

Strain and product shortcuts per region live in [`regionSuggestions.ts`](../../src/data/regionSuggestions.ts) (dashboard **Suggested for [tissue]** chips).

---

## Strain library (all regions)

Available via **Interventions → Strain library** tab. Source: [`src/data/strains.ts`](../../src/data/strains.ts), `inoculateStrain()`.

| Action ID | Strain | Spawn | Primary effects |
| --- | --- | --- | --- |
| `lrham` | L. rhamnosus | 16 | inflammation −0.18, integrity +0.1 |
| `lacid` | L. acidophilus | 18 | pH −0.5, biofilm −0.2 |
| `lcasei` | L. casei | 14 | inflammation −0.12, integrity +0.08 |
| `lparacasei` | L. paracasei | 14 | inflammation −0.14, integrity +0.09, postbiotic +0.03 |
| `lsaliv` | L. salivarius | 18 | pH −0.2, biofilm −0.15 |
| `lreuteri` | L. reuteri | 12 | inflammation −0.14, integrity +0.09, pH −0.15 |
| `lgasseri` | L. gasseri | 14 | inflammation −0.16, integrity +0.10, pH −0.12 |
| `lferment` | L. fermentum | 12 | pH −0.18, postbiotic +0.05, inflammation −0.10 |
| `blactis` | B. lactis | 14 | commensal +0.15, postbiotic +0.04 |
| `blongum` | B. longum | 12 | commensal +0.12, postbiotic +0.05 |
| `bbifidum` | B. bifidum | 12 | commensal +0.14, postbiotic +0.04 |
| `bbreve` | B. breve | 13 | commensal +0.16, postbiotic +0.05 |
| `binf` | B. infantis | 14 | commensal +0.2, integrity +0.08 |
| `lplant` | L. plantarum | 16 | inflammation −0.18, integrity +0.1 |
| `lbulgaricus` | L. bulgaricus | 10 | pH −0.25, biofilm −0.1 |
| `sthermo` | S. thermophilus | 10 | pH −0.15 |
| `sboul` | S. boulardii | 14 | yeast −0.25, inflammation −0.12 |
| `ssaliv_k12` | S. salivarius K12 | 16 | biofilm −0.18, inflammation −0.1, moisture +0.08 |
| `ssaliv_m18` | S. salivarius M18 | 16 | biofilm −0.22, integrity +0.06 |
| `sepidermidis` | S. epidermidis (commensal) | 20 | biofilm −0.15 |

Commensal strains spawn as `commensal` nodes, not probiotics. Click any strain to preview in the **Action Preview** panel.

---

## Prebiotics (all regions)

Source: [`src/data/strains.ts`](../../src/data/strains.ts), `inoculatePrebiotic()`.

| Action ID | Substrate | Spawn | Common regions |
| --- | --- | --- | --- |
| `inulin` | Inulin | 20 | gut |
| `fos` | FOS | 18 | gut |
| `gos` | GOS | 16 | gut |
| `resistant_starch` | Resistant starch | 22 | gut |
| `pectin` | Pectin | 18 | gut, oral |
| `beta_glucan` | Beta-glucan | 16 | gut |

Prebiotic nodes convert to SCFA near probiotics (r=0.4). Gut **Suggested** chips include inulin, FOS, GOS, and resistant starch.

---

## Postbiotics (all regions)

Source: [`src/data/postbiotics.ts`](../../src/data/postbiotics.ts), `applyPostbiotic()`. Postbiotics raise the `postbioticLevel` scalar directly — no microbe nodes spawned.

| Action ID | Label | Preferred regions | Primary effects (scaled) |
| --- | --- | --- | --- |
| `scfa_mix` | SCFA mix | gut | postbiotic +0.3, integrity +0.12, inflammation −0.15 |
| `butyrate` | Butyrate | gut | postbiotic +0.25, integrity +0.18, inflammation −0.12 |
| `propionate` | Propionate | gut | postbiotic +0.15, inflammation −0.08, commensal +0.10 |
| `acetate` | Acetate | gut, oral | postbiotic +0.12, pH −0.08, integrity +0.06 |

Gut regional care **RELEASE SCFA BOOST** (`scfa`) delegates to `scfa_mix`. Use the **Postbiotics** catalog tab for individual metabolites.

---

## Products & fermented foods (all regions)

Source: [`src/data/products.ts`](../../src/data/products.ts), `applyProduct()`. See [Products](products.md) for full strain bundles.

| Action ID | Label | Preferred regions |
| --- | --- | --- |
| `synbiotic_supplement` | Multi-strain synbiotic capsule | gut, oral |
| `oral_probiotic_lozenge` | Oral probiotic lozenge | oral, nose, ear |
| `vaginal_probiotic_capsule` | Vaginal probiotic capsule | vaginal |
| `probiotic_topical_cream` | Probiotic topical cream | skin, scalp |
| `kefir_drink` | Kefir drink | gut, oral |
| `probiotic_yogurt` | Probiotic yogurt | gut, oral |
| `kimchi` | Kimchi (fermented) | gut |
| `sauerkraut` | Sauerkraut (fermented) | gut |
| `kombucha` | Kombucha drink | gut, oral |
| `miso` | Miso (fermented) | gut |

Products spawn strains, apply per-strain biome effects (scaled), apply product bonus, and log a structured event summary.

---

## Visual burst mapping

[`SceneManager.playBurst()`](../src/scene/SceneManager.ts) maps action IDs to burst categories for micro-view feedback: `allergen`, `alkaline`, `stress`, `probiotic`, `default`. Product IDs have distinct burst colors (lozenge = blue, fermented = amber/gold).

---

## Related docs

- [Biotics](biotics.md)
- [Body regions](regions.md)
- [Simulation dynamics](../simulation/dynamics.md)
