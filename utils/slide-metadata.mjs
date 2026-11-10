// Tolerate formatter-added whitespace in course frontmatter before Slidev splits slides.
export function normalizeSlideMetadata(lines) {
  let fence
  let inComment = false
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    if (inComment) {
      if (line.includes('-->')) inComment = false
      continue
    }
    if (fence) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/)
      if (closing && closing[1][0] === fence[0] && closing[1].length >= fence.length) fence = undefined
      continue
    }
    if (line.includes('<!--')) {
      inComment = !line.slice(line.indexOf('<!--') + 4).includes('-->')
      continue
    }
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (opening) { fence = opening[1]; continue }
    if (!/^---\s*$/.test(line)) continue

    let next = index + 1
    while (next < lines.length && !lines[next].trim()) next++
    if (!/^slideType:\s*\S/.test(lines[next] || '') && !(index === 0 && /^\w+:/.test(lines[next] || ''))) continue
    const end = lines.findIndex((candidate, position) => position > next && /^---\s*$/.test(candidate))
    if (end === -1) continue

    // Move the first field up without changing line counts or slide boundaries.
    // YAML permits the resulting blank line between fields.
    if (next !== index + 1) {
      lines[index + 1] = lines[next]
      lines[next] = ''
    }
    for (let field = index + 1; field < end; field++) {
      if (!/^callout:\s*$/.test(lines[field])) continue
      const children = []
      for (let child = field + 1; child < end; child++) {
        if (!lines[child].trim() || /^\s*#/.test(lines[child])) continue
        if (!/^(shape|color):\s*\S/.test(lines[child])) break
        children.push(child)
      }
      // Only repair the known flattened mapping, never arbitrary YAML or slide content.
      if (children.some(child => /^shape:/.test(lines[child]))) {
        for (const child of children) lines[child] = `  ${lines[child]}`
      }
    }
    index = end
  }
}
