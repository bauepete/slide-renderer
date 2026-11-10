import test from 'node:test'
import assert from 'node:assert/strict'
import MarkdownExit from 'markdown-exit'
import { courseUrlLinks } from '../utils/url-links.mjs'

function render(source) {
  const md = new MarkdownExit({ html: true, linkify: true })
  md.linkify.set({ fuzzyLink: false }) // Match Vue Markdown's initial configuration.
  return md.use(courseUrlLinks).render(source)
}

test('the existing cartoon credit becomes a bracket-free HTTPS link', () => {
  assert.equal(render('Source: <www.projectcartoon.com>'),
    '<p>Source: <a href="https://www.projectcartoon.com">www.projectcartoon.com</a></p>\n')
})

test('bare domains link without swallowing surrounding prose or punctuation', () => {
  assert.equal(render('Visit example.com/path, then <www.example.org>.'),
    '<p>Visit <a href="https://example.com/path">example.com/path</a>, then <a href="https://www.example.org">www.example.org</a>.</p>\n')
})

test('authored schemes and explicit Markdown link labels and destinations survive', () => {
  assert.equal(render('<http://example.com> and [Course website](https://example.org/course)'),
    '<p><a href="http://example.com">http://example.com</a> and <a href="https://example.org/course">Course website</a></p>\n')
})

test('code examples and non-URL angle-bracket content remain literal', () => {
  assert.equal(render('`<www.example.com>` and &lt;placeholder&gt;'),
    '<p><code>&lt;www.example.com&gt;</code> and &lt;placeholder&gt;</p>\n')
  assert.equal(render('```md\n<www.example.com>\n```'),
    '<pre><code class="language-md">&lt;www.example.com&gt;\n</code></pre>\n')
})
