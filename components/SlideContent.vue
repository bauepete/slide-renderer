<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type VNode } from 'vue'
import MarkdownNodes from './MarkdownNodes'
import ImageGallery from './ImageGallery.vue'
import ImageAndBullets from './ImageAndBullets.vue'
import { contentUnits, flattenNodes, imagesIn, unitNodes } from '../utils/markdown-nodes'
import { chooseColumnBreaks } from '../utils/column-balance.mjs'
import { resolveColumns } from '../utils/column-layout.mjs'

const props = defineProps<{ slideType: string; columns?: unknown; nodes: VNode[]; columnNodes?: VNode[][]; callout?: Record<string, unknown>; calloutNodes?: VNode[] }>()
const nodes = computed(() => flattenNodes(props.nodes))
const heading = computed(() => nodes.value.filter(node => node.type === 'h1'))
const body = computed(() => nodes.value.filter(node => node.type !== 'h1'))
const titleSlide = computed(() => props.slideType === 'Title')
const sectionSlide = computed(() => props.slideType === 'Section')
const imageAndBullets = computed(() => props.slideType === 'Image-and-bullets')
const columnLayout = computed(() => resolveColumns(props.slideType, props.columns))
const columns = computed(() => columnLayout.value.count)
const manualBreak = computed(() => !!props.columnNodes?.length)
const images = computed(() => body.value.flatMap(imagesIn))
const imageBlocks = computed(() => body.value.filter(node => imagesIn(node).length))
const credit = computed(() => body.value.filter(node => !imagesIn(node).length))
const gallery = computed(() => !titleSlide.value && props.slideType !== 'General content columns' && images.value.length > 1 && imageBlocks.value.length === images.value.length)
const panels = computed(() => images.value.map(node => ({ source: String(node.props?.src || ''), caption: String(node.props?.alt || '') })))
const units = computed(() => contentUnits(body.value))
const explicitColumns = computed(() => [units.value, ...(props.columnNodes || []).map(nodes => contentUnits(flattenNodes(nodes)))])
const allMeasuredUnits = computed(() => manualBreak.value ? explicitColumns.value.flat() : units.value)
const headingElement = ref<HTMLElement>()
const measurementElement = ref<HTMLElement>()
const fontSize = ref(64)
const measureFont = ref(64)
const contentTop = ref(355)
const breakIndices = ref<number[]>([])
const breakIndex = computed(() => breakIndices.value[0] ?? units.value.length)
const status = ref('measuring')
const error = ref('')
const contentHeight = computed(() => 950 - contentTop.value)
const contentWidth = computed(() => columnLayout.value.width)
const renderedColumns = computed(() => manualBreak.value ? explicitColumns.value.map(unitNodes)
  : Array.from({ length: columns.value }, (_, index) => unitNodes(units.value.slice(index ? breakIndices.value[index - 1] ?? units.value.length : 0, breakIndices.value[index] ?? units.value.length))))
let generation = 0
let observer: ResizeObserver | undefined

async function measure() {
  const current = ++generation
  await nextTick()
  if (current !== generation) return
  if (titleSlide.value || sectionSlide.value || gallery.value || imageAndBullets.value) { status.value = 'ready'; return }
  if (columnLayout.value.error || (manualBreak.value && (columns.value < 2 || explicitColumns.value.length !== columns.value))) {
    error.value = columnLayout.value.error || `Expected ${columns.value - 1} ::columnBreak:: markers for ${columns.value} columns. Column breaks require a multi-column slide type.`
    status.value = 'overflow'
    console.error(error.value)
    return
  }
  status.value = 'measuring'
  contentTop.value = Math.max(355, 140 + (headingElement.value?.offsetHeight || 0) + 48)
  for (const size of [64, 52]) {
    measureFont.value = size
    await nextTick()
    if (current !== generation) return
    // offsetHeight is already in design-canvas units, independent of Slidev's display scale.
    const measured = [...(measurementElement.value?.children || [])].map(element => (element as HTMLElement).offsetHeight)
    const stackHeight = (values: number[]) => values.reduce((sum, height) => sum + height, 0) + Math.max(0, values.length - 1) * 32
    let fits: boolean
    if (manualBreak.value) {
      let end = 0
      const columnHeights = explicitColumns.value.map(column => {
        const start = end
        end += column.length
        return stackHeight(measured.slice(start, end))
      })
      let count = 0
      breakIndices.value = explicitColumns.value.slice(0, -1).map(column => count += column.length)
      fits = Math.max(...columnHeights) <= contentHeight.value
    } else {
      const result = chooseColumnBreaks(measured, 32, contentHeight.value, columns.value)
      breakIndices.value = result.indices
      fits = result.fits
    }
    if (props.slideType === 'General content columns') {
      fits &&= [...(measurementElement.value?.children || [])].every(element => element.scrollWidth <= (element as HTMLElement).offsetWidth + 1)
    }
    fontSize.value = size
    if (fits) { error.value = ''; status.value = 'ready'; return }
  }
  error.value = 'Content does not fit at the minimum 52 px body size. Review the content or choose another slide type.'
  status.value = 'overflow'
  console.error(error.value)
}

onMounted(async () => {
  await document.fonts.ready
  await measure()
  observer = new ResizeObserver(() => void measure())
  if (headingElement.value) observer.observe(headingElement.value)
})
watch([() => props.nodes, () => props.columnNodes, () => props.slideType, () => props.columns], () => void measure())
onBeforeUnmount(() => { generation++; observer?.disconnect() })
</script>

<template>
  <header v-if="!imageAndBullets" ref="headingElement" class="course-heading"><MarkdownNodes :nodes="heading" /></header>
  <div v-if="titleSlide" class="course-title-content" data-layout-status="ready"><MarkdownNodes :nodes="body" /></div>
  <div v-else-if="sectionSlide" data-layout-status="ready" />
  <ImageAndBullets v-else-if="imageAndBullets" :heading="heading" :nodes="body" :manual-break="manualBreak" :callout="callout" :callout-nodes="calloutNodes" />
  <div v-else-if="gallery" data-layout-status="ready"><ImageGallery :panels="panels" :credit="credit" /></div>
  <template v-else>
    <div class="course-content" :data-columns="columns" :data-column-break="manualBreak ? 'explicit' : 'automatic'" :data-break-index="breakIndex" :data-break-indices="breakIndices.join(',')" :data-layout-status="status" :data-layout-error="error || undefined" :style="{ top: `${contentTop}px`, height: `${contentHeight}px`, fontSize: `${fontSize}px`, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
      <div v-for="(column, index) in renderedColumns" :key="index" class="course-column"><MarkdownNodes :nodes="column" /></div>
    </div>
    <div ref="measurementElement" class="course-measure" aria-hidden="true" :style="{ width: `${contentWidth}px`, fontSize: `${measureFont}px` }">
      <div v-for="(unit, index) in allMeasuredUnits" :key="index" class="course-column"><MarkdownNodes :nodes="unitNodes([unit])" /></div>
    </div>
  </template>
</template>
