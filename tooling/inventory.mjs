import { readFileSync, readdirSync, lstatSync } from 'node:fs'
import { join } from 'node:path'

// Runtime sources and assets in the installed package, with portable paths.
// Courses use these bytes in publication and visual-capture fingerprints.
export function rendererInventory(root) {
  if (lstatSync(root).isSymbolicLink()) throw new Error('Renderer inventory requires an installed package, not a source link.')
  const files = {}
  function visit(path) {
    const stat = lstatSync(join(root, path))
    if (stat.isSymbolicLink()) throw new Error(`Renderer inventory cannot follow a symlink: ${path}`)
    if (stat.isDirectory()) {
      for (const entry of readdirSync(join(root, path)).sort())
        if (!entry.startsWith('.') && entry !== 'README.md') visit(path ? `${path}/${entry}` : entry)
    } else if (stat.isFile()) files[path] = readFileSync(join(root, path))
  }
  for (const path of ['package.json', 'layouts', 'components', 'setup', 'utils', 'assets', 'tooling', 'styles.css', 'global-top.vue', 'vite.config.mts']) visit(path)
  return files
}
