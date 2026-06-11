# Angular Shared Library Workspace

Companion project for [Creating a Reusable Shared Module in Angular](https://omid.dev/2024/05/12/reusable-shared-module-in-angular/).

**Live demo:** https://playground.omid.dev/examples/angular-shared-library-workspace/ (prebuilt on [playground.omid.dev](https://playground.omid.dev))

## Structure

```text
angular-shared-library-workspace/
  projects/
    my-shared-ui/   # publishable library
    demo-app/       # consuming application
```

## Run demo app

```bash
npm install
npx ng serve demo-app
```

Open http://localhost:4200

## Build library

```bash
npx ng build my-shared-ui
```

## Local development with npm link

```bash
cd dist/my-shared-ui
npm link
cd ../../projects/demo-app
npm link my-shared-ui
```

## Blog post

https://omid.dev/2024/05/12/reusable-shared-module-in-angular/
