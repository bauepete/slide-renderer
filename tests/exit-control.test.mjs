import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileScript, parse } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { site } from './site-fixture.mjs'
import { episodeOverviewUrl } from '../utils/exit-navigation.mjs'

const source = readFileSync(new URL('../components/EpisodeOverviewLink.vue', import.meta.url), 'utf8')
const icon = readFileSync(new URL('../assets/exit.svg', import.meta.url), 'utf8')
const { descriptor } = parse(source)
const compiled = compileScript(descriptor, { id: 'exit-test', inlineTemplate: true }).content
  .replace(/import\s*\{([^}]+)\}\s*from\s*['"]vue['"];?/g, (_, names) =>
    `const {${names.replace(/\bas\b/g, ':')}} = Vue`)
  .replace(/^import .+ from ['"].+['"];?$/gm, '')
  .replace('export default', 'return')

// Mount the real compiled component with Vue's renderer, without browser globals
// other than the URL. This exercises lifecycle, reactivity, and event modifiers.
function mount(t, href) {
  const previousWindow = globalThis.window
  globalThis.window = { location: { href } }
  const nav = {
    isPrintMode: Vue.ref(false), isPresenter: Vue.ref(false), isEmbedded: Vue.ref(false),
    currentFrontmatter: Vue.ref({ slideType: 'Title' }),
  }
  const component = new Function('Vue', 'useNav', 'exitIcon', 'episodeOverviewUrl', 'site', compiled)(Vue, () => nav, icon, episodeOverviewUrl, site)
  const node = type => ({ type, props: {}, children: [] })
  const body = node('body')
  const renderer = Vue.createRenderer({
    querySelector: selector => { assert.equal(selector, 'body'); return body },
    createElement: node, createText: text => ({ ...node('text'), text }),
    createComment: text => ({ ...node('comment'), text }),
    setText: (el, text) => { el.text = text }, setElementText: (el, text) => { el.text = text },
    patchProp: (el, key, old, value) => { el.props[key] = value },
    parentNode: el => el.parent, nextSibling: () => null,
    insert(el, parent) { parent.children.push(el); el.parent = parent },
    remove(el) { el.parent.children.splice(el.parent.children.indexOf(el), 1) },
  })
  const root = node('root')
  const app = renderer.createApp(component)
  app.mount(root)
  t.after(() => { app.unmount(); if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow })
  return { nav, anchor: () => body.children.find(el => el.type === 'a') }
}

test('real control exposes a native, labeled link with an embedded decorative icon', async t => {
  const { anchor } = mount(t, 'https://slides.example.org/sample/Chapter/one.html#/2?clicks=8')
  await Vue.nextTick()
  const link = anchor()
  assert.equal(link.props.href, 'https://slides.example.org/sample/Chapter/')
  assert.equal(link.props['aria-label'], 'Return to episode overview')
  assert.equal(link.props.tabindex, undefined, 'native link remains in the tab order')
  assert.equal(link.children[0].props['aria-hidden'], 'true')
  assert.equal(link.children[0].props.innerHTML, icon)
  assert.match(icon, /fill="currentColor"/)
  assert.doesNotMatch(icon, /<(?:image|script)\b|\bhref=/)
  assert.equal(link.children[1].text, 'Return to episode overview')
  for (const eventName of ['onClick', 'onPointerdown', 'onDblclick', 'onKeydown', 'onKeyup']) {
    let stopped = false
    let prevented = false
    link.props[eventName]({ key: 'Enter', stopPropagation() { stopped = true }, preventDefault() { prevented = true } })
    assert(stopped, eventName + ' must not reach slide navigation')
    assert(!prevented, eventName + ' must preserve native link activation')
  }
})

test('control reacts to print, presenter, embed, and full-image states', async t => {
  const { nav, anchor } = mount(t, 'https://slides.example.org/sample/Chapter/one.html#/1')
  await Vue.nextTick()
  for (const flag of ['isPrintMode', 'isPresenter', 'isEmbedded']) {
    nav[flag].value = true
    await Vue.nextTick()
    assert.equal(anchor(), undefined, flag)
    nav[flag].value = false
    await Vue.nextTick()
    assert(anchor())
  }
  nav.currentFrontmatter.value = { slideType: 'Image' }
  await Vue.nextTick()
  assert.match(anchor().props.class, /course-episode-exit-over-image/)
})

test('local HTML never mounts a hidden or focusable exit link', async t => {
  const { anchor } = mount(t, 'file:///tmp/prologue.html#/1')
  await Vue.nextTick()
  assert.equal(anchor(), undefined)
})

test('built standalone presentation contains the control and SVG without external assets', {
  skip: !process.env.COURSE_PRESENTATION_HTML && 'Set COURSE_PRESENTATION_HTML after building a deck.',
}, () => {
  const html = readFileSync(process.env.COURSE_PRESENTATION_HTML, 'utf8')
  assert.match(html, /course-episode-exit/)
  assert.match(html, /Return to episode overview/)
  assert(html.includes(icon.trim()), 'raw SVG must be embedded in the JavaScript')
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"|(?:src|href)=["'][^"']*exit\.svg/i)
  assert.doesNotMatch(html, /<link\b[^>]*rel="preload"[^>]*as="image"[^>]*href="data:/i)
})
