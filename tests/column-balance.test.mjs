import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseColumnBreak, chooseColumnBreaks } from '../utils/column-balance.mjs'

test('five comparable bullets put the extra bullet in the left column', () => {
  assert.equal(chooseColumnBreak([80, 80, 80, 80, 80], 32, 600).index, 3)
})
test('wrapped content changes the break rather than balancing by bullet count', () => {
  const result = chooseColumnBreak([80, 240, 160, 80, 80], 32, 600)
  assert.equal(result.index, 2)
  assert.equal(result.leftHeight, 352)
  assert.equal(result.rightHeight, 384)
  assert.equal(result.fits, true)
})
test('a nested group remains a whole measured unit and overflow is reported', () => {
  const result = chooseColumnBreak([80, 650, 80], 32, 600)
  assert.equal(result.fits, false)
  assert.ok(result.leftHeight >= 650 || result.rightHeight >= 650)
})

test('three columns distribute comparable units in reading order with extras first', () => {
  assert.deepEqual(chooseColumnBreaks(Array(7).fill(80), 32, 600, 3), {
    indices: [3, 5], heights: [304, 192, 192], fits: true,
  })
})

test('generalized two-column balancing exactly preserves the legacy result', () => {
  for (const heights of [[], [80], [80, 80, 80, 80, 80], [80, 240, 160, 80, 80], [80, 650, 80]]) {
    const legacy = chooseColumnBreak(heights, 32, 600)
    assert.deepEqual(chooseColumnBreaks(heights, 32, 600, 2), {
      indices: [legacy.index], heights: [legacy.leftHeight, legacy.rightHeight], fits: legacy.fits,
    })
  }
})

test('empty and sparse content leave only trailing columns empty', () => {
  assert.deepEqual(chooseColumnBreaks([], 32, 600, 3), { indices: [0, 0], heights: [0, 0, 0], fits: true })
  assert.deepEqual(chooseColumnBreaks([80, 160], 32, 600, 4), { indices: [1, 2, 2], heights: [80, 160, 0, 0], fits: true })
  assert.deepEqual(chooseColumnBreaks([80, 160], 32, 600, 1), { indices: [], heights: [272], fits: true })
})

test('N-column balancing finds a feasible whole-unit partition whenever one exists', () => {
  const samples = [[80, 240, 160, 80, 80, 300, 52], [400, 52, 52, 300, 52, 52], [80, 650, 80, 80]]
  for (const heights of samples) {
    for (const columns of [3, 4]) {
      let minimum = Infinity
      function enumerate(start, left, maximum) {
        if (left === 1) {
          const tail = heights.slice(start)
          minimum = Math.min(minimum, Math.max(maximum, tail.reduce((a, b) => a + b, 0) + (tail.length - 1) * 32))
          return
        }
        for (let end = start + 1; end <= heights.length - left + 1; end++) {
          const height = heights.slice(start, end).reduce((a, b) => a + b, 0) + (end - start - 1) * 32
          enumerate(end, left - 1, Math.max(maximum, height))
        }
      }
      enumerate(0, Math.min(columns, heights.length), 0)
      const result = chooseColumnBreaks(heights, 32, 600, columns)
      assert.equal(Math.max(...result.heights), minimum)
      assert.equal(result.fits, minimum <= 600)
    }
  }
})
