# Bio-Dynamics: Full-Body Microbiome Sandbox

Interactive 3D lab at [playground.omid.dev/labs/microbiome-sandbox/](https://playground.omid.dev/labs/microbiome-sandbox/).

Rotate a low-poly body map, fly into tissue cross-sections, and run deterministic probiotic scenarios linked to omid.dev health articles.

## Deep links

| Scenario | URL |
| --- | --- |
| Allergy & Barrier Defense (Nose/Sinus) | `?preset=allergy&region=nose` |
| Through the Ages variant | `?preset=allergy&context=lifestage` |
| Candida & pH (Skin) | `?preset=candida&region=skin` |
| Biotic Lifecycle (Gut) | `?preset=lifecycle&region=gut` |

## Local dev

```bash
cd playground/labs/microbiome-sandbox
npm install
npm run dev
```

Build via playground orchestrator:

```bash
# From repository root
npm run build:playground -- --only microbiome-sandbox
```

## Stack

- TypeScript + Vite
- Three.js (macro body + micro instanced microbes)
- Plain TS simulation engine (deterministic tick loop)
- HTML/CSS dashboard overlay

## Linked articles

- [How Probiotics Help with Allergies](https://omid.dev/2024/09/10/how-probiotics-help-with-allergies/)
- [Probiotics Through the Ages](https://omid.dev/2024/09/10/probiotics-through-the-ages/)
- [How Probiotics Help with Candidiasis](https://omid.dev/2024/09/10/how-probiotics-help-with-candidiasis/)
- [Unlocking Prebiotics, Probiotics, and Postbiotics](https://omid.dev/2024/09/10/unlocking-prebiotics-probiotics-and-postbiotics/)

Educational model — not medical advice.
