# Overview

## What Bio-Dynamics is

**Bio-Dynamics: Full-Body Microbiome Sandbox** is an interactive 3D educational laboratory. Users explore how microbiomes behave across different body tissues under environmental stress and therapeutic interventions.

The lab combines:

- A **macro view** — rotatable low-poly human body with clickable tissue hotspots
- A **micro view** — animated zoom into anatomical cross-sections with instanced 3D microbes
- A **deterministic simulation** — tick-based model of populations, barrier integrity, inflammation, pH, and biotic interactions
- A **dashboard** — real-time stats, environmental sliders, trigger/inoculation controls, and an event log

The lab is a visual companion to health articles on [omid.dev](https://omid.dev). Three scenario presets link directly to blog posts on allergies, candidiasis, and the pre/pro/postbiotic lifecycle.

**Live demo:** [playground.omid.dev/labs/microbiome-sandbox/](https://playground.omid.dev/labs/microbiome-sandbox/)

---

## Target audience

| Audience | What they get |
| --- | --- |
| Blog readers | Interactive illustration of concepts from omid.dev probiotic articles |
| Educators | Guided scenarios for teaching barrier defense, pH balance, and biotic chains |
| Health-curious learners | Intuition for how environment and interventions affect local microbiomes |
| Future contributors | Documented simulation spec and architecture for extending the lab |

---

## Learning goals

After exploring the lab, users should understand:

1. **Barrier integrity and inflammation** — stressors damage epithelial barriers; recovery depends on environment and interventions
2. **Environmental drivers** — pH, moisture, oxygenation, sebum, cerumen, and salinity shift growth conditions
3. **Microbe competition** — probiotics suppress nearby pathogens, allergens, and yeast within a spatial radius
4. **Biotics lifecycle** — prebiotic fiber feeds probiotics, which produce postbiotic SCFA that supports barrier recovery (gut preset)
5. **Region specificity** — the same intervention (e.g. L. rhamnosus) behaves differently across ear, nose, skin, gut, etc.

---

## What it is not

Bio-Dynamics is **not**:

- A clinical diagnostic or treatment planning tool
- A metagenomic or genomic simulator
- A pharmacokinetic model with time-accurate dosing
- Personalized medicine based on real patient data
- A peer-reviewed scientific model — it is an educational abstraction

See [Assumptions and limits](simulation/assumptions-and-limits.md) for detailed simplifications.

---

## Educational disclaimer

> **Educational model — not medical advice.**
>
> Strain names, population counts, and biome effects are illustrative. Do not use this lab to make health decisions. Consult qualified healthcare professionals for medical concerns.

---

## Linked articles

| Key | Title | URL |
| --- | --- | --- |
| `allergies` | How Probiotics Help with Allergies | [omid.dev/.../how-probiotics-help-with-allergies/](https://omid.dev/2024/09/10/how-probiotics-help-with-allergies/) |
| `lifestage` | Probiotics Through the Ages | [omid.dev/.../probiotics-through-the-ages/](https://omid.dev/2024/09/10/probiotics-through-the-ages/) |
| `candidiasis` | How Probiotics Help with Candidiasis | [omid.dev/.../how-probiotics-help-with-candidiasis/](https://omid.dev/2024/09/10/how-probiotics-help-with-candidiasis/) |
| `lifecycle` | Unlocking Prebiotics, Probiotics, and Postbiotics | [omid.dev/.../prebiotics-probiotics-postbiotics/](https://omid.dev/2024/09/10/prebiotics-probiotics-postbiotics/) |

Presets map to articles via [`src/data/presets.ts`](../src/data/presets.ts) and [`src/data/articles.ts`](../src/data/articles.ts).

---

## Next steps

- [User guide](user-guide.md) — how to operate the lab
- [Scenarios](scenarios.md) — preset narratives and exploration paths
- [Documentation index](README.md) — full table of contents
