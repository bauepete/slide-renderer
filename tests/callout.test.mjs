import test from 'node:test'
import assert from 'node:assert/strict'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { calloutError, calloutNodes } from '../utils/callout.mjs'

const Callout = { props: ['shape', 'color'], setup: (props, { slots }) => () => h('aside', { 'data-shape': props.shape, 'data-color': props.color }, slots.default()) }
const VClick = { props: ['at', 'hide'], setup: (props, { slots }) => () => h('div', { 'data-at': props.at, 'data-hide': props.hide }, slots.default()) }
const config = { shape: 'speechBubble', color: 'red' }

test('native click props stay outside the complete bubble and its text', async () => {
  const original = h(VClick, { at: 2, hide: true }, { default: () => [h('p', 'Panic!!!')] })
  const nodes = calloutNodes([original], config, Callout, VClick)
  assert.equal(nodes[0].type, VClick)
  assert.equal(original.children.default()[0].type, 'p')
  const html = await renderToString(nodes[0])
  assert.match(html, /^<div data-at="2" data-hide="true"><aside data-shape="speechBubble" data-color="red"><p>Panic!!!<\/p><\/aside><\/div>$/)
})

test('plain callout text renders immediately without a click wrapper', async () => {
  const [node] = calloutNodes([h('p', 'A thought')], { shape: 'box', color: 'gray' }, Callout, VClick)
  assert.equal(node.type, Callout)
  assert.match(await renderToString(node), /^<aside data-shape="box" data-color="gray"><p>A thought<\/p><\/aside>$/)
})

test('missing content and unsupported shape/color report actionable errors', () => {
  assert.equal(calloutError(undefined, false), '')
  assert.equal(calloutError(config, true), '')
  assert.match(calloutError(config, false), /content/)
  assert.match(calloutError(undefined, true), /frontmatter/)
  assert.match(calloutError({ ...config, shape: 'circle' }, true), /shape/)
  assert.match(calloutError({ ...config, color: 'blue' }, true), /color/)
})
