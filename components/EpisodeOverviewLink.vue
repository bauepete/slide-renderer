<script setup>
import { computed, onMounted, ref } from 'vue'
import { useNav } from '@slidev/client'
import exitIcon from '../assets/exit.svg?raw'
import { episodeOverviewUrl } from '../utils/exit-navigation.mjs'
import { site } from 'virtual:slide-renderer-config'

const nav = useNav()
const locationHref = ref('')
onMounted(() => { locationHref.value = window.location.href })
const overview = computed(() => episodeOverviewUrl(locationHref.value, {
  site,
  isPrintMode: nav.isPrintMode.value,
  isPresenter: nav.isPresenter.value,
  isEmbedded: nav.isEmbedded.value,
}))
const overImage = computed(() => nav.currentFrontmatter.value.slideType === 'Image')
</script>

<template>
  <Teleport to="body">
  <a
    v-if="overview"
    class="course-episode-exit"
    :class="{ 'course-episode-exit-over-image': overImage }"
    :href="overview"
    aria-label="Return to episode overview"
    @pointerdown.stop
    @click.stop
    @dblclick.stop
    @keydown.stop
    @keyup.stop
  >
    <span class="course-exit-icon" aria-hidden="true" v-html="exitIcon" />
    <span class="course-exit-tooltip" aria-hidden="true">Return to episode overview</span>
  </a>
  </Teleport>
</template>

<style scoped>
.course-episode-exit {
  --course-exit-scale: var(--slidev-slide-scale, 1);
  position: fixed;
  z-index: 30;
  top: calc(max(0px, (100vh - 100vw * 9 / 16) / 2) + 27px * var(--course-exit-scale));
  left: calc(max(0px, (100vw - 100vh * 16 / 9) / 2) + 47px * var(--course-exit-scale));
  display: flex;
  align-items: center;
  justify-content: center;
  width: max(80px * var(--course-exit-scale), 44px);
  height: max(80px * var(--course-exit-scale), 44px);
  padding: calc(8px * var(--course-exit-scale));
  box-sizing: border-box;
  color: #656565;
  background: transparent;
  text-decoration: none;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
  font-weight: 300;
}
.course-exit-icon {
  display: block;
  width: max(64px * var(--course-exit-scale), 24px);
  height: max(64px * var(--course-exit-scale), 24px);
}
.course-exit-icon :deep(svg) { display: block; width: 100%; height: 100%; }
.course-episode-exit-over-image,
.course-episode-exit:hover,
.course-episode-exit:focus-visible { background: #eceff2; }
.course-episode-exit:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
.course-exit-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: max-content;
  max-width: calc(100vw - 48px);
  padding: 8px 16px;
  color: #656565;
  background: #eceff2;
  font-size: max(28px * var(--course-exit-scale), 14px);
  line-height: 1.2;
  visibility: hidden;
  pointer-events: none;
}
.course-episode-exit:hover .course-exit-tooltip,
.course-episode-exit:focus-visible .course-exit-tooltip { visibility: visible; }
@media (max-width: 600px) and (orientation: portrait) {
  .course-episode-exit { top: 12px; left: 12px; width: 44px; height: 44px; padding: 8px; }
  .course-exit-icon { width: 28px; height: 28px; }
}
@media print {
  .course-episode-exit { display: none; }
}
</style>
