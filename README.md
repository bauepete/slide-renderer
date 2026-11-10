# Slide renderer

A reusable Slidev addon with the complete presentation style, Markdown rendering, measured columns, image galleries, callouts, stage counter, and accessible overview control. Courses own educational content and publication policy.

## Install in a course

Install an exact release archive or pinned Git commit as a dev dependency, commit package.json and package-lock.json, and use npm ci for reproducible reinstalls. A sibling renderer source checkout is not needed to build the course.

```sh
npm install --save-dev --save-exact ./vendor/slidev-addon-renderer-1.0.1.tgz
```

The package declares compatible Slidev/Vue peers. Keep their resolved versions in the consuming course lockfile. Enable the addon by package name at any deck depth:

```yaml
addons:
  - slidev-addon-renderer
canvasWidth: 1920
aspectRatio: 16/9
routerMode: hash
fonts:
  provider: none
defaults:
  layout: course
  clicks: 0
layout: course
slideType: Title
```

See [authoring](docs/authoring.md), [design](DESIGN.md), and [example deck](examples/slides.md). Logos and paper background remain part of this package's visual identity. Their artwork is unchanged by extraction.

## Course configuration

Put slide-renderer.config.json at the course package root. Lookup starts at the deck and stops at the nearest package.json. Configuration is optional: without it there is no shared asset mapping or overview link.

```json
{
  "schema": 1,
  "assetsRoot": "Images",
  "assetsPrefix": "/Assets/",
  "site": {
    "origin": "https://slides.example.org",
    "basePath": "/course/",
    "presentations": {
      "Chapters/intro/dist/intro.html": "Chapters/intro/",
      "Chapters/intro/dist/web/index.html": "Chapters/intro/"
    }
  }
}
```

Paths in presentations are exact, relative to basePath. They map published entry files to overview paths. No course naming convention is built into the renderer. Query strings and slide fragments do not affect the destination. The HTTPS origin and base path must match exactly. Local files/previews, print/export, presenter, and embedded views omit the link; normal fullscreen retains it. Omit site to disable the control.

assetsRoot is relative to this config file and serves shared content images during preview; assetsPrefix is the normalized Slidev URL prefix. Content stays in the course, while renderer assets resolve inside the installed package. Restart preview after configuration or parser changes.

## Commands

Run from the course root with its installed dependencies:

```sh
npx slidev Chapters/intro/slides.md
npx slide-renderer standalone Chapters/intro/slides.md --name intro.html
npx slide-renderer web Chapters/intro/slides.md --out dist/web --base /course/Chapters/intro/dist/web/
npm --prefix node_modules/slidev-addon-renderer test
```

Standalone output is dist/intro.html beside slides.md. It embeds assets and works offline, removes redundant embedded-image preloads, and omits Slidev's remote default favicon. Web output is a directory containing an HTML entry and separate hashed assets; explicit image ?inline imports are externalized in this mode. Web builds remove whole-deck HTML image preloads. They do not automatically share a single JavaScript runtime between independently built decks. Publish every required output file together; use course-controlled manifests for publication. Existing standalone publication helpers do not become web publishers automatically.

Both builders remove presenter notes and use hash routing so direct slide links work on static hosting and local files without server rewrites. The exported tooling/build.mjs API includes buildPreview(presentationDirectoryURL, filename) for thin course wrappers and buildWeb(entryPath, options). Source moves and a package install alone do not improve a currently deployed standalone presentation.

## Developing and releasing

Install dependencies in this repository with npm install, then npm test. Check representative layouts visually and run consuming course integration tests before upgrading a course. Course-specific content assertions belong in the course; generic tests and fixtures belong here. Do not replace course visual references as a side effect of a renderer release.

Create an archive using npm pack --ignore-scripts --pack-destination <course>/vendor. Increment the package version for each distributed release. In the course, explicitly install that archive and review its lockfile and rendered output. Archive integrity plus installed renderer content is included in SYPPRE publication fingerprints. A remote registry is optional; once a repository exists remotely, a Git dependency pinned to its exact commit is also supported. No remote is assumed here.

The package includes source Vue/TypeScript: Slidev compiles it in the consuming build. Keep generated output, node_modules, review captures, and local archives out of this repository. [Asset provenance](assets/README.md) documents the original exit icon; template and logo artwork is retained from the existing shared renderer.

## Impeccable metadata

[PRODUCT.md](PRODUCT.md) describes the reusable web renderer. [.impeccable/surfaces/renderer.md](.impeccable/surfaces/renderer.md) maps editable renderer sources. DESIGN.md is the canonical visual specification; run `npm run design:sync` after changing its prose and `npm run design:check` to verify the sidecar's narrative rules. Curated specimens and token metadata remain in .impeccable/design.json. Educational rules and course-specific image selection belong to the consuming course.

A consuming course can generate a local Impeccable view without maintaining duplicate specifications:

```js
import { syncCourseDesignContext } from 'slidev-addon-renderer/tooling/design-context.mjs'
syncCourseDesignContext({ courseRoot: process.cwd(), policyPath: 'docs/presentation-policy.md' })
```

Use `{ check: true }` to detect stale context without writing. The helper writes the course's root DESIGN.md and .impeccable/design.json, retaining renderer tokens/specimens, rebasing local references into the installed package, and adding local policy. Wire it into the course postinstall lifecycle and verification commands; installation with --ignore-scripts requires explicit synchronization afterward. Keep generated views tracked and clearly marked; edit their source documents instead. The helper never rebuilds slides, changes history, or publishes material.
