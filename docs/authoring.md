# Authoring slides

Enable `slidev-addon-renderer` in Slidev headmatter. [Course setup](../COURSE_SETUP.md) documents preparation, installation, and course configuration; [DESIGN.md](../DESIGN.md) defines appearance. Course policy owns educational approval and publication.

## Markdown and metadata

Use Slidev with `slides.md` in any course presentation directory. Write headings, paragraphs, lists, nested lists, and images in Markdown. The renderer supplies layout containers and styling; authors do not need HTML wrappers, CSS classes, manual `<br>` tags, or Vue component tags for ordinary content.

Write URLs and domain names as explicit Markdown links, with the intended visible text as the label and a complete URL as the destination. Their visual treatment follows [DESIGN.md's typography rules](../DESIGN.md#typography). For example:

```md
Source: [www.projectcartoon.com](https://www.projectcartoon.com)
```

This displays `Source: www.projectcartoon.com` without angle brackets.

The shared renderer also recognizes bare domains and legacy angle-bracketed URLs in ordinary prose. It renders them as links without visible angle brackets, using HTTPS when no scheme is supplied. Explicit link labels and destinations, authored URL schemes, and literal code examples are preserved. Links inherit the surrounding typography and color.

Each slide has an optional YAML metadata block, called frontmatter. The first block is also the deck's headmatter and can configure the whole presentation. A later slide with metadata starts like this:

```md
---
slideType: General content
---

# Testing

- Test strategies
- Test plans
- Test protocols
```

Prefer metadata immediately after the opening `---`. Standard Slidev treats a blank line there as the start of ordinary content, potentially creating an extra slide and ignoring settings such as `clicks`. The shared [preparser](../setup/preparser.ts) also accepts formatter-added blank lines before `slideType`; it normalizes them in memory before splitting slides. Leave a blank line after the closing `---` before the content.

Prefer a [Slidev-aware formatter](https://sli.dev/features/prettier-plugin). The whitespace tolerance applies to every deck using the course addon.

| Key | Purpose |
| --- | --- |
| `slideType` | Course-specific visual type, using a name from [DESIGN.md](../DESIGN.md#slide-types). |
| `columns` | Required positive integer for `General content columns`; ignored by the existing one- and two-column types. |
| `layout` | Slidev layout component. Course decks use `course`, inherited through deck `defaults`. |
| `clicks` | Declared final click index; with the normal zero start, the number of advances before leaving the slide. See [Click stages](#click-stages). |
| `callout` | Shape and color of the content in the `::callout::` slot on an Image-and-bullets slide. See [Callouts](#callouts). |
| `defaults` | Headmatter values inherited by later slides unless overridden. Course decks default to `layout: course` and `clicks: 0`. |

Use `slideType` directly; there is no separate `kind` field. Standard Slidev options are documented in the installed [frontmatter reference](https://sli.dev/custom/config-frontmatter) and the [upstream syntax guide](https://sli.dev/guide/syntax).

## Slide types and columns

### Renderer capabilities

The table maps every visual type in [DESIGN.md](../DESIGN.md#slide-types) to the current shared `course` layout. Check support while developing a course outline, before approving content for generation.

| Visual type / `slideType` | Shared renderer support | Implementation |
| --- | --- | --- |
| `Title` | Yes | Subject image or deck-local visual, heading, and subtitle. |
| `Image` | No | The full-bleed image layout is not implemented. |
| `Section` | Yes | Centered section heading. |
| `Bullet` | No | The dedicated Bullet layout and its staggered-column option are not implemented. |
| `Image-and-bullets` | Yes | Left bullet list, one right-hand image, and optional callout. |
| `Quotation` | No | The dedicated centered quotation and attribution layout is not implemented. |
| `General content` | Yes | One measured content column; paragraphs, lists, and Markdown blockquotes. |
| `General content two column` | Yes | Two measured columns, balanced automatically or split explicitly. |
| `General content columns` | Yes | A required `columns` parameter selects N equal measured columns, balanced automatically or split explicitly. |

Image galleries are a content-driven rendering mode, supported by `General content` slides, rather than a separate `slideType`. A Markdown blockquote in General content uses that layout's body treatment.

An unsupported value can fall through to generic content rendering; this does not implement its visual specification. Resolve unsupported types during drafting under the episode workflow. Generation must follow the agreed type and implementation approach.

`General content` renders one content column. `General content two column` remains a backward-compatible two-column type: its Markdown, widths, spacing, and balancing choices are unchanged. `General content columns` uses the same renderer with a required positive-integer `columns` parameter. The heading spans all columns. Typography, widths, gaps, and alignment are specified in [General content layout](../DESIGN.md#general-content-layout).

For example, request three columns with:

```md
---
slideType: General content columns
columns: 3
---

# Project Roles

- Developer
- Tester
- Designer
- Product owner
- Scrum master
- User
```

The `columns` parameter is used only by the new type; it never changes an existing one- or two-column slide. Missing, non-integer, non-positive counts, and counts whose standard gaps leave no content width are layout errors. Narrow columns must still fit the required typography; the renderer reports overflow rather than shrinking text below 52 px.

### Automatic distribution

Without an explicit break, the renderer balances actual rendered height, including wrapped lines and spacing. It preserves reading order: down the left column, then down the right column. Each parent bullet stays with its nested content, and other logical blocks remain whole. Five bullets of comparable height normally give three on the left and two on the right.

For N columns, reading continues down each column from left to right. Automatic balancing minimizes the tallest column, then balances the remaining heights, placing extra comparable units in earlier columns. If there are fewer units than columns, the trailing columns stay empty. The original two-column balancing retains its existing rounding and tie-breaking.

```md
---
slideType: General content two column
---

# What Are Projects?

- Collaborative enterprise
- Carefully planned
- Temporary rather than permanent
- Accomplish particular tasks
- Time constraints
```

### Explicit column break

To choose the breaks yourself, put `::columnBreak::` on its own line with blank lines around it. Use one marker for `General content two column`, or exactly N − 1 markers for `General content columns` with `columns: N`. Each marker starts the next column; the heading spans all columns, and markers are not displayed. A mismatched marker count is a layout error.

```md
---
slideType: General content two column
---

# What Are Projects?

- Collaborative enterprise
- Carefully planned
- Temporary rather than permanent

::columnBreak::

- Accomplish particular tasks
- Time constraints
```

Both modes use the same renderer and styling. The marker uses Slidev's named-slot syntax; it does not require a different column component or HTML wrapper.

Repeat the same marker for additional columns; the shared Markdown extension assigns unique internal slot names:

```md
---
slideType: General content columns
columns: 3
---

# Project Roles

- Developer
- Tester

::columnBreak::

- Designer
- Product owner

::columnBreak::

- Scrum master
- User
```

An explicit break may continue a nested list in the other column. Keep the original indentation on those bullets: their list level, font size, indentation, and spacing remain the same across the break. A subsequent unindented bullet starts a first-level item as usual. Automatic balancing continues to keep nested groups together.

### Paragraphs and nested bullets

Use nested bullets to express hierarchy. Ordinary paragraphs take part in normal column flow; there is no special full-width introduction or `lead` concept.

```md
- Learn basic project-management skills:
  - Documents beyond source code
  - Tools
  - Planning and monitoring
```

The renderer may use the permitted body-size fallback in DESIGN.md when content does not fit. It reports overflow if content still does not fit at the minimum size. It does not reorder content, add columns, create slides, or shrink text below the design minimum to solve overflow. Nested groups remain whole unless the author places an explicit column break inside one. Resolve content or structural changes through the approved outline workflow.

### Image-and-bullets

Use `slideType: Image-and-bullets` for a concise list on the left and one supporting image on the right. Write a heading, a Markdown list (nested bullets are supported), and one separate Markdown image paragraph. The image is assigned to the right automatically, regardless of whether it comes before or after the list in the source. No HTML, CSS classes, component tag, or `::columnBreak::` is needed.

```md
---
slideType: Image-and-bullets
---

# A Working Website

- A working website
- Images, navigation, and a usable menu

![Campus Café homepage with photographs and navigation](./assets/campus-cafe-working.png?inline)
```

The heading spans both sides. The renderer keeps the complete image visible without cropping, preserves its aspect ratio, and fits it into the right-hand image area. It leaves clearance below a wrapping heading, reducing the available image height when necessary. The bullet group is vertically centered beside the image and uses the specified 52 px type. Visual dimensions and alignment are in [Image-and-bullets layout](../DESIGN.md#image-and-bullets-layout).

Use meaningful alt text and local image paths; `?inline` embeds the image in portable exports. Raster artwork is never enlarged beyond one canvas pixel per two source pixels. Provide sufficiently detailed source artwork: the nominal 650 × 630 px image area needs at least 1300 × 1260 source pixels to fill it at 2×, or the renderer displays a smaller image. Text inside a website screenshot is part of the depicted interface; the explanatory slide bullets remain editable and meet the course typography requirements.

Exactly one image paragraph and a list are required. Extra prose, multiple images, a missing image, or a column-break marker are authoring errors; the renderer reports them through its layout error status and browser console. It reports overflowing text at 52 px instead of shrinking the bullets. Keep additional explanation in the approved course authoring notes or use another slide type.

## Images and galleries

Use relative image paths and meaningful alt text. Prefer suitable project assets and replace template placeholders with visuals appropriate for student publication. Keep source artwork and any explicitly approved resolution exceptions intact. Otherwise, raster images must support twice their displayed dimensions; full-bleed images must be at least 3840 px wide.

Record an approved asset-specific exception beside its provenance in the asset directory's `README.md`: identify the files, source and original dimensions, permitted exception and scope, and link to the existing approval in the course authoring notes. Keep that record when copying or reusing the authoring assets; a surface brief may link to it. New exceptions require agreement before use.

On a Title slide, a Markdown image supplies the subject visual, and an ordinary paragraph supplies the subtitle or presenter line. Use `?inline` on Markdown image paths so standalone builds embed the files. A deck-local Vue component may supply a subject diagram on a Title slide.

For an image gallery, write a sequence of Markdown image paragraphs. Each image's alt text becomes its caption; a following ordinary paragraph supplies the source credit. The renderer displays all panels in two rows and uses the slide's click state to select the active panel and caption.

The current cartoon has 18 images and captions, so it declares `clicks: 17`. Keep that setting aligned with the image count when editing the gallery; it is not currently inferred automatically.

Keep text and diagrams editable where practical, and ordinary content in Markdown. Use deck-local Vue components for subject-specific visuals and click-driven demonstrations, such as process and repository diagrams. Website screenshots with explanatory bullets use `Image-and-bullets`. These components render as normal content blocks inside the shared layout; they should provide their own intrinsic height and keep their text within DESIGN.md’s permitted sizes. A component must not recreate the slide heading, logos, counter, or page layout. Do not turn complete slides into screenshots or raster images.

## Callouts

The shared `Image-and-bullets` layout supports one callout beneath the left bullet list. Put its appearance in frontmatter and its text after `::callout::`, on its own line with surrounding blank lines. This is Slidev's named-slot syntax. The marker assigns the following content to the callout; it is not displayed and does not contain the callout text itself.

```md
---
slideType: Image-and-bullets
clicks: 1
callout:
  shape: speechBubble
  color: red
---

# Bug Report

- “The menu no longer works. Can you fix the version we used yesterday?”
- The source has changed. Where is the version we need?

![A GitHub-style issue page with placeholder content](./assets/github-issue-placeholder.png?inline)

::callout::

<v-click>

Panic!!!

</v-click>
```

`shape` accepts `speechBubble` or `box`; `color` accepts `gray`, `red`, or `amber`. Both are required. Their appearance comes from [template 08](../DESIGN.md#speech-bubbles-and-boxes). Keep the text short enough to fit the shape at 52 px. The complete list-and-callout group must fit beside the image; the renderer reports overflow instead of shrinking it.

The standard Slidev `<v-click>` wraps the callout's **text in the source**. The renderer places that native component around the **complete shape and text** when rendering, so both appear together on the first click. Speech bubbles use a quick pop entrance with a small overshoot and settle; no additional Markdown or animation setting is needed. Stepping back hides the bubble, and revealing it again repeats the pop. Reduced-motion preferences replace the scale effect with an immediate reveal. Its standard options, such as `at`, retain their Slidev behavior. Declare the final index with `clicks` as described below. Without `<v-click>`, the callout is visible immediately and stays still; omit `clicks: 1` if there are no other builds.

Keep `::callout::` outside `<v-click>`. Put the image and bullets before the marker, because everything after it belongs to the callout slot until another slot or the next slide begins. No `::speechBubble red Panic::` directive or layout HTML is needed.

YAML normally requires the two-space indentation under `callout`. Some Markdown formatters remove it from later slides. The course preparser restores immediately following, unindented `shape` and `color` fields when it recognizes this flattened callout mapping, without adding slides or changing line numbers. Correctly indented YAML is left intact. The compact YAML form `callout: { shape: speechBubble, color: red }` is also valid and avoids indentation changes. This tolerance belongs to the course addon; it is not general Slidev YAML behavior.

## Click stages

`clicks` is a standard Slidev frontmatter option, not a course-specific slide type. With the normal starting index of zero, it declares how many click advances belong to the current slide before the next advance leaves it:

| Frontmatter | Click indices | Presentation stages |
| --- | --- | --- |
| `clicks: 0` | 0 | 1: the initial state |
| `clicks: 11` | 0–11 | 12: the initial state plus 11 advances |
| `clicks: 17` | 0–17 | 18: the initial state plus 17 advances |

The key reserves stages; it does not itself reveal content or change captions. A component or Slidev click directive determines what each state displays. The gallery reads the current click index to choose its caption and active image. In its deck defaults, `clicks: 0` makes ordinary slides advance immediately unless they declare a different value.

Declare the final click index explicitly for every slide with builds so the total stage count is correct from the first load, including direct navigation and backward steps. These examples use the normal zero start; other click settings are documented in the [Slidev frontmatter reference](https://sli.dev/custom/config-frontmatter).

The [course stage counter](../DESIGN.md#slide-numbering) counts each initial state and successive click state. Continuous animation frames do not count as separate stages. Course outlines retain their authored slide counts.

