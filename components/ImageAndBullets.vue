<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type VNode } from 'vue'
import MarkdownNodes from './MarkdownNodes'
import CalloutContent from './CalloutContent'
import { calloutError } from '../utils/callout.mjs'
import { flattenNodes, imagesIn } from '../utils/markdown-nodes'
import { fitSupportingImage } from '../utils/image-fit.mjs'

const props = defineProps<{ heading: VNode[]; nodes: VNode[]; manualBreak: boolean; callout?: Record<string, unknown>; calloutNodes?: VNode[] }>()
const calloutContent = computed(() => flattenNodes(props.calloutNodes || []))
const calloutProblem = computed(() => calloutError(props.callout, !!calloutContent.value.length))
const images = computed(() => props.nodes.flatMap(imagesIn))
const imageParagraphs = computed(() => props.nodes.filter(node => node.type === 'p' && Array.isArray(node.children) && flattenNodes(node.children).length === 1 && flattenNodes(node.children)[0].type === 'img'))
const lists = computed(() => props.nodes.filter(node => node.type === 'ul' || node.type === 'ol'))
const source = computed(() => String(images.value[0]?.props?.src || ''))
const alt = computed(() => String(images.value[0]?.props?.alt || ''))
const headingElement = ref<HTMLElement>()
const bulletsElement = ref<HTMLElement>()
const imageElement = ref<HTMLImageElement>()
const headingTop = ref(190)
const imageTop = ref(300)
const imageHeight = computed(() => Math.max(0, Math.min(630, 930 - imageTop.value)))
const naturalSize = ref({ width: 0, height: 0 })
const imageSize = computed(() => fitSupportingImage(naturalSize.value.width, naturalSize.value.height, 650, imageHeight.value))
const status = ref('measuring')
const error = ref('')
let generation = 0
let observer: ResizeObserver | undefined

async function measure() {
  const current = ++generation
  await nextTick()
  if (current !== generation) return
  const headingHeight = headingElement.value?.offsetHeight || 0
  headingTop.value = headingHeight > 120 ? 140 : 190
  imageTop.value = Math.max(300, headingTop.value + headingHeight + 48)
  const image = imageElement.value
  if (image?.complete && image.naturalWidth) naturalSize.value = { width: image.naturalWidth, height: image.naturalHeight }
  const unsupported = props.nodes.some(node => node.type !== 'ul' && node.type !== 'ol' && !imageParagraphs.value.includes(node))
  error.value = props.manualBreak ? 'Image-and-bullets does not use ::columnBreak::.'
    : calloutProblem.value ? calloutProblem.value
    : images.value.length !== 1 ? 'Image-and-bullets requires exactly one Markdown image.'
    : !lists.value.length || imageParagraphs.value.length !== 1 || unsupported ? 'Image-and-bullets requires a Markdown bullet list and a separate image paragraph.'
    : !alt.value.trim() ? 'The supporting image requires meaningful alt text.'
    : imageHeight.value < 1 || (bulletsElement.value?.offsetHeight || 0) > imageHeight.value ? 'Content does not fit the Image-and-bullets region at 52 px. Review the approved content.'
    : image?.complete && !image.naturalWidth ? 'The supporting image could not be loaded.' : ''
  status.value = error.value ? 'overflow' : naturalSize.value.width ? 'ready' : 'measuring'
  if (error.value) console.error(error.value)
}

onMounted(async () => {
  await document.fonts.ready
  await measure()
  observer = new ResizeObserver(() => void measure())
  if (headingElement.value) observer.observe(headingElement.value)
  if (bulletsElement.value) observer.observe(bulletsElement.value)
})
watch([() => props.nodes, () => props.heading, () => props.manualBreak, () => props.callout, () => props.calloutNodes], () => {
  naturalSize.value = { width: 0, height: 0 }
  void measure()
})
onBeforeUnmount(() => { generation++; observer?.disconnect() })
</script>

<template>
  <header ref="headingElement" class="course-heading" :style="{ top: `${headingTop}px` }"><MarkdownNodes :nodes="heading" /></header>
  <div class="course-image-and-bullets" :data-layout-status="status" :data-layout-error="error || undefined">
    <div class="course-image-composition" :style="{ top: `${imageTop - 300}px`, height: `${imageHeight}px` }">
      <div ref="bulletsElement" class="course-column">
        <MarkdownNodes :nodes="lists" />
        <CalloutContent v-if="calloutContent.length && !calloutProblem" :nodes="calloutContent" :config="callout!" />
      </div>
      <figure class="course-supporting-image">
        <img v-if="source" ref="imageElement" :key="source" :src="source" :alt="alt" :style="{ width: `${imageSize.width}px`, height: `${imageSize.height}px` }" @load="measure" @error="measure" />
      </figure>
    </div>
  </div>
</template>
