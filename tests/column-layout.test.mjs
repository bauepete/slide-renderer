import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveColumns } from '../utils/column-layout.mjs'

test('legacy layouts retain their widths regardless of a columns parameter', () => {
  assert.deepEqual(resolveColumns('General content', 3), { count: 1, width: 1806, error: '' })
  assert.deepEqual(resolveColumns('General content two column', 3), { count: 2, width: 853, error: '' })
})

test('parameterized columns share the existing content region and gutters', () => {
  assert.deepEqual(resolveColumns('General content columns', 1), { count: 1, width: 1806, error: '' })
  assert.deepEqual(resolveColumns('General content columns', 3), { count: 3, width: 1606 / 3, error: '' })
  assert.deepEqual(resolveColumns('General content columns', 4), { count: 4, width: 1506 / 4, error: '' })
})

test('invalid counts fail explicitly with safe fallback geometry', () => {
  for (const count of [undefined, null, '3', 0, -1, 1.5, NaN, Infinity, 20, 1000000]) {
    const result = resolveColumns('General content columns', count)
    assert.ok(result.error)
    assert.equal(result.count, 1)
    assert.equal(result.width, 1806)
  }
})
