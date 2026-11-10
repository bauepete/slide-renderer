import { realpathSync, statSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Slidev normalizes Markdown images outside the deck into /Assets/ URLs. */
export function resolveSharedAssetRequest(url, assetsRoot, prefix = '/Assets/') {
  if (!assetsRoot) return null
  const queryStart = url.indexOf('?')
  const pathname = queryStart < 0 ? url : url.slice(0, queryStart)
  if (!pathname.startsWith(prefix)) return null
  let path
  try { path = resolve(assetsRoot, decodeURIComponent(pathname.slice(prefix.length))) }
  catch { return null }
  const withinAssets = relative(assetsRoot, path)
  if (!withinAssets || withinAssets === '..' || withinAssets.startsWith(`..${sep}`) || isAbsolute(withinAssets)) return null
  try {
    if (!statSync(path).isFile()) return null
    const real = relative(realpathSync(assetsRoot), realpathSync(path))
    if (real === '..' || real.startsWith(`..${sep}`) || isAbsolute(real)) return null
  }
  catch { return null }
  return `/@fs${pathToFileURL(path).pathname}${queryStart < 0 ? '' : url.slice(queryStart)}`
}

export function serveSharedAssets(assetsRoot, prefix = '/Assets/') {
  return {
    name: 'course-shared-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const target = resolveSharedAssetRequest(request.url || '', assetsRoot, prefix)
        if (target) request.url = target
        next()
      })
    },
  }
}
