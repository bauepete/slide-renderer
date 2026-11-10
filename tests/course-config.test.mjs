import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadCourseConfig, validateSite } from '../utils/course-config.mjs'
import { site } from './site-fixture.mjs'

test('a differently structured course resolves configuration from its own package', t => {
  const root = mkdtempSync(join(tmpdir(), 'renderer-config-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const deck = join(root, 'Chapters/GettingStarted/Deck')
  mkdirSync(deck, { recursive: true })
  writeFileSync(join(root, 'package.json'), '{}')
  writeFileSync(join(root, 'slide-renderer.config.json'), JSON.stringify({ schema: 1, assetsRoot: 'Illustrations', assetsPrefix: '/Images/', site }))
  const config = loadCourseConfig(deck)
  assert.equal(config.root, root)
  assert.equal(config.assetsRoot, join(root, 'Illustrations'))
  assert.equal(config.assetsPrefix, '/Images/')
  assert.deepEqual(config.site, site)
  writeFileSync(join(deck, 'package.json'), '{}')
  assert.equal(loadCourseConfig(deck).site, null, 'nested packages do not inherit another course deployment')
})

test('invalid deployment origins and routes fail early instead of broadening the exit allowlist', () => {
  assert.equal(validateSite(null), null)
  for (const changes of [
    { origin: 'http://slides.example.org' }, { origin: 'https://slides.example.org/' },
    { basePath: '/sample' }, { basePath: '/sample/../' },
    { presentations: { 'Chapter/one.html': '../outside/' } },
    { presentations: { '/absolute.html': 'Chapter/' } },
    { presentations: { 'file.html?query': 'Chapter/' } },
  ]) assert.throws(() => validateSite({ ...site, ...changes }))
})
