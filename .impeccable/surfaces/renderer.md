---
version: 1
slug: "renderer"
primary_target: "layouts/course.vue"
related_targets: ["styles.css", "components/SlideContent.vue", "components/ImageAndBullets.vue", "components/ImageGallery.vue", "components/CourseCallout.vue", "components/EpisodeOverviewLink.vue", "global-top.vue", "examples/slides.md"]
---

# Shared presentation renderer

Mode: Read. Course authors supply teaching content; viewers read and navigate the resulting presentations. [PRODUCT.md](../../PRODUCT.md) records the reusable product scope. [DESIGN.md](../../DESIGN.md) owns the existing visual identity, and [authoring](../../docs/authoring.md) owns renderer syntax.

## Maintenance constraints

- Preserve the current typography, layout geometry, artwork, content order, stage counting, and interaction unless the user requests a visual change.
- Keep reusable layouts, styles, parsing, and build tooling here. Course-specific diagrams, educational rules, deployment origins, overview routes, slide counts, and photograph selections remain course-owned.
- Use the generic example deck and tests to verify shared behavior. Consuming courses retain their own approved reference images and integration checks; do not replace those references during an unrelated renderer change.
- Read `.impeccable/design.json` beside the canonical DESIGN.md. After changing design guidance, run `npm run design:sync` and `npm run design:check` to refresh and verify its narrative metadata.
- A course consumes an installed release. Change the editable renderer source here, distribute a new package version, and deliberately upgrade each course. Installed `node_modules` files are not authoring targets.
- Course-level Impeccable context is generated from the pinned package and editable local policy. Verify synchronization after a package upgrade without copying course rules back into this renderer.
