import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { restoreSlideModulePaths } from '../utils/slide-module-paths.mjs'
import { createServer } from 'vite'

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'course-preview-')))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, 'slides.md'), '# Slide\n')
  writeFileSync(join(root, 'assets/campus-cafe-working.png'), '')
  const plugin = restoreSlideModulePaths()
  plugin.configResolved({ root })
  return { root, plugin, resolveId: plugin.resolveId.handler }
}

test('a development slide URL resolves image imports beside its source deck', t => {
  const { root, plugin, resolveId } = fixture(t)
  const id = resolveId('/slides.md__slidev_2.md')
  assert.equal(id, `${join(root, 'slides.md')}__slidev_2.md`)
  assert.ok(existsSync(resolve(dirname(id), './assets/campus-cafe-working.png')))
  assert.equal(plugin.apply, 'serve')
})

test('frontmatter URLs retain queries and existing filesystem IDs are untouched', t => {
  const { root, resolveId } = fixture(t)
  assert.equal(resolveId('/slides.md__slidev_2.frontmatter?import'), `${join(root, 'slides.md')}__slidev_2.frontmatter?import`)
  assert.equal(resolveId(`${join(root, 'slides.md')}__slidev_2.md`), null)
})

test('unrelated URLs and paths outside the deck are not redirected', t => {
  const { resolveId } = fixture(t)
  for (const id of ['/assets/image.png', '/missing.md__slidev_1.md', '/@slidev/slides/2/md', '/../slides.md__slidev_2.md']) {
    assert.equal(resolveId(id), null)
  }
})

test('Vite resolves the deck directory before a virtual-module loader claims the URL', async t => {
  const { root, plugin } = fixture(t)
  const server = await createServer({
    root,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [plugin, {
      name: 'slidev-loader-fixture',
      enforce: 'pre',
      resolveId: { order: 'pre', handler(id) { if (id.includes('__slidev_')) return id } },
      load(id) {
        if (id.includes('__slidev_')) return "import image from './assets/campus-cafe-working.png?inline'; export default image"
      },
    }],
  })
  try {
    const id = await server.environments.client.pluginContainer.resolveId('/slides.md__slidev_2.md')
    assert.equal(id.id, `${join(root, 'slides.md')}__slidev_2.md`)
    const result = await server.transformRequest('/slides.md__slidev_2.md')
    assert.match(result.code, /assets\/campus-cafe-working\.png/)
  } finally {
    await server.close()
  }
})
