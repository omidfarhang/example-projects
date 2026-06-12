# UI Dashboard

HTML/CSS lab overlay: layout, stats, controls, and callback wiring.

Source: [`src/ui/Dashboard.ts`](../src/ui/Dashboard.ts), [`src/style.css`](../src/style.css)

---

## Architecture

The dashboard is a **vanilla DOM** overlay — no React/Vue/Svelte. `Dashboard` class:

1. Injects HTML template into mount element
2. Binds event listeners to callbacks
3. Updates DOM each frame from `SimEngine` state

[`App`](../src/app/App.ts) owns the callback implementations.

---

## Layout regions

```text
┌─────────────────────────────────────────────────────────┐
│ HEADER: BIO-DYNAMICS title                              │
├──────────────┬──────────────────────────┬───────────────┤
│ SIDEBAR      │ VIEWPORT (WebGL canvas)  │ STATS PANEL   │
│ - Regions    │ - Hotspot overlays       │ - Integrity   │
│ - Preset     │ - Tissue callouts        │ - Inflammation│
│ - Scenario   │ - Zoom HUD               │ - Populations │
│ - Blog CTA   │ - Mode badge             │ - Biofilm     │
│              │ - Hint                   │ - SCFA*       │
│              │                          │ - Event log   │
│              │                          │ - Env sliders │
│              │                          │ - Triggers    │
│              │                          │ - Inoculations│
│              │                          │ - Strains     │
│              │                          │ - Prebiotics  │
│              │                          │ - Event log   │
├──────────────┴──────────────────────────┴───────────────┤
│ CONTROLS: env (full row) | stressors + regional | catalog + preview │
├─────────────────────────────────────────────────────────┤
│ FOOTER: disclaimer, engine badge, FPS, links           │
└─────────────────────────────────────────────────────────┘

* SCFA row visible only for lifecycle preset
```

CSS class prefix: `bd-*` (Bio-Dynamics). Full styling in [`style.css`](../src/style.css) (~646 lines).

---

## DashboardCallbacks

Interface wired by App:

| Callback | Trigger | App handler |
| --- | --- | --- |
| `onRegionSelect(id)` | Region list click | `selectRegion()` |
| `onPresetChange(id)` | Preset dropdown | `changePreset()` |
| `onBackToBody()` | Back button | `backToBody()` |
| `onTrigger(id)` | Trigger button | `handleTrigger()` |
| `onInoculate(id)` | Inoculation button | `handleInoculate()` |
| `onApplyStrain(id)` | Strain panel button | `handleApplyStrain()` |
| `onApplyPrebiotic(id)` | Prebiotic button | `handleApplyPrebiotic()` |
| `onApplyProduct(id)` | Product button | `handleApplyProduct()` |
| `onEnvChange(env)` | Slider input | `engine.setEnv()` |

---

## Region selector

- Renders all entries from `REGIONS`
- Highlights `currentRegion`
- Click → `onRegionSelect`
- Synced with 3D hotspot selection

---

## Preset selector

- Dropdown: allergy, candida, lifecycle
- On change: resets sim, applies preset env, jumps to default region
- Updates scenario text and blog CTA link

### Context variant

Constructor accepts optional `context` from URL. When `context=lifestage` and preset is allergy:

- Scenario text uses `scenarioLifestage`
- Blog CTA links to "Probiotics Through the Ages"

---

## Stats panel

Updated each frame in `update(engine, fps)`:

| Element | Source |
| --- | --- |
| Integrity meter | `biome.integrity × 100%` |
| Inflammation meter | `biome.inflammation × 100%` |
| Probiotic stat | `probioticCount × POPULATION_SCALE` + trend |
| Pathogen stat | `pathogenCount × POPULATION_SCALE` + trend |
| Allergen stat | `allergenCount × POPULATION_SCALE` + trend |
| Commensal stat | `commensalCount × POPULATION_SCALE` + trend |
| Biofilm stat | `biome.biofilm × 100%` |
| Postbiotic/SCFA | `biome.postbioticLevel × 100%` (lifecycle only) |

**Population formatting:** counts ≥ 1000 displayed as `Nk` (e.g. 8000 → 8k).

**Trend labels:** ↑ Increasing / ↓ Decreasing / → Stable from `engine.getTrends()`.

---

## Event log

Displays `snapshot.events` (last 8 strings). Newest actions appear from engine `events` array.

Dynamic scenario line from `engine.getDynamicScenario()` appends barrier/inflammation summary.

---

## Environmental sliders

Built dynamically per region from `REGION_ENV_CONTROLS`:

1. `setRegionActions()` clears and rebuilds slider rows
2. `syncEnvSliders(biome, region)` sets input values from engine state
3. On input: read slider → format readout → `onEnvChange({ [id]: value })`

Sliders not in region subset are hidden/omitted.

---

## Region action panels

`setRegionActions(region)` rebuilds stressor and regional care UI:

- **Stressors** — `def.triggers`, warn styling, `onTrigger`
- **Suggested chips** — from [`regionSuggestions.ts`](../src/data/regionSuggestions.ts); apply via catalog callbacks + switch tab
- **Regional care** — `def.regionalCare` (non-strain only), `onInoculate`

## Interventions catalog

Rendered once in `renderCatalog()` with three tabs (products, strains, prebiotics). Shares the preview row with [`actionImpact.ts`](../src/ui/actionImpact.ts).

`setCatalogTab(tab)` toggles panes. Suggested chips call `setCatalogTab` before apply so the matching catalog tab is visible.

`flashAction('warn' | 'action')` — brief visual feedback on button press.

---

## Action Impact Preview panel

Source: [`src/ui/actionImpact.ts`](../src/ui/actionImpact.ts) (pure preview builders), rendered by `Dashboard`.

| Interaction | Behavior |
| --- | --- |
| Click strain, prebiotic, or product | Open sticky preview in products row (inline); apply action; flash meters |
| Click a different action | Replace preview with new action |
| Escape / × | Dismiss preview |
| Region change while preview visible | Recompute efficacy and deltas for new region |

Preview data is derived from [`strains.ts`](../src/data/strains.ts) and [`products.ts`](../src/data/products.ts) — no duplicated effect tables. Product previews aggregate product bonus + per-strain catalog effects (matching `applyProduct()` after SIM-08).

`formatImpactEvent()` also builds structured event-log lines when products are applied.

---

## Viewport overlays

| Overlay | Source |
| --- | --- |
| Hotspot labels | `updateHotspotLabels(projections)` from scene |
| Tissue callouts | `updateTissueCallouts(projections)` |
| Zoom title | Region `zoomTitle` |
| Scale label | Region `scaleLabel` |
| Mode badge | MACRO / MICRO |
| Tissue pictogram | Region-specific icon from `TISSUE_PICTOGRAMS` |

`setMicroView(active, region)` toggles back button, zoom HUD, hint visibility.

---

## Conditional UI

| Condition | Behavior |
| --- | --- |
| `preset === 'lifecycle'` | Show postbiotic/SCFA stat row |
| Other presets | Hide postbiotic row |
| Region change | Rebuild env sliders and action buttons |
| First micro view | Show hint (dismissible) |

---

## Engine and FPS badges

Footer displays:

- Engine identifier badge
- FPS from `SceneManager.fps` (rounded from frame delta)

---

## Canvas access

`getCanvas()` returns the WebGL canvas element passed to `SceneManager` constructor. Canvas lives inside dashboard viewport div.

---

## Related docs

- [User guide](../user-guide.md)
- [System overview](system-overview.md)
- [Visualization](visualization.md)
- [Environment](../domain/environment.md)
