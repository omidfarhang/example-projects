# Roadmap

Doc-driven improvement backlog: gaps between the documented ideal and the current implementation. Use this file to prioritize app work after reading the full documentation set.

Last audited against source: June 2026 (roadmap sync + impact preview pass).

---

## Priority legend

| Priority | Meaning |
| --- | --- |
| P1 | High impact on educational clarity or maintainability |
| P2 | Meaningful enhancement, moderate effort |
| P3 | Nice-to-have or long-term |

---

## Shipped foundation

Core educational lab features implemented and documented.

| ID | Shipped | Key sources |
| --- | --- | --- |
| **CORE-01** | 7 active body regions, macro/micro 3D views, tissue callouts | `regions.ts`, `SceneManager.ts`, `tissueCallouts.ts` |
| **CORE-02** | 3 educational presets + URL params (`preset`, `region`, `context`) | `presets.ts`, `user-guide.md` |
| **CORE-03** | 82 stressor triggers + region-gated inoculations | `stressors.ts`, `regions.ts`, `engine.ts` |
| **CORE-04** | Individual strains panel — 20 strains (19 probiotic + 1 commensal), all regions | `strains.ts`, `Dashboard.ts` |
| **CORE-05** | Prebiotics panel — 6 fiber substrates spawn + conversion loop | `strains.ts`, `engine.ts` |
| **CORE-06** | Products & fermented foods — 10 products with region multipliers | `products.ts`, `engine.ts` |
| **CORE-10** | Postbiotics panel — 4 SCFA metabolites (scalar postbioticLevel) | `postbiotics.ts`, `engine.ts` |
| **CORE-07** | 9 environment sliders with region subsets | `envVars.ts`, `environment.md` |
| **CORE-08** | Domain documentation pass (biotics, products, actions, regions) | `docs/domain/*` |
| **CORE-09** | Deterministic sim engine + real-time stats + event log | `engine.ts`, `Dashboard.ts` |

---

## Next up (P1)

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| **UX-07** | P1 | Shipped in this pass | Action Impact Preview Panel — hover/select strains, prebiotics, products to see adds, biome deltas, region efficacy, and causal "why" |
| **SIM-08** | P1 | Shipped in this pass | `applyProduct()` applies per-strain `BiomeEffect` from catalog (scaled by dose × region multiplier) in addition to product bonus |
| **CONTENT-02** | P2 | **Done** — article-linked strain notes | Hover tooltips + impact preview article links (`strains.ts`, `actionImpact.ts`) |
| **SIM-01** | P1 | No automated tests | Golden snapshot tests for deterministic engine (seed 42 + action sequence → expected biome) |

---

## Simulation and model

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| SIM-01 | P1 | No automated tests | Golden snapshot tests for deterministic engine (seed 42 + action sequence → expected biome) |
| SIM-02 | P2 | **Done** — route-specific antibiotic spectra | `antibioticSpectra.ts` — otic, topical, gut_broad, vaginal_systemic |
| SIM-03 | P2 | **Done** — SCFA lumen particles linked to tissue glow | Optional particle field when postbioticLevel ≥ 0.1; surge pulse syncs with epithelial SCFA overlay |
| SIM-04 | P2 | **Done** — prebiotic substrate in stats + legend | Dashboard row (lifecycle) with particle count, % remaining, trend; legend always lists substrate on lifecycle |
| SIM-05 | P3 | **Done** — strain-specific competition | `StrainDef.competition` radius/strength per strain (e.g. L. acidophilus vs S. boulardii) |
| SIM-06 | P3 | **Done** — region-specific sugarLoad decay | `sugarLoadDecay.ts` — oral fastest, gut slowest |
| SIM-07 | P2 | **Done** — B. infantis aligned with nose/gut | Baseline spawns + strain panel on both regions; labels match residents |
| SIM-08 | P1 | **Done** — per-strain effects on product apply | See Next up |

---

## Persistence and sharing

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| STATE-01 | P2 | No session persistence | URL-encoded state (`?integrity=0.6&...`) or localStorage restore |
| STATE-02 | P3 | No mid-simulation share link | "Copy lab state" button serializing preset, region, biome, tick |
| STATE-03 | P3 | Refresh loses all progress | Optional "Resume last session" prompt |

---

## UX and accessibility

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| UX-01 | P1 | **Done** — keyboard region selection + focusable actions | Keys 1–7 select regions; Esc returns to body; action buttons have aria-labels |
| UX-02 | P1 | **Done** — screen reader support | ARIA live announcer for events + stat threshold announcements |
| UX-03 | P2 | **Done** — auto micro view feedback | Zoom animation + banner when actions auto-enter tissue view |
| UX-04 | P2 | **Done** — contextual preset tips | Per-preset tips (allergy/candida/lifecycle) dismissed per session |
| UX-05 | P3 | **Done** — i18n (en/de/fa) | `?lang=de` or `?lang=fa` + header selector; UI labels and event log patterns translated |
| UX-06 | P2 | **Done** — population scale explained | Footnote + tooltips on population stats (×1000 display scale) |
| UX-07 | P1 | **Done** — Action Impact Preview Panel | See Next up |

---

## Scenarios and content

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| CONTENT-01 | P2 | **Done** — ear/scalp exploration blurbs | Region-specific narratives in allergy/candida (`presetRegionNarratives.ts`) |
| CONTENT-02 | P2 | **Done** — article-linked strain notes | Hover tooltips + impact preview article links |
| CONTENT-03 | P3 | **Done** — life-stage variant selector | Dashboard scenario variant (allergy preset) syncs `?context=lifestage` |
| CONTENT-04 | P2 | **Done** — expandable event log + export | Show all / export `.txt` for classroom use (`Dashboard.ts`, `engine.getEvents()`) |

---

## Visualization

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| VIZ-01 | P2 | **Done** — lumen SCFA particle field | Instanced particles proportional to postbioticLevel (`ScfaParticleField.ts`) |
| VIZ-02 | P3 | **Done** — distinct microbe meshes | Yeast ellipsoid, spiky bacterium (pathogen), pollen allergen (`MicrobeMeshes.ts`) |
| VIZ-03 | P2 | **Done** — non-linear biofilm opacity | `biofilmVisualOpacity()` — low biofilm still visible on tissue overlays |
| VIZ-04 | P3 | **Done** — touch gesture overlay | Orbit / pinch / pan hints on coarse-pointer devices (`touchGestureHints.ts`) |

---

## Architecture and engineering

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| ENG-01 | P1 | **Done** — data-driven inoculations | `inoculations.ts` shared by engine + impact preview |
| ENG-02 | P2 | **Done** — dashboard template partials | `ui/dashboard/*` modules composed by `renderDashboardShell()` |
| ENG-03 | P2 | No CI for lab | Playground build smoke test in GitHub Actions |
| ENG-04 | P3 | **Done** — split per tissue builder | `epithelium/tissue/` modules + `tissueModels.ts` barrel re-export |
| ENG-05 | P2 | Docs manually synced | CI check that action IDs in regions.ts match engine branches |

---

## Scientific depth (careful scope)

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| SCI-01 | P3 | **Done** — advanced mode cited pH bands | Optional toggle shows literature ranges per tissue (`phReference.ts`, env panel) |
| SCI-02 | P3 | **Done** — immune activity proxy | `immuneActivity` scalar lags inflammation; shown in advanced stats |
| SCI-03 | P3 | **Done** — day simulation meals | Breakfast→snack timeline raises `sugarLoad` on gut/oral (`dayMeals.ts`, `engine.applyMeal()`) |

Items in this section must preserve [Assumptions and limits](../simulation/assumptions-and-limits.md) disclaimers — avoid implying clinical precision.

---

## Documentation follow-ups

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| DOC-01 | P3 | Plain Markdown in repo | MkDocs or Docusaurus site from `docs/` |
| DOC-02 | P2 | No changelog | CHANGELOG.md when app changes ship |
| DOC-03 | P3 | No diagram of tissue model layers | Per-region anatomy diagrams in regions.md |

---

## Suggested implementation order

1. ~~**UX-07** (impact preview)~~ — shipped
2. ~~**SIM-08** (product strain effects)~~ — shipped
3. **SIM-01** (tests) — safety net for further sim changes
4. ~~**CONTENT-02** (article-linked strain notes)~~ — shipped
5. ~~**SIM-04** (prebiotic stats)~~ — shipped
6. ~~**ENG-01** (data-driven actions)~~ — shipped
7. ~~**UX-01, UX-02** (accessibility)~~ — shipped
8. ~~**SIM-03, VIZ-01** (postbiotic visualization)~~ — shipped
9. **STATE-01** (shareable state) — classroom sharing

---

## Completed

| ID | Shipped | Notes |
| --- | --- | --- |
| CORE-01–09 | 2026 foundation | See Shipped foundation table |
| UX-07 | June 2026 | Action Impact Preview Panel (`actionImpact.ts`, `Dashboard.ts`) |
| SIM-08 | June 2026 | Per-strain biome effects on `applyProduct()` via `scaleBiomeEffect()` |
| SIM-03 | June 2026 | SCFA lumen particle field linked to epithelial glow (`ScfaParticleField.ts`, `TissueLayer.ts`) |
| VIZ-01 | June 2026 | Same pass as SIM-03 — lumen particles proportional to `postbioticLevel` |
| SIM-04 | June 2026 | Prebiotic substrate stat row + lifecycle legend (`Dashboard.ts`, `engine.ts`) |
| VIZ-02 | June 2026 | Distinct yeast / bacterium / allergen instanced meshes (`MicrobeMeshes.ts`) |
| VIZ-03 | June 2026 | Non-linear biofilm overlay opacity (`biofilmVisualOpacity` in `Epithelium3D.ts`) |
| VIZ-04 | June 2026 | Touch orbit/zoom/pan overlay for tablet users (`touchGestureHints.ts`, `Dashboard.ts`) |
| CONTENT-01 | June 2026 | Ear/scalp exploration blurbs in allergy/candida presets (`presetRegionNarratives.ts`) |
| CONTENT-02 | June 2026 | Article-linked strain tooltips + impact preview notes (`strains.ts`, `actionImpact.ts`) |
| CONTENT-03 | June 2026 | Life-stage scenario variant selector in dashboard (`Dashboard.ts`, `App.ts`) |
| CONTENT-04 | June 2026 | Expandable event log + classroom `.txt` export (`engine.getEvents()`, `Dashboard.ts`) |
| ENG-04 | June 2026 | Split `tissueModels.ts` into `epithelium/tissue/*` per-region builders |
| ENG-01 | June 2026 | Data-driven inoculation defs (`inoculations.ts`) replace engine switch branches |
| ENG-02 | June 2026 | Dashboard shell split into `ui/dashboard/*` template partials |
| SCI-01 | June 2026 | Advanced mode pH reference bands with citations (`phReference.ts`, env panel) |
| SCI-02 | June 2026 | `immuneActivity` cytokine/macrophage proxy in advanced stats (`engine.ts`, `types.ts`) |
| SCI-03 | June 2026 | Day meal simulation for gut/oral sugar load (`dayMeals.ts`, `engine.applyMeal()`) |
| UX-01 | June 2026 | Keyboard region shortcuts 1–7, Esc to body map, focusable action buttons |
| UX-02 | June 2026 | ARIA live announcer + stat threshold announcements (`Dashboard.ts`) |
| UX-03 | June 2026 | Auto micro-view zoom animation + tissue banner (`App.ts`, `Dashboard.ts`) |
| UX-04 | June 2026 | Per-preset contextual tips with session dismiss (`presetTips.ts`) |
| UX-05 | June 2026 | English/German/Persian i18n via `?lang=` and header selector (`src/i18n/*`) |
| UX-06 | June 2026 | Population ×1000 footnote and stat tooltips (`blogPanel.ts`, `Dashboard.ts`) |
| SIM-02 | June 2026 | Route-specific antibiotic spectra (`antibioticSpectra.ts`, `stressors.ts`, `engine.ts`) |
| SIM-05 | June 2026 | Strain-specific probiotic competition radius/strength (`strains.ts`, `engine.ts`) |
| SIM-06 | June 2026 | Region-specific sugarLoad decay rates (`sugarLoadDecay.ts`, `engine.ts`) |
| SIM-07 | June 2026 | B. infantis baseline on nose/gut + aligned labels (`regions.ts`, `strains.ts`) |

---

## Related docs

- [Assumptions and limits](../simulation/assumptions-and-limits.md)
- [Extending the lab](development/extending.md)
- [Actions reference](../domain/actions-reference.md)
