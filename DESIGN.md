---
name: Slide Renderer Presentations
description: Calm, elegant, minimalistic teaching slides grounded in the course template.
colors:
  text: "#656565"
  background: "#eceff2"
typography:
  title:
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, sans-serif"
    fontSize: "100px"
    fontWeight: 300
  body:
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, sans-serif"
    fontSize: "52px"
    fontWeight: 300
  secondary:
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, sans-serif"
    fontSize: "38px"
    fontWeight: 300
  credit:
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, sans-serif"
    fontSize: "24px"
    fontWeight: 300
    lineHeight: 1.2
---

# Design System: Slide Renderer Presentations

## Overview

**Creative North Star: "Zen-like teaching slides"**

The agreed direction is calm, elegant, and minimalistic. Clear hierarchy, precise alignment, consistent spacing, and purposeful visuals support understanding. The existing template defines the visual identity; this document is the visual specification for Slidev and Impeccable.

**Key Characteristics:**

- Calm hierarchy and readable typography.
- Balanced composition with purposeful whitespace.
- Restrained visuals and explanatory animation.
- Consistent template identity across presentations.

The consuming course records its audience, educational content, and approval workflow. [Authoring](docs/authoring.md) documents renderer syntax. Visual rules are maintained here.

## Colors

Use the neutral gray text and pale cool gray background tokens above. Apply the supplied soft-gradient background from `assets/SlideLayoutTemplate/template-paper.jpg`. Authored text and graphics remain neutral, with the semantic callouts below as the explicit exception. Retain the supplied logo artwork. Choose relevant imagery to support the explanation.

## Typography

Use Gill Sans Light with the configured fallback stack. Keep one typeface and light weight throughout, without bold emphasis. Create hierarchy through size and position.

Display URLs and domain names without surrounding angle brackets, using the typography of the surrounding text or source credit.

The frontmatter tokens are reference sizes for common roles. Apply the variants and permitted ranges below, using larger text where appropriate. Never shrink content below its required size to make it fit.

| Element | Font size | Treatment |
| --- | --- | --- |
| Slide title | 94–100 px | Uppercase; placement per slide type below |
| Bullets and body text | 52–64 px | Default range; apply the slide type's specific sizes below; never below 52 px |
| Subtitle, quotation | About 52 px | Centered |
| Attribution, secondary line | About 38 px | Smallest text allowed, apart from credits |
| Gallery source credit | 24 px | Gill Sans Light, neutral gray, centered, line height 1.2; source information only |

Slide-type specifications take precedence over general typography and sparse-content advice. Both General content variants start at 64 px with 52 px nested bullets and a measured 52 px body fallback; Image-and-bullets uses 52 px. The general suggestion to enlarge sparse content up to 72 px applies only where the selected layout has no more specific size rule. It does not change these renderer sizes. Gallery captions remain 52 px; the 24 px credit role is reserved for source information, with quotation attributions and other secondary lines retaining their own sizes.

## Layout

Follow `assets/SlideLayoutTemplate/SlideLayoutTemplate.pdf` (also available as `assets/SlideLayoutTemplate/SlideLayoutTemplate.key`) as the design reference. Individual layouts are also available as numbered PNGs in [SlideLayoutTemplate](assets/SlideLayoutTemplate/). All measurements use design-canvas pixels; Slidev scales the configured canvas uniformly to the display. Override theme typography, padding, spacing, colors, and layouts to match this specification. Do not use `zoom` or element transforms to shrink text below the required sizes.

The general guidance below applies where a slide type has no more specific rule. The General content layouts and Image-and-bullets use 32 px gaps between top-level content units and 20 px within nested groups. Those fixed gaps override the approximate empty-line spacing and sparse-content spacing advice; center the complete content group instead of stretching its gaps.

- Side margins are about 57 px (3 %). Text blocks span nearly the full width; bullets start at x ≈ 57. A second column starts at x ≈ 1000–1060.
- Titles are centered horizontally; bullets are left-aligned within their columns. Quotations and section headings are centered horizontally and vertically.
- For bullet compositions without a more specific spacing rule, use line spacing of 1.1–1.3 × the font size and about one empty line between bullets, giving an approximate pitch of 2 × the font size.
- On content slides, reserve a content region covering at least 40 % of the slide area, spanning at least 85 % of its width, and extending to y ≈ 800 or below. These measurements describe the available layout region, not the bounding box of visible letters. Short content may leave purposeful whitespace. Do not stretch bullet spacing or push text toward the outer edges to satisfy a visible-ink target. Image-and-bullets compositions reserve at least 60 %; Title, Section, Quotation, and Image slides are exempt.
- Center content or spread it across columns; do not leave it hugging one corner. Where the selected slide type permits it, sparse content may use text up to 72 px or increased spacing. Adding a relevant image follows the approved outline.
- If content overflows (roughly more than 6 bullets per column or bullets longer than 10 words at the minimum body size), retain the required font sizes and resolve content changes through the consuming course's approval workflow.

Purposeful whitespace supports balance and readability within these rules. Minimalism does not justify small text stranded in a corner.

## Elevation & Depth

Keep the composition visually quiet. The template's soft background provides atmosphere; avoid added decorative shadows, raised panels, or depth effects.

## Shapes

Use simple, editable diagrams where appropriate. Shapes and connectors must explain the subject. Do not add decorative divider rules, borders, cards, boxes, or underlines. Semantic callouts follow the supplied speech-bubble and box reference below.

### Speech bubbles and boxes

[08-speech-bubble-and-box.png](assets/SlideLayoutTemplate/08-speech-bubble-and-box.png) extends the template with semantic callout shapes; it is an additional component reference, not a new slide type. Render shapes as editable geometry and keep their text editable.

- Speech bubble: a filled 450 × 176 px oval with a downward-left tail, total height 212 px. Center white 52 px Gill Sans Light text inside the oval, clear of its edges and tail.
- Box: a filled 490 × 347 px rectangle with 34 px corner radius and centered white 52 px Gill Sans Light text.
- Template fills, sampled from the supplied PNG: `gray` = `#818785`, `red` = `#9d2916`, `amber` = `#d09a3b`. Use these colors only for meaningful callouts, without borders or shadows.
- In Image-and-bullets, place a callout beneath the left bullet list with the normal 32 px gap. Center the complete list-and-callout group beside the image. Reserve the callout's space before it appears so revealing it does not move other content. Reveal or hide the complete shape and text together.
- On click reveal, a speech bubble pops from its tail tip: grow from 20 % to a brief 110 % overshoot in 209 ms, then settle through 98.5 % to full size over the next 291 ms (500 ms total). Animate the shape and text together, once per reveal. Going back hides it and resets the entrance. With reduced motion, reveal it immediately without scaling. A callout shown without a click wrapper stays still.

### Diagram connectors

- Stop connector strokes and arrowheads just short of object outlines, leaving a small, visible gap at both ends. Keep their entire paths clear of objects and labels.
- An arrow intended as an arch uses one smooth curve, without an appended straight segment or kink. Intentional elbow connectors remain appropriate where the diagram calls for them.
- Align arrowheads with the path's endpoint direction. Keep anchors and clearances consistent when a connection reverses direction or changes state.

## Components

### Opening title slide

The opening Title slide displays the presentation title and optional subtitle. Use the Title layout below, with the course-supplied title as the main heading. A wrapping Title heading grows upward from its usual lower edge, keeping the subtitle clear and retaining the 100 px type size.

### Slide types

Positions are approximate; title y values describe the top of the text unless identified as centers.

These are visual definitions. Check the [renderer capability table](docs/authoring.md#renderer-capabilities) for implementation support when drafting an outline.

| Type | Content and measurements |
| --- | --- |
| Title | Prominent subject image, centered at about 60 % of slide width, y ≈ 50–690; centered 100 px title at y ≈ 780; optional 52 px subtitle at y ≈ 895. |
| Image | One full-bleed image as the focus. |
| Section | One short 100 px heading centered horizontally and vertically, center y ≈ 540. |
| Bullet | Centered 100 px title at y ≈ 190 (y ≈ 140 for two lines); 64 px bullets in one or two columns spanning the width. Columns may be staggered vertically. |
| Image-and-bullets | Centered 100 px title at y ≈ 190 (y ≈ 140 for two lines); concise 52 px bullets from x ≈ 57, y ≈ 455; supporting image about 650 × 630 px at x ≈ 1060–1710, y ≈ 300–930. |
| Quotation | Short 52 px quotation with 38 px attribution beneath, both centered around y ≈ 470–680. |
| General content | Centered 94 px title at y ≈ 140; one content column below. Paragraphs and nested lists provide the content hierarchy. |
| General content two column | General content title treatment; two equal 853 px columns separated by 100 px, with natural line wrapping and left-aligned content. |
| General content columns | General content title treatment; N equal columns selected by `columns`, sharing the 1806 px content width with 100 px gaps. The existing two-column type retains its 853 px column widths. |

### Image-and-bullets layout

Use a centered 100 px heading at y ≈ 190 for one line, or y ≈ 140 when it wraps. The left bullet column is 903 px wide from x = 57. Its text is 52 px with the same natural list spacing as general content, vertically centered beside the supporting image. The image occupies a 650 × 630 px area from x = 1060, starting at y = 300 or at least 48 px below the heading, whichever is lower. Its lower boundary is y = 930; reduce its available height when the heading needs more clearance.

Show the complete image without cropping or distortion, centered in that area. Limit raster artwork to at most one canvas pixel per two source pixels; a smaller source produces a smaller displayed image. The overall available composition region spans x = 57–1863 and y = 300–1010, covering more than 60 % of the canvas. Keep all visible text and image content clear of the logos and counter. Report text that does not fit at 52 px rather than shrinking it.

### General content layout

The title spans the content width. The available content region begins at y ≈ 355, or below a wrapping title with a 48 px gap, and has a lower boundary at y = 950. Vertically center the complete content group within this region. For two columns, the tallest column controls the group's height, and both columns share the same top edge; keep text left-aligned within their fixed widths.

For `General content columns`, apply the same alignment to all N columns: the tallest controls the group's height and all columns share its top edge. Each column's width is `(1806 − 100 × (N − 1)) / N` design-canvas pixels. Keep the existing typography and spacing rules; additional columns do not authorize smaller text or narrower gaps. Report content that does not fit.

Top-level body text starts at 64 px; nested bullets use 52 px. If the measured composition does not fit, use the permitted 52 px body size across the content region and measure again. Never shrink below 52 px to fit content.

Use a consistent 32 px gap between top-level content units and 20 px within nested groups. Move short groups intact to balance the available space above and below them; do not vertically stretch bullet spacing or center the two columns independently. Dense groups naturally approach the region's upper boundary. Paragraphs take part in normal flow, and parent bullets remain visually grouped with their nested bullets.

Image galleries arrange panels in two rows, with a readable caption and source credit beneath.

### Logos

On every slide except the full-bleed image slide, place:

- `assets/HTLLogo_ab2022_farbig.png` upper-right, about 430 px wide, x ≈ 1450–1885, y ≈ 30–130.
- `assets/Abteilungslogos.png` lower-left, about 270 px wide, x ≈ 55–325, bottom edge y ≈ 1060.

### Motion

Use animation to explain processes or reveal steps. Motion should be restrained and purposeful. Choose durations and easing to suit the explanation; no fixed global timings are prescribed.

Each build stage must show a coherent state of the explanation. When an object appears, include the contents it already has at that point; show an empty object only when the approved process requires it, such as a computer before cloning. Reveal subsequent changes at their intended steps, preserving existing contents until the process changes them.

### Slide numbering

Show a plain `n/m` counter in the lower-right corner on every slide, including Title and Section slides. Count the initial state and each successive click/build stage as one numbered slide; `m` is the total of these states across the deck. Advance or reverse `n` with navigation, keeping `m` fixed. Continuous animation frames do not count separately. These display numbers do not change the authored slide count or outline in the teacher notes.

Use the secondary typography role (38 px, light, neutral gray), right edge x ≈ 1863 and bottom edge y ≈ 1060. Keep the counter clear of teaching content and logos, without a surrounding box or decoration.

### Published presentation exit control

This is viewer navigation, separate from the slide composition. Show the door-and-exit pictogram from `assets/exit.svg` only at a configured published presentation URL, returning to its configured overview. Keep it absent in local presentations, print/export, presenter, and embedded views; retain it in normal fullscreen viewing.

Use the course text gray `#656565`, without a visible label, border, shadow, or resting background on ordinary slides. On the 1920 × 1080 design canvas, place the 64 × 64 px icon at x = 55, y = 35 inside an 80 × 80 px link starting at x = 47, y = 27. Align the viewer overlay with the centered 16:9 slide, accounting for letterboxing. Preserve at least a 44 × 44 screen-pixel target and a 24 × 24 screen-pixel icon on smaller screens, without resizing the presentation canvas or shifting teaching content. At portrait viewport widths up to 600 px, place the link 12 screen pixels from the viewport's top and left, in the surrounding margin, with a 44 × 44 px target and 28 × 28 px icon.

On hover or keyboard focus, use the pale course background `#eceff2` and show “Return to episode overview” below the icon. Keyboard focus has a 2 px gray outline with 4 px offset. Tooltip text uses Gill Sans Light, at least 14 screen pixels. Give the link the same accessible name and hide the decorative icon from assistive technology. Full-image slides use the pale background even at rest to preserve contrast. No animation is required.
