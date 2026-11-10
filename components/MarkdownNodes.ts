import { defineComponent, Fragment, h, type PropType, type VNode } from 'vue'
import { copyNode } from '../utils/markdown-nodes'

export default defineComponent({
  props: { nodes: { type: Array as PropType<VNode[]>, required: true } },
  setup: props => () => h(Fragment, props.nodes.map(copyNode)),
})
