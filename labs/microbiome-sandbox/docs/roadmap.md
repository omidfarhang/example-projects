# Roadmap

Doc-driven improvement backlog: gaps between the documented ideal and the current implementation. Use this file to prioritize app work after reading the full documentation set.

Last audited against source: documentation pass (2026).

---

## Priority legend

| Priority | Meaning |
| --- | --- |
| P1 | High impact on educational clarity or maintainability |
| P2 | Meaningful enhancement, moderate effort |
| P3 | Nice-to-have or long-term |

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

1. **SIM-01** (tests) — safety net for all other changes
2. **ENG-01** (data-driven actions) — reduces doc/code drift
3. **UX-01, UX-02** (accessibility) — broadens audience
4. **SIM-03, VIZ-01** (postbiotic visualization) — lifecycle preset payoff
5. **STATE-01** (shareable state) — classroom sharing
6. **CONTENT-02** (strain tooltips) — connects lab to articles

---

## Completed

_None yet — mark items here when shipped._

---

## Related docs

- [Assumptions and limits](../simulation/assumptions-and-limits.md)
- [Extending the lab](development/extending.md)
- [Actions reference](../domain/actions-reference.md)
