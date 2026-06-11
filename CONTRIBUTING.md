# Contributing

Thanks for helping keep these companion examples useful for readers of [omid.dev](https://omid.dev).

## Scope

This repository is a collection of small, self-contained projects under `examples/` and `labs/`. Each folder should stay focused on the article or lab it supports and should be understandable without a shared root build system.

Good contributions include:

- Fixing examples that no longer install, build, or match the linked article.
- Updating dependencies when the change keeps the example easy to follow.
- Improving local setup instructions.
- Adding a new example under `examples/<slug>/` for a post that needs runnable source code.

## Local Setup

Use Node.js 20 for JavaScript and Angular examples:

```bash
nvm use
```

Then install and run commands from the example folder you are changing:

```bash
cd examples/angular-web-audio-visualizer
npm install
npm start
```

Some examples need extra tools or services, such as Angular CLI, Rust, `wasm-pack`, Python, `uv`, or Firebase. Check the local `README.md` before running commands.

## Before Opening a Pull Request

- Run the install, build, test, or start commands that apply to the example you changed.
- Update the example's local `README.md` when setup steps, ports, environment variables, or behavior change.
- Update the root `README.md` when adding, removing, renaming, or reclassifying an example.
- Do not commit generated output such as `node_modules/`, `dist/`, `.angular/`, Rust `target/`, local virtual environments, or notebook caches.
- Document required secrets or local configuration with placeholder values or `.env.example`; do not commit real credentials.

## Continuous Integration

Playground deploy runs via GitHub Actions when changes land under `examples/`, `labs/`, or `playground/`. See [`.github/workflows/playground-deploy.yml`](.github/workflows/playground-deploy.yml).

Individual examples outside the live playground set are not built in CI. Run install and build checks locally for the example you changed before opening a pull request.

## License

By contributing, you agree that your contribution will be licensed under the repository's MIT License.
