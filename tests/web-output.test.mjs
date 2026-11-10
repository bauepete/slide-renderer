import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

test('web output externalizes explicit inline images, splits modules, and has valid entry assets', {
  skip: !process.env.RENDERER_WEB_OUTPUT && 'Set RENDERER_WEB_OUTPUT after a web build.',
}, () => {
  const root = process.env.RENDERER_WEB_OUTPUT
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  assert(Buffer.byteLength(html) < 10_000, 'web HTML must not contain the entire deck')
  assert.doesNotMatch(html, /data:image\/(?:jpeg|png)|<link\b[^>]*as="image"/)
  for (const [, path] of html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))"/g)) {
    const asset = path.slice(path.lastIndexOf('/assets/') + 1)
    assert(existsSync(join(root, asset)), path)
  }
  const assets = readdirSync(join(root, 'assets'), { recursive: true })
  assert(assets.filter(path => path.endsWith('.js')).length > 2, 'web build must retain code splitting')
  assert(assets.some(path => /template-paper.*\.jpg$/.test(path)), 'background must be an external asset')
  assert(assets.some(path => /\.(?:jpg|png)$/.test(path) && !path.startsWith('template-paper')), 'content images must be external assets')
  for (const path of assets.filter(path => /\.(?:js|css)$/.test(path))) {
    const code = readFileSync(join(root, 'assets', path), 'utf8')
    assert.doesNotMatch(code, /data:image\/(?:jpeg|png);base64/)
    assert.doesNotMatch(code, /images\s*:\s*\[[^\]]*\?inline/, 'runtime preloads must not request authored paths instead of hashed assets')
  }
})
