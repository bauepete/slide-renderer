<script setup lang="ts">
import { computed, type Slots } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'
import logo from '../assets/HTLLogo_ab2022_farbig.png'
import department from '../assets/Abteilungslogos.png'
import '../styles.css'
import SlideContent from '../components/SlideContent.vue'
const { $frontmatter, $page, $clicks } = useSlideContext()
const nav = useNav()
function columnBreakNodes(slots: Slots) {
  return Object.keys(slots).filter(name => /^columnBreak(?:\d+)?$/.test(name))
    .sort((left, right) => Number(left.slice(11) || 1) - Number(right.slice(11) || 1))
    .map(name => slots[name]?.() || [])
}
const stages = computed(() => nav.slides.value.map((slide) => {
  const start = slide.meta.slide.frontmatter.clicksStart ?? 0
  const end = slide.meta.clicks ?? slide.meta.slide.frontmatter.clicks ?? 0
  return { no: slide.no, start, count: Math.max(0, end - start) + 1 }
}))
const totalStages = computed(() => stages.value.reduce((total, slide) => total + slide.count, 0))
const currentStage = computed(() => {
  const index = stages.value.findIndex(slide => slide.no === $page.value)
  const slide = stages.value[index]
  const preceding = stages.value.slice(0, index).reduce((total, slide) => total + slide.count, 0)
  return preceding + 1 + Math.max(0, Math.min($clicks.value - slide.start, slide.count - 1))
})
</script>

<template>
  <main class="slidev-layout course" :data-slide-type="$frontmatter.slideType">
    <img class="course-logo" :src="logo" alt="HTL Leonding" />
    <SlideContent :slide-type="$frontmatter.slideType" :columns="$frontmatter.columns" :nodes="$slots.default?.() || []" :column-nodes="columnBreakNodes($slots)" :callout="$frontmatter.callout" :callout-nodes="$slots.callout?.()" />
    <img class="course-department" :src="department" alt="Informatik and Medientechnik departments" />
    <span class="course-page-number" :aria-label="`Presentation stage ${currentStage} of ${totalStages}`">{{ currentStage }}/{{ totalStages }}</span>
  </main>
</template>
