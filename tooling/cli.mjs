#!/usr/bin/env node
import { resolve, dirname, basename } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildPreview, buildWeb } from './build.mjs'

const [command, input, ...args] = process.argv.slice(2)
function option(name, fallback) {
  const i = args.indexOf(name)
  if (i < 0) return fallback
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${name}`)
  return args[i + 1]
}
if (!['web', 'standalone'].includes(command) || !input) {
  console.error('Usage: slide-renderer web <slides.md> [--out directory] [--base /site/path/]\n       slide-renderer standalone <slides.md> [--name presentation.html]')
  process.exitCode = 1
} else {
  const entry = resolve(input)
  if (command === 'web') buildWeb(entry, { outDir: option('--out', 'dist/web'), base: option('--base', './') })
  else {
    if (basename(entry) !== 'slides.md') throw new Error('Standalone sources must be named slides.md.')
    const name = option('--name', 'presentation.html')
    if (!/^[a-z0-9_-]+\.html$/i.test(name)) throw new Error('Standalone name must be a plain .html filename.')
    buildPreview(pathToFileURL(dirname(entry) + '/'), name)
  }
}
