# Bootstrap to Tailwind Migration

Companion project for [Migrating an Existing Project from Pure CSS and Bootstrap to Tailwind CSS](https://omid.dev/2024/05/22/migrate-css-bootstrap-to-tailwind/).

**Live demo:** [Bootstrap to Tailwind Migration](https://playground.omid.dev/examples/bootstrap-to-tailwind-migration/) (prebuilt on [playground.omid.dev](https://playground.omid.dev))

## What this demo shows

The demo is a small CRM dashboard and pricing page, not a one-card example. It includes the kinds of UI surfaces that make a Bootstrap-to-Tailwind migration interesting:

- A sticky navigation bar with responsive links and calls to action.
- A hero section with product copy, metric cards, and a progress indicator.
- Dashboard summary cards and a pipeline list with status badges.
- A pricing section with a highlighted plan.
- Migration notes that call out what changes between the two approaches.

## Compare the Versions

Open both pages in a browser and compare the markup:

- `before-bootstrap/index.html`
- `after-tailwind/index.html`

The Bootstrap version combines framework components, grid classes, and local CSS overrides. The Tailwind version keeps the same product UI but moves most styling decisions into utility classes, with a small Tailwind theme extension for repeated brand values.

Useful questions while comparing:

- Which Bootstrap component classes had a direct Tailwind utility equivalent?
- Which local CSS rules became repeated utilities or theme tokens?
- Where do responsive decisions become clearer or noisier?
- Which styles should become reusable components in a larger application?

## Blog post

[Migrating an Existing Project from Pure CSS and Bootstrap to Tailwind CSS](https://omid.dev/2024/05/22/migrate-css-bootstrap-to-tailwind/)
