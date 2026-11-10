import { existsSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'

/** Restore the deck directory after Vite turns a slide module into a root URL. */
export function restoreSlideModulePaths() {
  let root
  return {
    name: 'course-slide-module-paths',
    apply: 'serve',
    enforce: 'pre',
    configResolved(config) { root = config.root },
    resolveId: {
      order: 'pre',
      handler(id) {
        const match = id.match(/^\/([^?#]+?\.md)__slidev_(\d+)\.(md|frontmatter)(\?.*)?$/)
        if (!match || id.startsWith('/@') || existsSync(`/${match[1]}`)) return null
        const source = resolve(root, match[1])
        const path = relative(root, source)
        if (path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path) || !existsSync(source)) return null
        return `${source}__slidev_${match[2]}.${match[3]}${match[4] || ''}`
      },
    },
  }
}
