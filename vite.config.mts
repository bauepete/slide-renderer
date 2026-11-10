import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { preserveColumnListLevels } from './utils/column-list-levels.mjs'
import { courseUrlLinks } from './utils/url-links.mjs'
import { restoreSlideModulePaths } from './utils/slide-module-paths.mjs'
import { serveSharedAssets } from './utils/shared-assets.mjs'
import { loadCourseConfig } from './utils/course-config.mjs'
import { removeEmbeddedImagePreloads } from './utils/embedded-image-preloads.mjs'

const portable = process.env.SLIDE_RENDERER_BUILD_MODE === 'standalone'
let course
let markdown = ''
export default defineConfig({
  slidev: { markdown: { markdownSetup(md) { md.use(preserveColumnListLevels).use(courseUrlLinks) } } },
  resolve: { alias: [{
    find: /^@shikijs\/vitepress-twoslash\/client$/,
    replacement: fileURLToPath(new URL('./setup/floating-vue.ts', import.meta.url)),
  }] },
  build: { cssCodeSplit: false, assetsInlineLimit: portable ? 10_000_000 : 0 },
  plugins: [restoreSlideModulePaths(), {
    name: 'slide-renderer-course-config',
    configResolved(config) {
      course = loadCourseConfig(config.root)
      const entry = process.env.SLIDE_RENDERER_ENTRY || join(config.root, 'slides.md')
      if (existsSync(entry)) markdown = readFileSync(entry, 'utf8')
      if (!portable || config.command !== 'build') return
      for (const options of [config.build.rolldownOptions, config.build.rollupOptions]) {
        const outputs = Array.isArray(options.output) ? options.output : [options.output || (options.output = {})]
        for (const output of outputs) { delete output.manualChunks; output.codeSplitting = false }
      }
    },
    resolveId(id) { if (id === 'virtual:slide-renderer-config') return '\0slide-renderer-config' },
    load(id) { if (id === '\0slide-renderer-config') return `export const site = ${JSON.stringify(course.site)}` },
    configureServer(server) {
      serveSharedAssets(course.assetsRoot, course.assetsPrefix).configureServer(server)
    },
  }, {
    name: 'slide-renderer-web-assets',
    apply: 'build',
    enforce: 'pre',
    resolveId: { order: 'pre', async handler(id, importer) {
      if (!portable && /[?&]inline(?:&|$)/.test(id) && /\.(?:png|jpe?g|webp|gif|svg)(?:\?|$)/i.test(id)) {
        const external = id.replace(/([?&])inline(?=&|$)/, '$1').replace(/\?&/, '?').replace(/[?&]$/, '')
        return this.resolve(external, importer, { skipSelf: true })
      }
    } },
    transformIndexHtml(html) { return portable ? html : html.replace(/<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="image")[^>]*>/g, '') },
    renderChunk(code) {
      if (portable || !markdown) return null
      const rewritten = removeEmbeddedImagePreloads(code, markdown)
      return rewritten === code ? null : { code: rewritten, map: null }
    },
  }],
})
