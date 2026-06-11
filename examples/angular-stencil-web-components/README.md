# Angular + Stencil Web Components

Companion project for [Implementing Custom Web Components in Angular with Stencil.js](https://omid.dev/2024/06/26/implementing-custom-web-components-in-angular-with-stenciljs/).

**Live demo:** https://playground.omid.dev/examples/angular-stencil-web-components/ (prebuilt on [playground.omid.dev](https://playground.omid.dev))

## Structure

```
angular-stencil-web-components/
├── stencil-my-button/   # Stencil component library
└── angular-app/         # Angular app consuming <my-button>
```

## Build and run

Terminal 1 — build the Stencil component:

```bash
cd stencil-my-button
npm install
npm run build
cp -r dist/esm/* ../angular-app/src/assets/stencil-my-button/
```

Terminal 2 — run the Angular app:

```bash
cd angular-app
npm install
npm start
```

Open http://localhost:4200

## Blog post

https://omid.dev/2024/06/26/implementing-custom-web-components-in-angular-with-stenciljs/
