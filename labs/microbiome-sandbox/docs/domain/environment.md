# Environment

Tissue environment variables: user-adjustable sliders, per-region control subsets, derived biome metrics, and how environment drives simulation behavior.

Source: [`src/data/envVars.ts`](../src/data/envVars.ts)

---

## User-adjustable sliders

All sliders write directly into `BiomeState` via `engine.setEnv()`.

| ID | Label | Min | Max | Step | Default | Display format |
| --- | --- | --- | --- | --- | --- | --- |
| `ph` | pH | 4 | 8 | 0.1 | 6.8 | Value + (Acidic/Neutral/Alkaline) |
| `moisture` | Moisture / Humidity | 0 | 1 | 0.01 | 0.65 | Percentage |
| `temperature` | Local Temperature | 0 | 1 | 0.01 | 0.55 | 34–38°C mapped |
| `sebum` | Sebum / Lipid Film | 0 | 1 | 0.01 | 0.35 | Percentage |
| `cerumen` | Cerumen (Ear Wax) | 0 | 1 | 0.01 | 0.30 | Percentage |
| `salinity` | Salinity / Electrolytes | 0 | 1 | 0.01 | 0.40 | Percentage |
| `oxygenation` | Airway Oxygenation | 0 | 1 | 0.01 | 0.75 | Percentage |
| `sweatRate` | Sweat / TEWL | 0 | 1 | 0.01 | 0.25 | Percentage |
| `oxygenTension` | Lumen O₂ Tension | 0 | 1 | 0.01 | 0.15 | Percentage |

**Temperature mapping:** displayed °C = `34 + temperature × 4`

**pH labels:**

- < 6.5 → Acidic
- 6.5–7.2 → Neutral
- > 7.2 → Alkaline

---

## Per-region control subsets

Not every slider appears for every tissue. Defined in `REGION_ENV_CONTROLS`:

| Region | Sliders shown |
| --- | --- |
| `ear` | ph, moisture, temperature, cerumen, salinity, oxygenation |
| `scalp` | ph, moisture, temperature, sebum, sweatRate |
| `nose` | ph, moisture, temperature, oxygenation |
| `oral` | ph, moisture, temperature, salinity, oxygenation |
| `skin` | ph, moisture, temperature, sebum |
| `vaginal` | ph, moisture, temperature, oxygenTension |
| `gut` | ph, moisture, temperature, oxygenTension |

Hidden sliders retain their values in `BiomeState` but are not user-editable in the dashboard for that region.

Each region also applies **default overrides** at init via `buildRegionEnv()` in [`regions.ts`](../src/data/regions.ts). See [Body regions](regions.md) for per-region defaults.

---

## Derived biome metrics

These fields are simulated, not directly slider-controlled:

| Field | Range | Meaning |
| --- | --- | --- |
| `integrity` | 0–1 | Epithelial barrier strength |
| `inflammation` | 0–1 | **Emergent** tissue inflammatory load — computed from pathogen/allergen pressure, barrier defect, biofilm, and `immuneActivity` |
| `immuneActivity` | 0–1 | Acute immune signaling (histamine/cytokine proxy); raised by immune stressors; advanced stats meter |
| `biofilm` | 0–1 | Microbial biofilm accumulation |
| `sugarLoad` | 0–1 | Available sugar substrate (region-specific decay; day meals add load in advanced mode) |
| `postbioticLevel` | 0–1 | SCFA postbiotic concentration |
| `tryptophanSupport` | 0–1 | Gut only — educational tryptophan / gut-brain proxy (lifecycle + gut UI) |
| `probioticCount` | integer | Live probiotic nodes |
| `pathogenCount` | integer | Pathogen + yeast nodes |
| `allergenCount` | integer | Allergen nodes |
| `commensalCount` | integer | Commensal nodes |

Triggers, inoculations, and continuous tick dynamics modify these fields.

---

## How environment affects simulation

### pH

- **Probiotics:** growth peaks in region-specific acidic/neutral bands (see [Biotics](biotics.md))
- **Pathogens/yeast:** growth increases above pH 7; yeast bonus above 5.5 in oral/vaginal
- **Biofilm:** grows when pH > 7 and moisture > 0.5; decays when pH < 6
- **Commensals:** decline outside pH 5.5–7.5

### Moisture

- Low moisture damages integrity (region-specific thresholds: skin/scalp < 0.35, nose/ear < 0.4, oral < 0.35)
- High moisture + alkaline pH accelerates pathogen growth on skin/scalp
- Gut prebiotic conversion halved when moisture < 0.45
- Dry nose/ear increases allergen vitality

### Temperature

All microbe growth scales by `tempMultiplier(temperature)` — optimal at 0.55, falling off with distance.

### Sebum (scalp, skin)

- Scalp: sebum > 0.5 increases biofilm; sebum > 0.55 boosts yeast growth
- Skin/scalp: high moisture + pH > 7 accelerates pathogens

### Cerumen (ear)

- Cerumen > 0.55 reduces oxygenation over time
- Cerumen > 0.45 increases biofilm
- Cerumen > 0.6 + low oxygenation boosts pathogen growth

### Salinity (ear, oral)

- Ear: salinity > 0.7 reduces pathogen growth rate (×0.75)

### Oxygenation (ear, nose, oral)

- Low oxygenation (< 0.35–0.4) reduces probiotic growth in nose/ear; increases pathogen growth

### Sweat rate (scalp)

- Drives moisture: `moisture += sweatRate × 0.0004 − 0.0001` per tick

### Oxygen tension (vaginal, gut)

- Gut: O₂ > 0.35 reduces probiotic growth (×0.5) — anaerobic preference
- Vaginal: O₂ < 0.2 boosts probiotic growth; pH > 5.0 reduces it (×0.4)

---

## Preset environment overrides

Presets apply additional env defaults on load ([`presets.ts`](../src/data/presets.ts)):

| Preset | Overrides |
| --- | --- |
| `allergy` | ph 6.8, moisture 0.72, temperature 0.54, oxygenation 0.82 |
| `candida` | ph 4.2, moisture 0.62, temperature 0.58, oxygenTension 0.08 |
| `lifecycle` | ph 6.2, moisture 0.65, temperature 0.60, oxygenTension 0.12 |

---

## Internal state: allergen adhesion

Not exposed as a slider. Modified by:

- `dry_air` trigger: +0.3
- `saline_mist` inoculation: −0.2

Affects allergen fall speed and epithelial adhesion in the simulation.

---

## Related docs

- [Simulation dynamics](../simulation/dynamics.md)
- [Body regions](regions.md)
- [Actions reference](actions-reference.md)
