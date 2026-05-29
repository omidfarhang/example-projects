# Angular Custom Schematics

Companion project for [Building Custom Angular Schematics](https://omid.dev/2024/06/03/building-custom-angular-schematics-automating-code-generation/).

## Install

```bash
npm install
```

## Dry run against a demo Angular app

From an Angular workspace root:

```bash
npx @angular-devkit/schematics-cli ../angular-custom-schematics:feature dashboard --dry-run
```

Or with an absolute path to this collection:

```bash
npx schematics /path/to/example-projects/angular-custom-schematics:feature reports --path=src/app
```

## Blog post

https://omid.dev/2024/06/03/building-custom-angular-schematics-automating-code-generation/
