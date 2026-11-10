<script setup lang="ts">
import { calloutColors } from '../utils/callout.mjs'
defineProps<{ shape: 'speechBubble' | 'box'; color: keyof typeof calloutColors }>()
</script>

<template>
  <div class="course-callout" :data-callout-shape="shape" :data-callout-color="color" :style="{ '--callout-fill': calloutColors[color] }">
    <svg v-if="shape === 'speechBubble'" class="course-callout-shape" viewBox="0 0 450 212" aria-hidden="true">
      <path d="M 92 157 L 56 212 L 170 172 Z" />
      <ellipse cx="225" cy="88" rx="225" ry="88" />
    </svg>
    <div class="course-callout-text"><slot /></div>
  </div>
</template>
