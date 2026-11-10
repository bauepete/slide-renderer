# Slide renderer

This repository owns reusable Slidev layouts, style, renderer assets, parsing, preview/build tooling, and generic tests/documentation. Keep course content, educational policy, publication decisions, and deployment destinations in consuming courses.

Preserve existing visual behavior during technical refactors. DESIGN.md defines appearance; docs/authoring.md defines source syntax. Test the installed package in a course as well as its units. Do not commit, push, publish a package, or deploy without an explicit request.

Keep generated dist/, node_modules/, review output, and npm archives ignored. Configuration and examples must work without a particular course repository or sibling checkout. Web builds use external assets; standalone builds remain portable.
