/** Render URL-like prose as links, without visible autolink brackets. */
export function courseUrlLinks(md) {
  // Vue Markdown disables fuzzy links by default, so bare domains need enabling.
  md.linkify.set({ fuzzyLink: true })
  md.core.ruler.after('linkify', 'course_url_links', state => {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue
      const tokens = block.children
      for (let index = 0; index < tokens.length; index++) {
        const link = tokens[index]
        const label = tokens[index + 1]
        const close = tokens[index + 2]
        if (link.type !== 'link_open' || link.info !== 'auto'
          || label?.type !== 'text' || close?.type !== 'link_close'
          || !/^https?:\/\//i.test(link.attrGet('href') || '')) continue

        // Bare domains have no authored scheme; use HTTPS for their destination.
        if (link.markup === 'linkify' && !/^https?:\/\//i.test(label.content)) {
          link.attrSet('href', link.attrGet('href').replace(/^http:/i, 'https:'))
        }

        const before = tokens[index - 1]
        const after = tokens[index + 3]
        if (before?.type === 'text' && before.content.endsWith('<')
          && after?.type === 'text' && after.content.startsWith('>')) {
          before.content = before.content.slice(0, -1)
          after.content = after.content.slice(1)
        }
      }
    }
  })
}
