import test from 'node:test'
import assert from 'node:assert/strict'
import { removeEmbeddedImagePreloads } from '../utils/embedded-image-preloads.mjs'

test('standalone exports discard redundant local preload paths for all JS quote styles', () => {
  const source = './photo.jpg?inline'
  for (const key of ['images', '"images"', "'images'"]) {
    const script = `const meta={${key}:["${source}",'${source}',\`${source}\`]}; const img={src:"${source}"};`
    assert.equal(removeEmbeddedImagePreloads(script, `![Photo](${source})`), `const meta={${key}:[]}; const img={src:"${source}"};`)
  }
})

test('remote URLs, data URLs, code examples, and computed image lists remain intact', () => {
  const markdown = '![Local](./photo.jpg?inline)\n\n![Remote](https://example.com/image.jpg)\n\n```md\n![Example](./example.jpg)\n```'
  const script = 'const a={images:["./photo.jpg?inline","https://example.com/image.jpg","data:image/png;base64,AAAA","./example.jpg"]}; const b={images:[...dynamicImages]};'
  const expected = 'const a={images:["https://example.com/image.jpg","data:image/png;base64,AAAA","./example.jpg"]}; const b={images:[...dynamicImages]};'
  assert.equal(removeEmbeddedImagePreloads(script, markdown), expected)
})
