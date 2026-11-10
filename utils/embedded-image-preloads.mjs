import MarkdownIt from 'markdown-it'

// Vite rewrites displayed Markdown image imports to embedded or hashed assets.
// Slidev's runtime preloader retains authored paths which no longer resolve in
// either output format. Remove only those redundant local metadata entries.
export function removeEmbeddedImagePreloads(javascript, markdown) {
  const images = new Set()
  function collect(tokens) {
    for (const token of tokens) {
      if (token.type === 'image') {
        const source = token.attrGet('src')
        if (source && !/^(?:[a-z][\w+.-]*:|\/)/i.test(source)) {
          images.add(JSON.stringify(source))
          images.add(`'${source.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`)
          images.add(`\`${source.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\``)
        }
      }
      if (token.children) collect(token.children)
    }
  }
  collect(new MarkdownIt().parse(markdown, {}))
  return javascript.replace(/((?:\bimages|["']images["'])\s*:\s*)\[([^\]]*)\]/g, (original, property, array) => {
    const strings = array.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g) || []
    // Only static string arrays are preload metadata; leave expressions alone.
    const residue = array.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, '').replace(/[\s,]/g, '')
    if (residue) return original
    return `${property}[${strings.filter(value => !images.has(value)).join(',')}]`
  })
}
