/** Choose an ordered break between whole content units, using measured heights. */
export function chooseColumnBreak(heights, gap, availableHeight) {
  if (!heights.length) return { index: 0, leftHeight: 0, rightHeight: 0, fits: true }
  const heightOf = (start, end) => heights.slice(start, end).reduce((sum, height) => sum + height, 0) + Math.max(0, end - start - 1) * gap
  if (heights.length === 1) {
    const leftHeight = heights[0]
    return { index: 1, leftHeight, rightHeight: 0, fits: leftHeight <= availableHeight }
  }
  let best
  for (let index = 1; index < heights.length; index++) {
    const leftHeight = heightOf(0, index)
    const rightHeight = heightOf(index, heights.length)
    const difference = Math.abs(leftHeight - rightHeight)
    if (!best || difference <= best.difference + 0.01) best = { index, leftHeight, rightHeight, difference }
  }
  return { index: best.index, leftHeight: best.leftHeight, rightHeight: best.rightHeight, fits: Math.max(best.leftHeight, best.rightHeight) <= availableHeight }
}

/** Balance contiguous whole units across N columns, padding empty columns at the end. */
export function chooseColumnBreaks(heights, gap, availableHeight, columns) {
  if (!Number.isInteger(columns) || columns < 1) throw new RangeError('columns must be a positive integer')
  if (columns === 2) {
    // Preserve the original two-column choices, including its rounding and tie-breaking.
    const result = chooseColumnBreak(heights, gap, availableHeight)
    return { indices: [result.index], heights: [result.leftHeight, result.rightHeight], fits: result.fits }
  }
  const prefix = [0]
  for (const height of heights) prefix.push(prefix.at(-1) + height)
  const heightOf = (start, end) => prefix[end] - prefix[start] + Math.max(0, end - start - 1) * gap
  const used = Math.min(columns, heights.length)
  if (!used) return { indices: Array(columns - 1).fill(0), heights: Array(columns).fill(0), fits: true }

  // First find the smallest possible tallest column. This must take priority over
  // variance, so a visually balanced alternative never causes avoidable overflow.
  let previous = Array(heights.length + 1).fill(Infinity)
  previous[0] = 0
  for (let column = 1; column <= used; column++) {
    const current = Array(heights.length + 1).fill(Infinity)
    for (let end = column; end <= heights.length; end++) {
      for (let start = column - 1; start < end; start++) {
        current[end] = Math.min(current[end], Math.max(previous[start], heightOf(start, end)))
      }
    }
    previous = current
  }
  const maximum = previous[heights.length]

  // Among equally short partitions, minimize the sum of squared column heights.
  // Prefer more content in earlier columns when both measures tie.
  let partitions = Array(heights.length + 1).fill(null)
  partitions[0] = { score: 0, indices: [] }
  for (let column = 1; column <= used; column++) {
    const current = Array(heights.length + 1).fill(null)
    for (let end = column; end <= heights.length; end++) {
      for (let start = column - 1; start < end; start++) {
        if (!partitions[start]) continue
        const height = heightOf(start, end)
        if (height > maximum + 0.000001) continue
        const candidate = { score: partitions[start].score + height ** 2, indices: [...partitions[start].indices, end] }
        const best = current[end]
        const firstDifference = best && candidate.indices.findIndex((value, index) => value !== best.indices[index])
        if (!best || candidate.score < best.score - 0.000001
          || (Math.abs(candidate.score - best.score) <= 0.000001 && firstDifference >= 0 && candidate.indices[firstDifference] > best.indices[firstDifference])) current[end] = candidate
      }
    }
    partitions = current
  }
  const ends = [...partitions[heights.length].indices, ...Array(columns - used).fill(heights.length)]
  const columnHeights = ends.map((end, index) => heightOf(index ? ends[index - 1] : 0, end))
  return { indices: ends.slice(0, -1), heights: columnHeights, fits: Math.max(...columnHeights) <= availableHeight }
}
