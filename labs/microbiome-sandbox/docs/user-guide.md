# User Guide

How to operate the Bio-Dynamics lab: views, dashboard panels, controls, and deep links.

---

## Views

### Macro view (body map)

On load, the lab shows a low-poly holographic human body. Seven tissue regions have clickable hotspots:

| Region | Label |
| --- | --- |
| `ear` | Ear Canal |
| `scalp` | Scalp |
| `nose` | Nose / Sinus |
| `oral` | Oral / Mouth |
| `skin` | Skin |
| `vaginal` | Vaginal |
| `gut` | Gut |

**Select a region** by clicking a hotspot on the 3D body or choosing it from the sidebar **Body-Map Region Selector**. Selection triggers an animated camera transition into the micro view.

**Back to body** returns to the macro view without resetting the simulation.

### Micro view (tissue cross-section)

After selecting a region, the camera flies into a tissue-specific cross-section at labeled magnification (80×–400× depending on region). You see:

- Procedural anatomical layers (villi, mucosa, sebum film, cerumen plug, etc.)
- Instanced 3D microbe meshes colored by type
- Projected **tissue callouts** (e.g. LUMEN, VILLUS TIP, SEBUM FILM) overlaid on the viewport
- A zoom HUD with region title and magnification label

Triggers and inoculations take effect in micro view. If you press an action button while still on the body map, the app auto-selects the current region and enters micro view first.

---

## Dashboard panels

### Header

Title: **BIO-DYNAMICS: FULL-BODY MICROBIOME SANDBOX**

### Sidebar — region selector

Lists all seven regions. The active region is highlighted. Changing region resets the simulation for that tissue (new baseline microbes and environment).

### Sidebar — preset selector

Dropdown with three scenarios:

- Allergy & Barrier Defense
- Candida & pH Balance
- Biotic Lifecycle Sandbox

Changing preset resets the simulation, applies preset environment defaults, and jumps to the preset's default region.

### Scenario text and blog CTA

Describes the current preset narrative. A link opens the related omid.dev article. For the allergy preset with `?context=lifestage`, scenario text switches to the life-stage variant.

### Stats panel

| Stat | Meaning |
| --- | --- |
| **Integrity** | Epithelial barrier strength (0–100%) |
| **Inflammation** | Local inflammatory load (0–100%) |
| **Probiotics** | Probiotic node count × 1000, with trend arrow |
| **Pathogens** | Pathogen + yeast count × 1000, with trend |
| **Allergens** | Allergen count × 1000, with trend |
| **Commensals** | Commensal count × 1000, with trend |
| **Biofilm** | Biofilm level (0–100%) |
| **SCFA / Postbiotic** | Shown only for `lifecycle` preset — postbiotic scalar level |

Population numbers use `POPULATION_SCALE = 1000`: the UI displays raw node counts multiplied by 1000 (e.g. 8 nodes → 8k).

### Event log

Shows the last eight simulation events (trigger/inoculation messages and emergent notes). Updates in real time.

### Environmental sliders

Region-specific subset of sliders (see [Environment](domain/environment.md)). Dragging a slider immediately updates `BiomeState` in the engine.

### Action buttons

Two rows per region:

- **Triggers** (warn styling) — stressors: allergens, pH disruption, antibiotics, etc.
- **Inoculations** (action styling) — interventions: probiotics, prebiotics, SCFA, saline mist, etc.

Actions unavailable for the current region are not shown. Attempting a disallowed action via code logs an event message.

### Footer

Educational disclaimer, engine badge, FPS badge, and footer links.

---

## Controls summary

| Control | Effect |
| --- | --- |
| Click hotspot / region list | Select tissue, enter micro view |
| Back to body | Return to macro view |
| Preset dropdown | Change scenario, reset sim |
| Env sliders | Adjust pH, moisture, temperature, etc. |
| Trigger button | Apply stressor (see [Actions reference](domain/actions-reference.md)) |
| Inoculation button | Apply intervention |
| Orbit (micro view) | Rotate tissue with mouse drag |

---

## URL deep links

Share scenarios with query parameters:

| Scenario | URL |
| --- | --- |
| Allergy & Barrier Defense (Nose/Sinus) | `?preset=allergy&region=nose` |
| Through the Ages variant | `?preset=allergy&context=lifestage` |
| Candida & pH (Vaginal) | `?preset=candida&region=vaginal` |
| Candida & pH (Oral thrush) | `?preset=candida&region=oral` |
| Candida & pH (Skin) | `?preset=candida&region=skin` |
| Biotic Lifecycle (Gut) | `?preset=lifecycle&region=gut` |

**Parameters:**

| Param | Values | Default |
| --- | --- | --- |
| `preset` | `allergy`, `candida`, `lifecycle` | `allergy` |
| `region` | `ear`, `scalp`, `nose`, `oral`, `skin`, `vaginal`, `gut` | Preset default region |
| `context` | `lifestage` (allergy only) | — |

Example full URL:

```text
https://playground.omid.dev/labs/microbiome-sandbox/?preset=lifecycle&region=gut
```

---

## Tips

1. **Run stress then recovery** — trigger an allergen or alkaline flush, watch integrity and inflammation rise, then apply the matching inoculation.
2. **Watch the event log** — every action pushes human-readable messages explaining what changed.
3. **Adjust env sliders during simulation** — pH and moisture changes affect ongoing growth rates, not just immediate state.
4. **Try cross-region exploration** — the candida preset works well on oral, vaginal, and skin; allergy preset on nose and ear.
5. **Lifecycle preset on gut** — add prebiotic fiber, seed L. plantarum, watch SCFA level rise as prebiotics convert near probiotics.

---

## Related docs

- [Scenarios](scenarios.md) — guided exploration paths
- [Body regions](domain/regions.md) — per-tissue details
- [Actions reference](domain/actions-reference.md) — full trigger/inoculation catalog
