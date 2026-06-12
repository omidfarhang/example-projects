# Scenarios

Three blog-backed presets define the lab's narrative framing. Each preset sets default environment values, links to an omid.dev article, and suggests regions and action sequences to explore.

Preset definitions: [`src/data/presets.ts`](../src/data/presets.ts)

---

## Preset summary

| Preset ID | Title | Default region | Article |
| --- | --- | --- | --- |
| `allergy` | Allergy & Barrier Defense | nose | [How Probiotics Help with Allergies](https://omid.dev/2024/09/10/how-probiotics-help-with-allergies/) |
| `candida` | Candida & pH Balance | vaginal | [How Probiotics Help with Candidiasis](https://omid.dev/2024/09/10/how-probiotics-help-with-candidiasis/) |
| `lifecycle` | Biotic Lifecycle Sandbox | gut | [Unlocking Prebiotics, Probiotics, and Postbiotics](https://omid.dev/2024/09/10/prebiotics-probiotics-postbiotics/) |

---

## Allergy & Barrier Defense (`allergy`)

### Narrative

> Select a tissue region on the body map, then run region-specific triggers and inoculations. On nose/sinus tissue, allergen spikes and histamine surges stress the barrier — probiotics help commensals compete for attachment sites.

**Life-stage variant** (`?context=lifestage`):

> Life-stage context: early-life microbiome training shapes how the nasal barrier responds to allergens. Select nose/sinus and use region-specific inoculations to restore barrier integrity across ages.

Links to [Probiotics Through the Ages](https://omid.dev/2024/09/10/probiotics-through-the-ages/) when `context=lifestage`.

### Recommended regions

| Region | Why |
| --- | --- |
| **nose** | Primary preset region — pollen allergens, histamine, saline mist |
| **ear** | Allergen + dry air + cerumen stressors; L. rhamnosus recovery |
| **scalp** | Friction irritant and sebum dynamics (secondary exploration) |

### Suggested exploration path (nose)

1. Select **Nose / Sinus**
2. **Trigger:** `allergen` — watch inflammation spike, integrity drop, allergen count rise
3. **Trigger:** `histamine` — further inflammation
4. **Inoculate:** `lrham` — probiotics spawn, inflammation eases, integrity recovers
5. **Inoculate:** `saline_mist` — moisture restored, allergen adhesion reduced
6. Optionally lower **moisture** slider and re-trigger `dry_air` to see mucus-layer thinning

### Expected outcomes

- Integrity drops below 60% after allergen spike, recovers with probiotics
- Allergen trend arrow shows increase then decrease after intervention
- Event log narrates epithelial stress and commensal retreat

---

## Candida & pH Balance (`candida`)

### Narrative

> Select oral, vaginal, skin, or gut tissue and adjust pH and moisture. Alkaline shifts and sugar load favor C. albicans — try oral thrush or vaginal pH disruption, then acidifying inoculations to restore balance.

### Recommended regions

| Region | Why |
| --- | --- |
| **vaginal** | Default — alkaline flush, antibiotic course, L. acidophilus recovery |
| **oral** | Thrush bloom, dry mouth, sugar exposure; L. salivarius, S. boulardii |
| **skin** | Alkaline + sugar trigger; L. acidophilus acidifies pH |
| **scalp** | Sebum surge → Malassezia bloom (related yeast dynamics) |

### Suggested exploration path (vaginal)

1. Select **Vaginal**
2. Note baseline pH ~4.2 (acidic, healthy)
3. **Trigger:** `alkaline_flush` — pH rises, C. albicans and Gardnerella spawn, integrity drops
4. Watch **biofilm** and pathogen counts increase
5. **Inoculate:** `lacid` — pH drops ~0.5, biofilm reduced, L. acidophilus spawned
6. **Inoculate:** `ph_serum` — further pH restoration

### Suggested exploration path (oral)

1. Select **Oral / Mouth**
2. **Trigger:** `thrush_bloom` — C. albicans patches, biofilm + inflammation rise
3. **Inoculate:** `sboul` — yeast vitality penalized, inflammation eases
4. **Trigger:** `dry_mouth` then **Inoculate:** `lsaliv` — saliva niche restoration

### Expected outcomes

- pH slider and readout shift visibly after alkaline triggers
- Pathogen/yeast counts peak then decline after acidifying probiotics
- Biofilm meter correlates with yeast bloom triggers

---

## Biotic Lifecycle Sandbox (`lifecycle`)

### Narrative

> Free-play across unlocked regions. Select gut tissue to add prebiotic fiber, watch probiotics consume it, and observe postbiotic SCFA particles healing epithelial integrity.

### Recommended regions

| Region | Why |
| --- | --- |
| **gut** | Only region with prebiotic baseline, prebiotic inoculation, and SCFA action |
| Other regions | Free exploration with full trigger/inoculation sets, but no SCFA stat panel |

### Suggested exploration path (gut)

1. Select **Gut**
2. Note baseline: L. plantarum probiotics + inulin prebiotics already seeded
3. Watch **SCFA / Postbiotic** stat — rises as prebiotics convert near probiotics
4. **Trigger:** `antibiotic_disruption` — commensals depleted, postbiotic level drops, integrity stressed
5. **Inoculate:** `prebiotic` — add more inulin substrate
6. **Inoculate:** `lplant` — seed additional L. plantarum
7. Wait for prebiotic → postbiotic conversion; integrity recovers when postbioticLevel > 0.2
8. **Inoculate:** `scfa` — direct postbiotic surge for immediate barrier recovery

### Expected outcomes

- SCFA stat visible only under this preset
- postbioticLevel rises gradually from conversion or instantly from `scfa` action
- Integrity trend improves after postbiotic accumulation
- Event log shows fiber addition, probiotic seeding, and barrier recovery messages

---

## Cross-preset exploration

All seven regions are available under every preset. Presets mainly change:

- Default region on load
- Scenario description text
- Preset-specific environment overrides
- Blog article link
- SCFA stat visibility (`lifecycle` only)

Use presets as **narrative framing**, not hard locks on region or action availability.

---

## Deep link quick reference

```text
?preset=allergy&region=nose
?preset=allergy&context=lifestage
?preset=candida&region=vaginal
?preset=candida&region=oral
?preset=candida&region=skin
?preset=lifecycle&region=gut
```

See [User guide](user-guide.md) for full URL parameter documentation.

---

## Related docs

- [Body regions](domain/regions.md)
- [Biotics](domain/biotics.md)
- [Actions reference](domain/actions-reference.md)
