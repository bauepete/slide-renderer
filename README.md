# Slide renderer

A reusable Slidev addon providing presentation layouts, styling, Markdown rendering, measured columns, image galleries, callouts, stage numbering, and an accessible overview control. Courses own their teaching content, assets, approval workflow, and publication decisions.

**Preparing another course, including existing Keynote/PDF presentations? Start with [COURSE_SETUP.md](COURSE_SETUP.md).** It defines installation, source-material intake, configuration, agent context, verification, and when preparation is complete. Agents receiving only this repository URL should follow that guide before modifying a consuming course.

**Changing the renderer itself? Read [AGENTS.md](AGENTS.md)** and the maintainer instructions below.

## Use in a course

Install a pinned renderer revision following [course setup](COURSE_SETUP.md#3-install-a-pinned-renderer), then enable `slidev-addon-renderer` in the deck. After completing setup, run from the course root:

```sh
npx --no-install slidev Units/FirstUnit/slides.md
npx --no-install slide-renderer web Units/FirstUnit/slides.md --out dist/web
npx --no-install slide-renderer standalone Units/FirstUnit/slides.md --name first-unit.html
```

Substitute the course's actual presentation path. Web output has separate hashed assets and split JavaScript; standalone output is a portable HTML file. The current visual identity includes the supplied paper background and school logos. Reusing this package adopts that identity.

## References

| Reference | Owns |
| --- | --- |
| [Course setup](COURSE_SETUP.md) | Preparing a course, installation, configuration, legacy-source intake, Impeccable integration, and readiness checks |
| [Authoring](docs/authoring.md) | Markdown syntax, supported slide types, columns, images, callouts, and click stages |
| [Design specification](DESIGN.md) | Typography, colors, geometry, artwork, motion, and viewer controls |
| [Example deck](examples/slides.md) | A small renderer authoring example |
| [Product](PRODUCT.md) | The reusable renderer's purpose and boundaries |
| [Asset provenance](assets/README.md) | Exit-icon provenance and related asset guidance |

## Maintain the renderer

Install the locked development dependencies with `npm ci`, then run:

```sh
npm test
npm run design:check
```

DESIGN.md is the canonical visual specification. After changing its prose, run `npm run design:sync` to refresh narrative rules in `.impeccable/design.json`; curated specimens and token metadata remain in that sidecar. [PRODUCT.md](PRODUCT.md) and the [renderer surface brief](.impeccable/surfaces/renderer.md) provide maintainer context.

Verify representative layouts and affected consuming courses before distributing a new renderer release. Course-specific content assertions and approved reference captures stay with their courses. Installed dependency files are not authoring targets.

For an authorized release, increment the package version, validate it, and create an archive with `npm pack --ignore-scripts --pack-destination <output-directory>`. Courses deliberately adopt an exact archive or Git revision using [the setup procedure](COURSE_SETUP.md#3-install-a-pinned-renderer). Registry publication is optional. Vue/TypeScript sources are distributed directly and compiled by Slidev in each consuming build.

Keep generated output, dependency installations, review captures, and local archives ignored in this repository. Committing, pushing, publishing packages, and deploying require their own authorization.
