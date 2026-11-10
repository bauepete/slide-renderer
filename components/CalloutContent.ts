import { defineComponent, Fragment, h, type PropType, type VNode } from 'vue'
import VClick from '@slidev/client/builtin/VClick.ts'
import CourseCallout from './CourseCallout.vue'
import { calloutNodes } from '../utils/callout.mjs'
import { flattenNodes } from '../utils/markdown-nodes'

export default defineComponent({
  props: {
    nodes: { type: Array as PropType<VNode[]>, required: true },
    config: { type: Object, required: true },
  },
  setup: props => () => h(Fragment, calloutNodes(flattenNodes(props.nodes), props.config, CourseCallout, VClick)),
})
