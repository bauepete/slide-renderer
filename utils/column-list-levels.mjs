function listLevels(tokens) {
  const levels = new Map()
  let depth = 0
  for (const token of tokens) {
    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') depth++
    else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') depth--
    else if (token.type === 'list_item_open' && token.map) levels.set(token.map[0], depth)
  }
  return levels
}

export function restoreListLevels(tokens, logicalTokens) {
  const levels = listLevels(logicalTokens)
  const parents = []
  for (const token of tokens) {
    if (token.type === 'list_item_close') { parents.pop(); continue }
    if (token.type !== 'list_item_open') continue
    const depth = levels.get(token.map?.[0]) ?? parents.length + 1
    const offset = Math.max(0, depth - (parents.at(-1) ?? 0) - 1)
    if (depth > parents.length + 1) {
      token.attrSet('data-list-level', String(depth))
      token.attrSet('aria-level', String(depth))
      token.attrSet('style', `${token.attrGet('style') || ''};--course-list-offset:${offset}`)
    }
    parents.push(depth)
  }
}

export function preserveColumnListLevels(md) {
  const logicalMarkdown = new md.constructor(md.options)
  md.core.ruler.after('block', 'course_column_list_levels', state => {
    const breaks = state.tokens.filter(token => token.type === 'slot_marker' && token.meta.slotName === 'columnBreak')
    if (!breaks.length) return
    const lines = state.src.split('\n')
    // Remove only actual slot markers, leaving examples and comments untouched.
    // Keeping the line positions lets us match items across both parses.
    for (const marker of breaks) lines[marker.map[0]] = ''
    restoreListLevels(state.tokens, logicalMarkdown.parse(lines.join('\n')))
    // Vue slots must be unique. Authors can keep using the same visible marker
    // for each next column; retain the original slot name for the first break.
    breaks.forEach((marker, index) => {
      if (index) marker.meta.slotName = `columnBreak${index + 1}`
    })
  })
}
