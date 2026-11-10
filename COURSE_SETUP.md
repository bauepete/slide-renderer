# Prepare a course for Slide renderer

This is the entry point for an agent asked to prepare another course to use [slide-renderer](https://github.com/bauepete/slide-renderer), including a course whose existing presentations are Keynote and PDF files. Work in the consuming course. The renderer supplies the shared visual system; the course supplies its content and workflow.

Preparation finishes with a verified toolchain, an inventory of the originals, and a plan for the first unit. Converting the actual unit is a subsequent step unless the user requested it together with setup. Package installation does not authorize publication, commits, or pushes.

Follow this procedure in order. Record decisions and verification results in the course, for example `docs/slide-conversion.md`. Adapt the example paths to the course's existing structure.

## 1. Inspect the course and establish scope

Read the course's applicable agent instructions, preparation guides, and approval/publication workflow. Inspect its package manifests, build scripts, existing authoring sources, design documents, and published-material boundaries before changing files.

Establish from existing evidence or the user's instructions:

- The course audience, unit order, first unit to convert, and locations of its originals.
- Which content is already approved, and how proposed educational changes are handled.
- The intended adoption of this renderer's current style, including its supplied background and school logos.
- Where editable sources, shared teaching assets, generated output, and published copies belong.

Resolve routine installation choices using this guide. Ask only for material information that is missing or conflicting, such as an unidentified first unit or a requirement for different branding. Record unresolved hosting details without inventing a deployment URL.

Preserve existing course instructions and tools. Reconcile any current PRODUCT.md, DESIGN.md, `.impeccable/design.json`, and lifecycle scripts before installing the generated design view in step 5. Existing course rules must be retained in an editable policy file rather than lost when generated files replace them.

Course naming, teacher-note formats, approvals, and publication conventions remain course decisions. This guide has no dependency on a SYPPRE checkout or its skills, episode structure, or educational policies.

## 2. Inventory the Keynote and PDF originals

Keep the originals unchanged. Reuse their current locations where practical; separate extracted assets and future editable slide sources from them.

Create a source inventory with at least:

| Field | Record |
| --- | --- |
| Unit | Existing title and position in the course |
| Keynote source | Exact local path and whether it can be inspected with available tools |
| PDF reference | Exact local path, page count, and which source/export it represents |
| Content and artwork | Text, figures, screenshots, diagrams, credits, and reusable source assets |
| Reveal evidence | Known build stages, animation order, speaker notes, and export limitations |
| Uncertainty | Missing files, conflicting versions, unclear sequence, or inaccessible objects |

Inspect both formats using available local tools. Keynote can provide editable objects, notes, and build information; the PDF provides visible exported states. Do not infer every animation from a static PDF or assume that each PDF page is a separate authored slide. Record which states the export actually contains.

Preserve student-facing wording, hierarchy, content order, and visual meaning during conversion. The renderer supplies the new presentation style; the old export remains evidence for content and source-specific visuals. Course rules determine which notes are teacher-only and must stay out of student-facing sources.

## 3. Install a pinned renderer

Use Node.js satisfying the selected renderer's [engine requirements](package.json). The current package requires Node.js 22.12.0 or newer. Use a local course installation of Node dependencies, not globally installed renderer tools.

If the course has no package.json, initialize one with `npm init -y`. Otherwise merge changes into its existing manifest and lockfile.

Choose an exact renderer revision. Record its full Git commit SHA, package version, installation method, and resolved dependency versions in the course setup record. Do not infer that a matching registry package or version tag exists.

### Install directly from Git

After selecting a full commit SHA from the repository, substitute it in the quoted dependency below. The placeholder must be replaced before running the command:

```sh
npm install --save-dev --save-exact \
  'git+https://github.com/bauepete/slide-renderer.git#<FULL_COMMIT_SHA>'
```

Inspect package.json at that selected revision for its peer requirements. The tested tool versions for renderer 1.0.1 are:

```sh
npm install --save-dev --save-exact \
  @slidev/cli@52.20.1 @slidev/theme-default@0.25.0 vue@3.5.44
```

Use requirements appropriate to the revision actually chosen. npm can install peers automatically; explicit declarations make the course toolchain easier to inspect. Retain the resulting package.json and package-lock.json changes for review. Subsequent reproducible installations use `npm ci`.

### Install a release archive

Alternatively, obtain an archive from a trusted renderer release or create it from the chosen source revision using `npm pack --ignore-scripts`. Preserve that revision's identity in the setup record. Place the archive in the course's chosen dependency-artifact directory, for example `vendor/`, then install its actual filename:

```sh
npm install --save-dev --save-exact ./vendor/slidev-addon-renderer-1.0.1.tgz
```

An archive at that example path is not supplied by a new course automatically. For an archive-based course, keep the archive with its manifest and lockfile so another checkout can install it. Course builds must not depend on an unversioned sibling renderer checkout or edits inside node_modules.

Verify the local installation:

```sh
npm ls slidev-addon-renderer @slidev/cli @slidev/theme-default vue
npx --no-install slidev --version
```

Do not upgrade an existing course's unrelated dependencies as part of renderer setup.

## 4. Configure sources, assets, and output

Preserve the course's existing directory conventions. A possible arrangement is:

```text
course/
  Assets/                         shared teaching images
  Units/<unit>/
    slides.md                     future editable presentation
    assets/                       unit-specific visuals
    dist/                         generated output
  docs/presentation-policy.md     editable course rules
  docs/slide-conversion.md         source inventory and conversion plan
  scripts/sync-design-context.mjs
  slide-renderer.config.json
  package.json
  package-lock.json
```

Create only the directories needed for preparation. Ignore node_modules, generated dist directories, and temporary review output according to the course's conventions. Preserve any existing deliberately tracked student-publication output.

### Enable the addon

Use this headmatter for a technical test deck, adapting the title later for actual course material:

```yaml
---
theme: default
addons:
  - slidev-addon-renderer
favicon: "data:,"
canvasWidth: 1920
aspectRatio: 16/9
routerMode: hash
fonts:
  provider: none
  sans: "Gill Sans, Gill Sans MT, Calibri, sans-serif"
defaults:
  layout: course
  clicks: 0
layout: course
slideType: Title
---
```

The installed addon name works at any deck depth. Read [the authoring reference](docs/authoring.md) for content syntax and supported types. Unit-local components and CSS belong to subject-specific visuals; shared rendering changes belong in the renderer project.

### Shared content assets and overview destinations

Course configuration is optional. Lookup starts at the deck directory and stops at the nearest package.json; put `slide-renderer.config.json` at the course package root. Avoid introducing nested package.json files that unintentionally hide it.

For a shared `Assets/` directory without hosting details:

```json
{
  "schema": 1,
  "assetsRoot": "Assets",
  "assetsPrefix": "/Assets/"
}
```

assetsRoot is relative to this configuration file. assetsPrefix is the normalized URL prefix used for those shared images during Slidev preview; check actual requests when adapting an existing asset layout. Keep Markdown image paths relative to their deck. Renderer-owned artwork remains in the installed package.

Once real hosting paths are established, add site configuration. The following URLs are examples to replace, not a proposed deployment:

```json
{
  "schema": 1,
  "assetsRoot": "Assets",
  "assetsPrefix": "/Assets/",
  "site": {
    "origin": "https://slides.example.org",
    "basePath": "/course/",
    "presentations": {
      "Units/FirstUnit/dist/first-unit.html": "Units/FirstUnit/",
      "Units/FirstUnit/dist/web/index.html": "Units/FirstUnit/"
    }
  }
}
```

origin is an exact HTTPS origin without a trailing slash; basePath starts and ends with `/`. Presentation and overview paths are relative to basePath. Each exact published entry maps to its intended overview; query strings and slide fragments do not change the destination. No unit naming convention is built into the renderer.

Omitting site leaves the overview control disabled. With a site mapping, the control remains absent in local files/previews, print/export, presenter, and embedded views; normal fullscreen viewing on a configured published entry retains it. Restart preview after changing configuration or parser setup.

### Preview and build commands

Merge useful commands into the course's npm scripts without replacing existing lifecycle behavior:

```json
{
  "scripts": {
    "slides:dev": "slidev",
    "slides:web": "slide-renderer web",
    "slides:standalone": "slide-renderer standalone"
  }
}
```

Use them from the course root:

```sh
npm run slides:dev -- Units/FirstUnit/slides.md
npm run slides:web -- Units/FirstUnit/slides.md --out dist/web --base /course/Units/FirstUnit/dist/web/
npm run slides:standalone -- Units/FirstUnit/slides.md --name first-unit.html
```

Substitute actual paths and the actual published base for production web builds. Relative `--base ./` is suitable for a local web smoke test. Output paths are resolved relative to the deck directory.

Web output contains an HTML entry, external hashed assets, and split JavaScript. Publish the whole required output set together. Independently built decks do not automatically share one JavaScript runtime. Standalone output is one HTML file under the deck's dist directory; its source must be named slides.md. Both builders remove presenter notes and use hash routing.

Choose the intended formats with the course's existing distribution needs. The package builds files; the course owns its publication/copy/deployment mechanism. A publisher that currently copies one standalone file needs adaptation before it can publish a web directory correctly.

## 5. Prepare course and Impeccable context

Follow the course's existing agent instructions and integrate with its current design tooling. The renderer's [PRODUCT.md](PRODUCT.md) describes a reusable tool for authors; the consuming course needs its own product context describing its actual audience and educational purpose.

Keep course-specific presentation rules in an editable file such as `docs/presentation-policy.md`. Start with established course rules only. A minimal structure is:

```md
# Presentation policy

## Content authority

Follow this course's existing approved sources and development workflow.

## Course-specific rules

Record established course requirements here as they are identified.
```

Before generating context, preserve or migrate useful course-specific content from any existing DESIGN.md and `.impeccable/design.json`. The synchronization helper writes those two output files. Reconcile conflicts with the user when the original request does not establish which design authority to retain.

Create `scripts/sync-design-context.mjs`:

```js
import { fileURLToPath } from 'node:url'
import { syncCourseDesignContext } from 'slidev-addon-renderer/tooling/design-context.mjs'

try {
  const changed = syncCourseDesignContext({
    courseRoot: fileURLToPath(new URL('../', import.meta.url)),
    policyPath: 'docs/presentation-policy.md',
    check: process.argv.includes('--check'),
  })
  console.log(`Design context is current; ${changed.length} files changed.`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
```

Merge these scripts into package.json:

```json
{
  "scripts": {
    "design:sync": "node scripts/sync-design-context.mjs",
    "design:check": "node scripts/sync-design-context.mjs --check",
    "postinstall": "npm run design:sync"
  }
}
```

If postinstall already exists, preserve its behavior and add synchronization to the existing sequence. Configure the lifecycle after the wrapper and policy file exist. Installations with --ignore-scripts require explicit synchronization afterward.

```sh
npm run design:sync
npm run design:check
```

Keep the generated root DESIGN.md and `.impeccable/design.json` tracked and marked as generated. Edit renderer guidance in the renderer project and course rules in the policy file, then regenerate. The helper preserves renderer tokens/specimens, rebases links, and records the pinned renderer version and source hashes. `design:check` detects drift without writing.

Update the course's agent instructions to run design:check before design work, regenerate stale context, and read the combined DESIGN.md in full when Impeccable requests it. Where Impeccable is used, verify that its context command resolves the course product, web platform, complete design file, and intended course surface. The renderer's own AGENTS.md and surface brief are for renderer maintenance and do not replace course instructions.

Course surface briefs map actual editable course files. Record current constraints and derive slide/stage counts from the course sources. Treat installed renderer files as dependencies, and retain historical evidence as history.

## 6. Verify readiness with a technical example

Use a small disposable deck in an ignored setup/review directory. It is a toolchain check, separate from the first unit. Include a Title slide, content columns, one local image, and a click reveal using supported syntax. Check shared asset resolution too if the course uses shared assets.

1. Start the local Slidev preview. Inspect the technical example, image loading, text wrapping, and forward/backward navigation. Verify the intended fonts are available; fallback fonts can change measurements. Check at the renderer's 1920 × 1080 canvas and inspect a narrower viewport.
2. Build the requested output formats with the installed CLI. For web output, serve the generated directory over local HTTP before browser review. For standalone output, open the generated HTML as a local file and verify its assets work offline.
3. Check there are no unintended missing asset requests, clipping, overlaps, or incorrect click/stage counts. Confirm the overview control is absent locally. If hosted behavior is in scope and available, check its configured destination separately.
4. Run design:check and the course's relevant existing checks. The renderer tests can also be run with `npm --prefix node_modules/slidev-addon-renderer test`; optional output checks identify the environment variables needed to exercise built artifacts.
5. Record commands, versions, results, and any environment restrictions. A successful build alone does not establish visual correctness. When browser/HTTP access is blocked, identify the missing verification explicitly rather than claiming it passed.

Avoid adding a permanent content test suite merely to demonstrate installation. Keep reusable renderer tests in the package and genuine course-content checks with the course.

## 7. Plan the first unit and report completion

Inspect the first unit sufficiently to produce a conversion plan, using the [capability table](docs/authoring.md#renderer-capabilities). Record its authored slides, known reveal stages, source visuals, candidate supported layouts, and uncertainties. Keep source content, hierarchy, and order intact; flag proposed educational changes separately under the course's workflow.

Some visual types described in DESIGN.md are not implemented; the capability table owns support status. Record unsupported layouts, diagrams needing editable reconstruction, and ambiguous animations as decisions to resolve before converting those parts. A generic fallback is not evidence that a requested layout is supported. Do not replace whole slides with screenshots to bypass reconstruction.

The readiness report should identify:

- The pinned renderer revision, dependency versions, and installation/reinstallation method.
- The files and scripts prepared, their ownership, and the exact preview/build/context-check commands.
- The Keynote/PDF inventory, first-unit source pair, proposed mapping, and unresolved conversion decisions.
- Checks that passed, checks blocked by the environment, and any user action needed before conversion can begin.
- Confirmation that originals and teaching content remain unchanged and that nothing was published, committed, or pushed unless explicitly requested.

Declare preparation ready when the required setup and verification are complete and the first unit's next step is clear. If a material prerequisite is blocked, report that specific blocker and the completed work. Stop before actual unit conversion when the request was preparation only.
