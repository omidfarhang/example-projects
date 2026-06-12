# Visualization

Three.js rendering layer: macro body, micro tissue cross-sections, instanced microbes, and visual feedback.

Sources: [`src/scene/`](../src/scene/)

---

## Scene graph overview

```text
Scene
├── Lights (ambient, directional ×3, inflammation point light)
├── BodyMesh (macro)
│   └── Hotspots (per-region click targets)
├── TissueLayer (micro)
│   ├── Epithelium3D (tissue cross-section)
│   ├── MicrobeMeshes (instanced agents)
│   └── EffectBurst (action rings)
└── Fog (density tied to inflammation)
```

[`SceneManager`](../src/scene/SceneManager.ts) owns the scene, renderer, camera rig, and render loop integration.

---

## Renderer setup

- **WebGLRenderer** on dashboard canvas, antialias enabled
- Background: `#050b14`
- **FogExp2** — density increases with inflammation
- Pixel ratio capped at 2
- sRGB color space

---

## Macro view — BodyMesh

[`BodyMesh.ts`](../src/scene/BodyMesh.ts):

- Low-poly ~8-head clinical hologram figure
- Edge outlines for holographic look
- Slow auto-rotation (`body.rotation.y += dt × 0.15`) in macro mode
- **Hotspots** — sphere markers at region `hotspot` coordinates from config

### Hotspot interaction

- Raycasting on click/mousemove (macro mode only)
- Hover: scale ×1.4, pointer cursor
- Click active hotspot → `onRegionSelect(id)`
- Projected 2D positions sent to dashboard for overlay labels

---

## Camera — CameraRig

[`CameraRig.ts`](../src/scene/CameraRig.ts):

- **Macro mode:** orbit full body
- **Micro mode:** fly-to animation toward tissue-specific focal point
- **OrbitControls** for user drag in both modes
- `flyToMicro(geometry)` / `flyToMacro()` — animated transitions
- Separate camera instances or positions per mode

---

## Micro view — TissueLayer

[`TissueLayer.ts`](../src/scene/TissueLayer.ts) bridges simulation and 3D:

1. `setGeometry(kind)` — load tissue model via `Epithelium3D`
2. `update(nodes, biome, dt)` — place microbe instances + update tissue overlays
3. `show()` / `hide()` — toggle visibility on region change / back to body
4. `playBurst(kind)` — delegate to effect system

Maps simulation coordinates (x, y, z) to 3D positions on epithelial surface.

---

## Tissue cross-sections — Epithelium3D

[`Epithelium3D.ts`](../src/scene/epithelium/Epithelium3D.ts) selects builder by `EpitheliumKind`:

| Kind | Builder | Region |
| --- | --- | --- |
| `sinus` | `buildNasalTissue` | nose |
| `skin` | `buildSkinTissue` | skin |
| `gut` | `buildGutTissue` | gut |
| `ear` | `buildEarCanalTissue` | ear |
| `scalp` | `buildScalpTissue` | scalp |
| `oral` | `buildOralTissue` | oral |
| `vaginal` | `buildVaginalTissue` | vaginal |

[`tissueModels.ts`](../src/scene/epithelium/tissueModels.ts) (~950 lines) procedurally builds anatomical layers: villi, mucosa, sebum film, cerumen plug, follicles, lumen chamber, etc.

[`LumenChamber.ts`](../src/scene/epithelium/LumenChamber.ts) defines lumen bounds per tissue type.

### Visual ↔ biome coupling

`Epithelium3D.update(state)` drives overlays:

| Overlay flag | Biome inputs | Visual effect |
| --- | --- | --- |
| `isBiofilm` | biofilm | Opacity = biofilm × 0.45 |
| `isMucus` | moisture, postbioticLevel, inflammation | Mucus layer opacity |
| `isScfa` | postbioticLevel | SCFA glow opacity + emissive |
| `isSheen` | moisture, ph, integrity | Barrier sheen |
| `isCerumen` | cerumen, moisture | Ear wax layer |
| `isSebum` | sebum, sweatRate | Lipid film |
| `isThrush` | biofilm, ph | Candida patch hint |

**Inflamed meshes:** emissive redness when inflammation > 0.28.

**Scene inflammation light:** point light intensity = inflammation × 2.5 in micro view.

---

## Microbes — MicrobeMeshes

[`MicrobeMeshes.ts`](../src/scene/microbes/MicrobeMeshes.ts):

- **InstancedMesh** buckets by type: probiotic, commensal, pathogen, allergen, prebiotic, other
- Geometry variants: capsules (probiotic), spiky icosahedra (pathogen), spheres, cylinders
- Color per type (see [Biotics](../domain/biotics.md))
- Instance count = live nodes of that type; hidden when vitality low

Postbiotics are **not** instanced — only tissue SCFA overlay.

---

## Tissue callouts

[`tissueCallouts.ts`](../src/scene/tissueCallouts.ts):

- 3D anchor positions per `EpitheliumKind`
- Labels: LUMEN, VILLUS TIP, SEBUM FILM, CERUMEN PLUG, etc.
- `SceneManager.getTissueCalloutProjections()` projects to 2D HUD coordinates
- Dashboard renders callout overlays on viewport

---

## Effect bursts

[`EffectBurst.ts`](../src/scene/EffectBurst.ts):

- Expanding ring on trigger/inoculation
- Burst category from `SceneManager.playBurst()`:

| Category | Trigger IDs |
| --- | --- |
| `allergen` | allergen, histamine, friction_irritant |
| `alkaline` | alkaline |
| `stress` | stress, enteropathogen_bloom, antibiotic_disruption |
| `probiotic` | lrham, binf, lacid, lplant, s_epidermidis, prebiotic, scfa, saline_mist, ph_serum, lsaliv, sboul |
| `default` | all others |

---

## Render loop integration

[`SceneManager.render(snapshot)`](../src/scene/SceneManager.ts):

**Micro mode:**

- Hide body and hotspots
- `tissue.update(nodes, biome, dt)`
- Inflammation point light active
- Fog density scales with inflammation

**Macro mode:**

- Show body + hotspots, hide tissue
- Body rotates slowly
- Inflammation light off

FPS computed from clock delta, passed to dashboard badge.

---

## Related docs

- [System overview](system-overview.md)
- [UI dashboard](ui-dashboard.md)
- [Data model](../simulation/data-model.md)
