// The course explicitly lists published entry points and their overviews.
// Installing the renderer without site configuration never exposes an exit.
export function episodeOverviewUrl(href, { site = null, isPrintMode = false, isPresenter = false, isEmbedded = false } = {}) {
  if (!site || isPrintMode || isPresenter || isEmbedded) return null
  let url
  try { url = new URL(href) }
  catch { return null }
  if (url.protocol !== 'https:' || url.origin !== site.origin || !url.pathname.startsWith(site.basePath)) return null
  const path = url.pathname.slice(site.basePath.length)
  if (!Object.hasOwn(site.presentations, path)) return null
  return new URL(site.presentations[path], site.origin + site.basePath).href
}
