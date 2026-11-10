import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { removeEmbeddedImagePreloads } from '../utils/embedded-image-preloads.mjs'

function runSlidev(entry, args, mode) {
  const require = createRequire(entry)
  const cli = require.resolve('@slidev/cli/bin/slidev.mjs')
  execFileSync(process.execPath, [cli, ...args], {
    cwd: dirname(entry), stdio: 'inherit',
    env: { ...process.env, SLIDE_RENDERER_BUILD_MODE: mode, SLIDE_RENDERER_ENTRY: entry },
  })
}

export function buildWeb(entry, { outDir = 'dist/web', base = './' } = {}) {
  entry = resolve(entry)
  const outputRoot = resolve(dirname(entry), outDir)
  runSlidev(entry, ['build', entry, '--out', outputRoot, '--base', base, '--router-mode', 'hash', '--without-notes'], 'web')
  return outputRoot
}

export function buildPreview(presentationUrl, outputName) {
  const presentationRoot = fileURLToPath(presentationUrl)
  const outputRoot = join(presentationRoot, 'dist/site')
  const entry = join(presentationRoot, 'slides.md')
  runSlidev(entry, ['build', entry, '--out', outputRoot, '--base', './', '--router-mode', 'hash', '--without-notes'], 'standalone')
  let html = readFileSync(join(outputRoot, 'index.html'), 'utf8')
  const markdown = readFileSync(join(presentationRoot, 'slides.md'), 'utf8')
  html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (_, source) => {
    const js = removeEmbeddedImagePreloads(readFileSync(join(outputRoot, source), 'utf8'), markdown).replace(/<\/script/gi, '<\\/script')
    return `<script type="module">${js}</script>`
  })
  html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, source) => `<style>${readFileSync(join(outputRoot, source), 'utf8')}</style>`)
  html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '')
  html = html.replace(/<link\b[^>]*rel="icon"[^>]*href="([^"]+)"[^>]*>/g, (_, source) => {
    if (source.startsWith('data:')) return _
    // Slidev's default favicon is remote. Offline exports must not fetch it.
    if (/^(?:https?:)?\/\//i.test(source)) return '<link rel="icon" href="data:,">'
    const data = readFileSync(join(outputRoot, source)).toString('base64')
    return `<link rel="icon" href="data:image/png;base64,${data}">`
  })
  const output = join(presentationRoot, 'dist', outputName)
  // Do not repeat already embedded image bytes inside HTML head preloads.
  html = html.replace(/<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="image")(?=[^>]*\bhref="data:)[^>]*>/g, '')
  writeFileSync(output, html)
  console.log(`\nSelf-contained presentation: ${output}`)
  return output
}
