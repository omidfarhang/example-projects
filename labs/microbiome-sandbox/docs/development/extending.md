# Extending the Lab

Practical guide for adding regions, actions, environment variables, presets, and keeping documentation in sync.

---

## Documentation sync checklist

When changing simulation behavior, update:

- [ ] [`docs/domain/actions-reference.md`](../domain/actions-reference.md) — trigger/inoculation effects
- [ ] [`docs/simulation/dynamics.md`](../simulation/dynamics.md) — tick rules if changed
- [ ] [`docs/domain/regions.md`](../domain/regions.md) — if region config changes
- [ ] [`docs/domain/environment.md`](../domain/environment.md) — if env vars change
- [ ] [`docs/roadmap.md`](../roadmap.md) — mark items done or add new gaps

---

## Add a body region

### 1. Define region config

Edit [`src/data/regions.ts`](../src/data/regions.ts):

```typescript
{
  id: 'newregion',
  label: 'Display Name',
  active: true,
  hotspot: [x, y, z],           // body mesh coordinates
  microGeometry: 'newkind',     // EpitheliumKind
  zoomTitle: 'TISSUE TITLE',
  scaleLabel: '200× magnification',
  defaultStrains: { probiotics: [], pathogens: [], allergens: [] },
  env: buildRegionEnv({ /* overrides */ }),
  baseline: { commensals: 30, probiotics: [...], ... },
  triggers: [{ id: 'trigger_id', label: 'BUTTON LABEL' }],
  inoculations: [{ id: 'inoc_id', label: 'LABEL', strain: 'Strain' }],
}
```

Add `'newregion'` to `RegionId` type.

### 2. Add environment controls

Edit [`src/data/envVars.ts`](../src/data/envVars.ts):

```typescript
REGION_ENV_CONTROLS.newregion = ['ph', 'moisture', ...];
```

### 3. Build tissue 3D model

1. Add kind to `EpitheliumKind` in [`src/scene/epithelium/types.ts`](../src/scene/epithelium/types.ts)
2. Implement `buildNewRegionTissue()` in [`tissueModels.ts`](../src/scene/epithelium/tissueModels.ts)
3. Register in [`Epithelium3D.setKind()`](../src/scene/epithelium/Epithelium3D.ts) builders map
4. Add tissue callouts in [`tissueCallouts.ts`](../src/scene/tissueCallouts.ts)

### 4. Add body hotspot

Ensure hotspot position in `regions.ts` aligns with clickable sphere in [`BodyMesh.ts`](../src/scene/BodyMesh.ts) (hotspots created from region config).

### 5. Document

Update [`docs/domain/regions.md`](../domain/regions.md).

---

## Add a trigger or inoculation

### 1. Register in region config

Add to `triggers` or `inoculations` array in [`regions.ts`](../src/data/regions.ts) for each region that supports it.

### 2. Implement engine logic

Edit [`src/sim/engine.ts`](../src/sim/engine.ts):

**Trigger** — add branch in `trigger(id)`:

```typescript
} else if (id === 'my_trigger') {
  // mutate biome, spawnBatch, adjustVitality
  this.events.push('Human-readable log message');
}
```

**Inoculation** — add branch in `inoculate(actionId)`.

Use existing helpers:

- `spawnBatch(type, strain, count, opts?)`
- `adjustVitality(types, delta)`
- `clamp()` for bounded values

### 3. Map visual burst (optional)

Edit [`SceneManager.playBurst()`](../src/scene/SceneManager.ts) to categorize burst style.

### 4. Document

Add entry to [`docs/domain/actions-reference.md`](../domain/actions-reference.md) with exact effect values.

---

## Add an environment variable

### 1. Extend types

In [`envVars.ts`](../src/data/envVars.ts):

- Add to `EnvVarId` union
- Add `ENV_VAR_DEFS` entry (min, max, step, default, format)
- Add to relevant `REGION_ENV_CONTROLS` entries

### 2. Extend BiomeState

Add field to [`BiomeState`](../src/sim/types.ts) and engine default in [`engine.ts`](../src/sim/engine.ts).

### 3. Use in dynamics (optional)

Reference new field in `simulateTick()` or growth helpers.

### 4. Visualization (optional)

Pass to `EpitheliumState` and handle in [`Epithelium3D.update()`](../src/scene/epithelium/Epithelium3D.ts).

### 5. Document

Update [`docs/domain/environment.md`](../domain/environment.md) and [`docs/simulation/data-model.md`](../simulation/data-model.md).

---

## Add a preset / scenario

### 1. Define preset

Edit [`src/data/presets.ts`](../src/data/presets.ts):

- Add to `PresetId` union
- Add `PRESETS` entry with title, scenario, articleKey, defaultRegion, env

### 2. Add article link

Edit [`src/data/articles.ts`](../src/data/articles.ts) if new article.

### 3. Dashboard

Preset appears automatically in dropdown. Add conditional UI in [`Dashboard.ts`](../src/ui/Dashboard.ts) if preset-specific stats needed.

### 4. Document

Update [`docs/scenarios.md`](../scenarios.md) and [`docs/user-guide.md`](../user-guide.md) deep links.

---

## Balance simulation values

1. Identify behavior in [`actions-reference.md`](../domain/actions-reference.md) or [`dynamics.md`](../simulation/dynamics.md)
2. Change constants in [`engine.ts`](../src/sim/engine.ts)
3. Verify determinism: same seed + actions → same outcome
4. Update docs with new values (docs are the spec)

Suggested workflow:

- Tune immediate action deltas in `trigger()` / `inoculate()`
- Tune continuous dynamics in `simulateTick()` and growth helpers
- Test visually in micro view with event log + stats

---

## Add tests (recommended)

Currently no test suite. Recommended approach:

1. Extract pure functions from engine (growth rates, spawn logic)
2. Add Vitest or similar
3. Golden snapshot tests: fixed seed + action sequence → expected biome/node state

See [Roadmap](../roadmap.md) — "Engine test suite".

---

## File dependency graph

```text
regions.ts ──────┬──► engine.ts ──► types.ts
                 │         │
envVars.ts ──────┤         └──► snapshot ──► TissueLayer / Dashboard
                 │
presets.ts ──────┘

tissueModels.ts ──► Epithelium3D ──► TissueLayer ──► SceneManager
MicrobeMeshes.ts ──────────────────► TissueLayer
```

---

## Related docs

- [Actions reference](../domain/actions-reference.md)
- [Simulation dynamics](../simulation/dynamics.md)
- [Roadmap](../roadmap.md)
- [Setup and build](setup-and-build.md)
