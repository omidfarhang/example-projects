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
| **CORE-03** | 18 stressor triggers + region-gated inoculations | `regions.ts`, `engine.ts` |
| **CORE-04** | Individual strains panel — 15 strains, all regions | `strains.ts`, `Dashboard.ts` |
| **CORE-05** | Prebiotics panel — inulin + FOS spawn + conversion loop | `strains.ts`, `engine.ts` |
| **CORE-06** | Products & fermented foods — 5 products with region multipliers | `products.ts`, `engine.ts` |
| **CORE-07** | 9 environment sliders with region subsets | `envVars.ts`, `environment.md` |
| **CORE-08** | Domain documentation pass (biotics, products, actions, regions) | `docs/domain/*` |
| **CORE-09** | Deterministic sim engine + real-time stats + event log | `engine.ts`, `Dashboard.ts` |

---

## Next up (P1)

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| **UX-07** | P1 | Shipped in this pass | Action Impact Preview Panel — hover/select strains, prebiotics, products to see adds, biome deltas, region efficacy, and causal "why" |
| **SIM-08** | P1 | Shipped in this pass | `applyProduct()` applies per-strain `BiomeEffect` from catalog (scaled by dose × region multiplier) in addition to product bonus |
| **CONTENT-02** | P2 | Strain tooltips absent | Article-linked strain notes in impact preview |
| **SIM-01** | P1 | No automated tests | Golden snapshot tests for deterministic engine (seed 42 + action sequence → expected biome) |

---

## Simulation and model

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| SIM-01 | P1 | No automated tests | Golden snapshot tests for deterministic engine (seed 42 + action sequence → expected biome) |
| SIM-02 | P2 | Antibiotic effects are flat vitality deltas | Region-specific antibiotic spectra (e.g. gut vs topical vs vaginal) |
| SIM-03 | P2 | Postbiotics are scalar only | Optional SCFA particle visualization when postbioticLevel rises; link to tissue glow |
| SIM-04 | P2 | Prebiotic nodes don't appear in population stats | Dashboard row or legend entry for prebiotic substrate level |
| SIM-05 | P3 | Single suppression radius (0.35) for all probiotics | Strain-specific competition strengths (L. acidophilus vs S. boulardii) |
| SIM-06 | P3 | sugarLoad decays uniformly | Region-specific decay (oral faster, gut slower) |
| SIM-07 | P2 | B. infantis listed in nose/gut labels but only inoculable on nose | Align default strain labels with inoculation availability or add gut inoculation |
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
| UX-01 | P1 | Canvas-only 3D interaction | Keyboard region selection (1–7 keys), focusable action buttons |
| UX-02 | P1 | Limited screen reader support | ARIA live region for event log; stat announcements on major changes |
| UX-03 | P2 | Triggers auto-switch to micro view silently | Explicit confirmation or animation when auto-entering micro view |
| UX-04 | P2 | Hint dismissed permanently per session | Contextual tips per preset (allergy vs candida vs lifecycle) |
| UX-05 | P3 | English-only | i18n for labels and event log |
| UX-06 | P2 | Population ×1000 unexplained in UI | Tooltip or footnote explaining display scale |
| UX-07 | P1 | **Done** — Action Impact Preview Panel | See Next up |

---

## Scenarios and content

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| CONTENT-01 | P2 | Scalp/ear not highlighted in preset narratives | Dedicated exploration blurbs in candida/allergy scenarios |
| CONTENT-02 | P2 | Strain tooltips absent | Hover tooltips linking strains to article claims |
| CONTENT-03 | P3 | Life-stage context only via URL param | Preset sub-variant selector in dashboard (not just `?context=lifestage`) |
| CONTENT-04 | P2 | Event log shows last 8 only | Expandable full log or export for classroom use |

---

## Visualization

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| VIZ-01 | P2 | Postbiotic effect is tissue overlay only | Lumen particle field proportional to postbioticLevel |
| VIZ-02 | P3 | All microbe types share limited geometry variants | Distinct mesh for yeast vs bacterium vs allergen particle |
| VIZ-03 | P2 | Biofilm opacity linear | Non-linear visual threshold so low biofilm still visible |
| VIZ-04 | P3 | No mobile touch orbit hints | Touch gesture overlay for tablet users |

---

## Architecture and engineering

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| ENG-01 | P1 | Action effects hardcoded in engine switch statements | Data-driven action defs shared with docs (JSON or TS config imported by engine) |
| ENG-02 | P2 | Dashboard builds all DOM in one template string | Component modules or template partials for maintainability |
| ENG-03 | P2 | No CI for lab | Playground build smoke test in GitHub Actions |
| ENG-04 | P3 | tissueModels.ts ~950 lines monolithic | Split per tissue builder file |
| ENG-05 | P2 | Docs manually synced | CI check that action IDs in regions.ts match engine branches |

---

## Scientific depth (careful scope)

| ID | Priority | Current state | Target / gap |
| --- | --- | --- | --- |
| SCI-01 | P3 | Illustrative pH bands | Optional "advanced mode" showing cited pH ranges per tissue |
| SCI-02 | P3 | No immune layer | Simplified macrophage/cytokine scalar (inflammation already partial proxy) |
| SCI-03 | P3 | No diet timeline | Multi-step "day simulation" with meals affecting sugarLoad |

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
4. **CONTENT-02** (article-linked strain notes) — extends impact preview
5. **SIM-04** (prebiotic stats) — dashboard completeness
6. **ENG-01** (data-driven actions) — reduces doc/code drift
7. **UX-01, UX-02** (accessibility) — broadens audience
8. **SIM-03, VIZ-01** (postbiotic visualization) — lifecycle preset payoff
9. **STATE-01** (shareable state) — classroom sharing

---

## Completed

| ID | Shipped | Notes |
| --- | --- | --- |
| CORE-01–09 | 2026 foundation | See Shipped foundation table |
| UX-07 | June 2026 | Action Impact Preview Panel (`actionImpact.ts`, `Dashboard.ts`) |
| SIM-08 | June 2026 | Per-strain biome effects on `applyProduct()` via `scaleBiomeEffect()` |

---

## Related docs

- [Assumptions and limits](../simulation/assumptions-and-limits.md)
- [Extending the lab](development/extending.md)
- [Actions reference](../domain/actions-reference.md)
