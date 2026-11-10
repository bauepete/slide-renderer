import test from 'node:test'
import assert from 'node:assert/strict'
import { fitSupportingImage } from '../utils/image-fit.mjs'

test('wide and tall supporting images fit without cropping or distortion', () => {
  assert.deepEqual(fitSupportingImage(2400, 1200, 650, 630), { width: 650, height: 325 })
  assert.deepEqual(fitSupportingImage(1200, 2400, 650, 630), { width: 315, height: 630 })
})

test('small artwork stays at 2x source resolution and wrapping titles reduce available height', () => {
  assert.deepEqual(fitSupportingImage(1254, 1254, 650, 630), { width: 627, height: 627 })
  assert.deepEqual(fitSupportingImage(1254, 1254, 650, 526), { width: 526, height: 526 })
})

test('missing dimensions never produce invalid image geometry', () => {
  assert.deepEqual(fitSupportingImage(0, 0, 650, 630), { width: 0, height: 0 })
  assert.deepEqual(fitSupportingImage(1254, 1254, 650, -1), { width: 0, height: 0 })
})
