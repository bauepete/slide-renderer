import { cloneVNode, h } from 'vue'

// Fills sampled from template 08. Color names are authoring tokens, not arbitrary CSS.
export const calloutColors = { gray: '#818785', red: '#9d2916', amber: '#d09a3b' }

export function calloutError(config, hasContent) {
  if (!config && !hasContent) return ''
  if (!hasContent) return 'callout frontmatter requires content after ::callout::.'
  if (!config || typeof config !== 'object' || Array.isArray(config)) return '::callout:: requires callout frontmatter with shape and color.'
  if (!['speechBubble', 'box'].includes(config.shape)) return 'callout.shape must be speechBubble or box.'
  if (!Object.hasOwn(calloutColors, config.color)) return 'callout.color must be gray, red, or amber.'
  return ''
}

// Keep the native VClick (including at/hide/fade props) outside the whole shape.
// Styling the slot's parent would otherwise leave the bubble visible before its text.
export function calloutNodes(nodes, config, Callout, VClick) {
  const shape = content => h(Callout, config, { default: () => content })
  if (nodes.length === 1 && nodes[0].type === VClick) {
    const click = cloneVNode(nodes[0])
    const slots = nodes[0].children
    click.children = { ...slots, default: () => [shape(slots.default?.() || [])] }
    click.dynamicChildren = null
    click.patchFlag = -2
    return [click]
  }
  return [shape(nodes)]
}
