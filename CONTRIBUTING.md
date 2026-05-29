# Contributing

Thanks for helping keep these companion examples useful for readers of [omid.dev](https://omid.dev).

## Scope

This repository is a collection of small, self-contained projects. Each top-level folder should stay focused on the article it supports and should be understandable without a shared root build system.

Good contributions include:

- Fixing examples that no longer install, build, or match the linked article.
- Updating dependencies when the change keeps the example easy to follow.
- Improving local setup instructions.
- Adding a new top-level example for a post that needs runnable source code.

## Local Setup

Use Node.js 20 for JavaScript and Angular examples:

```bash
nvm use
```

Then install and run commands from the example folder you are changing:

```bash
cd angular-web-audio-visualizer
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

This repository does not currently require a root CI workflow because each example has its own toolchain and setup cost. A lightweight GitHub Actions smoke workflow can be added later if examples start breaking often or if pull requests become frequent.

A useful first CI step would be to run install and build checks only for examples changed in a pull request, rather than trying to build every project on every change.

## License

By contributing, you agree that your contribution will be licensed under the repository's MIT License.
