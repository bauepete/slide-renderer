import { Comment, Fragment, Text, cloneVNode, h, isVNode, type VNode } from 'vue'

export function flattenNodes(nodes: unknown[]): VNode[] {
  return nodes.flatMap(node => {
    if (!isVNode(node) || node.type === Comment) return []
    if (node.type === Fragment) return flattenNodes((node.children || []) as unknown[])
    if (node.type === Text && !String(node.children || '').trim()) return []
    return [node]
  })
}

export function copyNode(node: VNode): VNode {
  const copy = cloneVNode(node)
  if (Array.isArray(node.children)) copy.children = node.children.map(child => isVNode(child) ? copyNode(child) : child)
  copy.el = null
  copy.anchor = null
  return copy
}

export interface ContentUnit {
  node: VNode
  list?: { type: 'ul' | 'ol'; props: Record<string, unknown>; id: number }
}

export function contentUnits(nodes: VNode[]): ContentUnit[] {
  return nodes.flatMap((node, id) => {
    if (node.type === 'ul' || node.type === 'ol') {
      const list = { type: node.type, props: node.props || {}, id }
      return flattenNodes((node.children || []) as unknown[]).map(child => ({ node: child, list }))
    }
    return [{ node }]
  })
}

export function unitNodes(units: ContentUnit[]): VNode[] {
  const result: VNode[] = []
  let previous: ContentUnit | undefined
  for (const unit of units) {
    if (unit.list && previous?.list === unit.list) {
      ;(result[result.length - 1].children as VNode[]).push(copyNode(unit.node))
    } else if (unit.list) {
      result.push(h(unit.list.type, unit.list.props, [copyNode(unit.node)]))
    } else result.push(copyNode(unit.node))
    previous = unit
  }
  return result
}

export function imagesIn(node: VNode): VNode[] {
  if (node.type === 'img') return [node]
  return Array.isArray(node.children) ? flattenNodes(node.children).flatMap(imagesIn) : []
}
