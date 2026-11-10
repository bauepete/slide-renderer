# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Course authors and teachers create and maintain Slidev presentations. Viewers use the resulting web or offline presentations; each consuming course defines its own audience and educational objectives.

## Product Purpose

Provide a reusable presentation renderer, complete visual system, Markdown authoring conventions, and build tooling that can serve multiple courses without embedding their content or publication policy.

## Operating Context

Courses install a pinned `slidev-addon-renderer` package. Authors preview Slidev sources and build either a static web presentation or a portable standalone HTML file. Course configuration supplies shared content assets and published presentation-to-overview destinations.

## Capabilities and Constraints

The package supplies layouts, typography and styling, measured columns, galleries, callouts, stage numbering, and an accessible overview control. Keep its visual style with the renderer. Preserve existing appearance and interaction during maintenance; keep course notes, teaching assets, approval decisions, and publication operations in consuming courses.

## Brand Commitments

Preserve the established calm, minimal presentation identity and supplied template artwork. [DESIGN.md](DESIGN.md) defines its visual specifications. Course-specific title information and photograph-selection policies belong to the consuming course.

## Evidence on Hand

- [Design specification](DESIGN.md) and [visual metadata](.impeccable/design.json).
- [Template sources and references](assets/SlideLayoutTemplate/README.md).
- [Authoring reference](docs/authoring.md), [example deck](examples/slides.md), and regression tests in `tests/`.

## Product Principles

1. Keep one editable source of shared visual guidance in this repository.
2. Make course integration explicit, configurable, and reproducible.
3. Preserve editable teaching content and accessible presentation controls.
4. Keep package upgrades and course publication separate decisions.
