<script setup lang="ts">
import { computed, type VNode } from 'vue'
import { useSlideContext } from '@slidev/client'
import MarkdownNodes from './MarkdownNodes'
const props = defineProps<{ panels: { source: string; caption: string }[]; credit: VNode[] }>()
const { $clicks } = useSlideContext()
const active = computed(() => Math.max(0, Math.min(props.panels.length - 1, $clicks.value)))
</script>

<template>
  <div class="course-gallery" role="group" aria-label="Project cartoon: read each row from left to right, then continue on the second row" :style="{ gridTemplateColumns: `repeat(${Math.ceil(panels.length / 2)}, 1fr)` }">
    <figure v-for="(panel, index) in panels" :key="index" :aria-current="index === active ? 'true' : undefined">
      <img :src="panel.source" :alt="`${index + 1}. ${panel.caption}`" />
    </figure>
  </div>
  <p class="course-gallery-caption" aria-live="polite">{{ active + 1 }} / {{ panels.length }} · {{ panels[active].caption }}</p>
  <footer class="course-gallery-credit"><MarkdownNodes :nodes="credit" /></footer>
</template>
