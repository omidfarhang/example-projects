# Changelog

All notable changes to the Bio-Dynamics microbiome sandbox lab. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- **STATE-01** — URL-encoded lab state via `?lab=` (base64 checkpoint) plus readable `integrity`, `inflammation`, `tick` params
- **STATE-02** — “Copy lab link” button serializing preset, region, biome, tick, and microbe positions
- **STATE-03** — Optional “Resume session” banner restoring the last autosaved snapshot from `localStorage`
- **DOC-01** — MkDocs Material site (`mkdocs.yml`, `requirements-docs.txt`, `docs/development/docs-site.md`)
- **DOC-03** — Per-region tissue layer mermaid diagrams in `docs/domain/regions.md`

### Changed

- Autosave to `localStorage` every ~12s after meaningful simulation progress; URL sync on user actions

## [2026-06] — Simulation & UX pass

### Added

- Action Impact Preview Panel (UX-07)
- Per-strain biome effects on product apply (SIM-08)
- Route-specific antibiotic spectra — otic, topical, gut, vaginal (SIM-02)
- Strain-specific probiotic competition radius/strength (SIM-05)
- Region-specific sugarLoad decay rates (SIM-06)
- B. infantis baseline alignment on nose/gut (SIM-07)
- SCFA lumen particle field linked to epithelial glow (SIM-03, VIZ-01)
- Prebiotic substrate stat row + lifecycle legend (SIM-04)
- Distinct yeast / bacterium / allergen meshes (VIZ-02)
- Non-linear biofilm overlay opacity (VIZ-03)
- Touch gesture hints for tablets (VIZ-04)
- Keyboard region shortcuts, ARIA live announcer (UX-01, UX-02)
- Auto micro-view zoom banner (UX-03)
- Per-preset contextual tips (UX-04)
- English / German / Persian i18n (UX-05)
- Population ×1000 display footnote (UX-06)
- Advanced mode pH reference bands (SCI-01)
- Immune activity proxy stat (SCI-02)
- Day meal simulation for gut/oral (SCI-03)
- Expandable event log + `.txt` export (CONTENT-04)
- Data-driven inoculations (`inoculations.ts`) (ENG-01)
- Dashboard template partials (ENG-02)
- Split tissue builders per region (ENG-04)

### Documentation

- Domain, simulation, architecture, and development doc set under `docs/`
- Roadmap backlog with shipped/completed tracking

## [2026 foundation]

Initial educational lab: seven body regions, three presets, deterministic engine, stressors, strain/product catalogs, environment sliders, 3D tissue views.
