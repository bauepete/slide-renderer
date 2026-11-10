import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

export function validateSite(site) {
  if (site == null) return null
  const origin = new URL(site.origin)
  if (origin.protocol !== 'https:' || origin.origin !== site.origin)
    throw new Error('site.origin must be an exact HTTPS origin, without a trailing slash.')
  if (!/^\/(?:[^?#\\]+\/)?$/.test(site.basePath) || site.basePath.includes('..'))
    throw new Error('site.basePath must start and end with / and contain no traversal.')
  const presentations = site.presentations
  if (!presentations || Array.isArray(presentations) || typeof presentations !== 'object')
    throw new Error('site.presentations must map presentation paths to overview paths.')
  for (const [presentation, overview] of Object.entries(presentations)) {
    for (const path of [presentation, overview]) {
      if (typeof path !== 'string' || !path || /[?#\\:%]/.test(path) || path.startsWith('/') || path.split('/').some(part => part === '.' || part === '..'))
        throw new Error('Site routes must be relative paths without queries, fragments, or traversal.')
    }
  }
  return { origin: origin.origin, basePath: site.basePath, presentations: { ...presentations } }
}

// Search from the deck to its package boundary, never from the addon location.
export function loadCourseConfig(start) {
  let root = resolve(start)
  while (true) {
    const file = join(root, 'slide-renderer.config.json')
    if (existsSync(file)) {
      const config = JSON.parse(readFileSync(file, 'utf8'))
      if (config.schema !== 1) throw new Error('Unsupported slide-renderer configuration schema.')
      const assetsPrefix = config.assetsPrefix ?? '/Assets/'
      if (!assetsPrefix.startsWith('/') || !assetsPrefix.endsWith('/')) throw new Error('assetsPrefix must start and end with /.')
      return { root, file, assetsRoot: resolve(root, config.assetsRoot ?? 'Assets'), assetsPrefix, site: validateSite(config.site) }
    }
    if (existsSync(join(root, 'package.json')) || dirname(root) === root)
      return { root, file: null, assetsRoot: null, assetsPrefix: '/Assets/', site: null }
    root = dirname(root)
  }
}
