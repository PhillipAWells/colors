# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

`@pawells/colors` is a shared TypeScript color space management and conversion library published to npm. It targets ES2022, is distributed as ESM, and has no runtime dependencies. The library exports from a single entry point (`src/index.ts`).

## Package Manager

Project uses **Yarn Berry** (`yarn@4.12.0`) managed via corepack. Before working:

```bash
corepack enable       # Enable corepack to use the pinned yarn version
```

Configuration is in `.yarnrc.yml`. All dependencies are managed through Yarn:

```bash
yarn install          # Install dependencies with lockfile validation
yarn add <package>    # Add a package
yarn remove <package> # Remove a package
```

## Commands

```bash
yarn build            # Compile TypeScript → ./build/
yarn dev              # Build and run (tsc && node build/index.js)
yarn watch            # TypeScript watch mode
yarn typecheck        # Type check without emitting
yarn lint             # ESLint src/
yarn lint:fix         # ESLint with auto-fix
yarn test             # Run Vitest tests
yarn test:ui          # Open interactive Vitest UI in a browser
yarn test:coverage    # Run tests with coverage report (80% threshold)
yarn start            # Run built output
```

To run a single test file: `yarn vitest run src/path/to/file.spec.ts`

## Architecture

All source lives under `src/` and is compiled to `./build/` by `tsc`.

**Entry point** (`src/index.ts`): The single public export surface for the library. Exports `Colors`, `ColorSpaces`, and `ColorError`.

### Module directories

Each domain has its own directory under `src/`:

| Directory | Contents |
|-----------|----------|
| `src/color-spaces/` | All color space class implementations, base `ColorSpace` class, `ColorSpaceManager` registry, and `_exports.ts` barrel |
| `src/colors.ts` | `Colors` utility class with `Scale()` and `W3C` color constants |
| `src/w3c.ts` | Pre-instantiated RGB instances for all ~150 W3C/CSS named colors |
| `src/error.ts` | `ColorError` custom error class |

### Color space conventions

- Every color space class lives in `src/color-spaces/<name>.ts` and is registered via the `@ColorSpaceManager.Register(...)` decorator.
- All color space classes extend the `ColorSpace` base class from `src/color-spaces/_color-space.ts`.
- The `ColorSpaceManager` (in `src/color-spaces/manager.ts`) uses a BFS algorithm to find conversion paths between any two registered color spaces.
- Component values use normalized ranges (e.g. RGB uses 0–1 float, not 0–255).

## Key Patterns

**Adding a new color space**: Create `src/color-spaces/<name>.ts` extending `ColorSpace`, apply `@ColorSpaceManager.Register({...})` decorator, add at least one `From*()` static method for an existing color space, add a `To*()` method called by connected spaces, then export from `src/color-spaces/_exports.ts`.

**Converting between color spaces**: Use `instance.Convert(TargetClass)`. The manager automatically finds the shortest conversion path. Direct conversions are preferred; multi-hop conversions go through XYZ or Lab as intermediaries.

**No runtime dependencies**: Keep `dependencies` empty. All tooling belongs in `devDependencies`.

**ESM only**: The package is `"type": "module"`. Use ESM import/export syntax throughout; avoid CommonJS patterns. Internal imports must use `.js` extensions.

## TypeScript Configuration

Project uses a 4-config split:

- **`tsconfig.json`** — Base/development configuration used by Vitest and editors. Includes all source files for full type checking and IDE support.
- **`tsconfig.build.json`** — Production build configuration that extends `tsconfig.json`, explicitly excludes test files (`src/**/*.spec.ts`), and is used only by the build script.
- **`tsconfig.test.json`** — Vitest test configuration.
- **`tsconfig.eslint.json`** — ESLint type-aware linting configuration.

Build command: `tsc` (uses `tsconfig.build.json` by default)

General configuration: Requires Node.js >= 24.0.0. Outputs to `./build/`, targets ES2022, module resolution `bundler`. Declaration files (`.d.ts`) and source maps are emitted alongside JS. Strict mode is fully enabled (`strict`, `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`).

## CI/CD

Single workflow (`.github/workflows/ci.yml`) triggered on push to `main`, PRs to `main`, and `v*` tags:

- **All jobs**: Node pinned to 24, corepack enabled, `yarn install --immutable` for reproducible builds
- **Push to `main` / PR**: typecheck → lint → test → build
- **Push `v*` tag**: typecheck → lint → test → build → publish to npm (with provenance) → create GitHub Release

## Development Container

A custom `.devcontainer/Dockerfile` is provided with:

- Non-root dev user for security
- Pre-configured Node.js environment
- Post-creation hook (`.devcontainer/scripts/postCreate.sh`) to set up the development environment

Use `devcontainer open` or your IDE's container integration to develop in the containerized environment.
