<template>
  <div ref="showcase" class="app-showcase">
    <div class="preview-feature-tabs" role="tablist" aria-label="探索 ZError 功能" @keydown="onTabKeydown">
      <button v-for="feature in features" :id="`${previewId}-tab-${feature.id}`" :key="feature.id" type="button" role="tab"
        :data-feature="feature.id" :aria-selected="activeFeature === feature.id" :aria-controls="`${previewId}-panel`"
        :tabindex="activeFeature === feature.id ? 0 : -1" :class="{ 'is-active': activeFeature === feature.id }"
        @click="activeFeature = feature.id">
        <AppPreviewIcon :name="feature.icon" /><span>{{ feature.label }}</span>
      </button>
    </div>
    <div ref="previewPanel" :id="`${previewId}-panel`" role="tabpanel" :aria-labelledby="`${previewId}-tab-${activeFeature}`" class="preview-panel" :class="{ 'is-flow': activeFeature === 'home' }">
    <AutoAnswerFlow v-if="activeFeature === 'home'" />
    <figure v-else class="app-window-preview" :role="activeFeature === 'study' ? 'group' : 'img'" :aria-label="`ZError ${currentFeature.label}界面：${currentFeature.description}`">
    <div class="preview-window">
      <div class="preview-titlebar" aria-hidden="true">
        <div class="preview-app-name">
          <img src="@/assets/zerror.svg" alt="" width="18" height="18" />
          <span>ZError</span>
        </div>
        <div class="preview-window-controls">
          <span class="preview-minimize"></span>
          <span class="preview-maximize"></span>
          <span class="preview-close"></span>
        </div>
      </div>
      <div class="preview-workspace" :aria-hidden="activeFeature === 'study' ? undefined : true">
        <div class="preview-sidebar">
          <div class="preview-navigation">
            <span v-for="item in navigation" :key="item.icon" class="preview-nav-item" :class="{ 'is-current': item.icon === activeFeature }" :title="item.label">
              <AppPreviewIcon :name="item.icon" />
            </span>
          </div>
          <span class="preview-nav-item preview-settings" :class="{ 'is-current': activeFeature === 'models' }" title="设置"><AppPreviewIcon name="settings" /></span>
        </div>
        <AppPreviewPages :page="activeFeature" />
      </div>
    </div>
    </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import AppPreviewIcon from './AppPreviewIcon.vue'
import AppPreviewPages from './AppPreviewPages.vue'
import AutoAnswerFlow from './AutoAnswerFlow.vue'
import { previewFeatures as features, type PreviewPage } from './appPreviewFeatures'

const showcase = ref<HTMLElement>()
const previewPanel = ref<HTMLElement>()
const previewId = useId()
const activeFeature = ref<PreviewPage>('home')
const currentFeature = computed(() => features.find(feature => feature.id === activeFeature.value)!)

let scrollFrame = 0
let panelObserver: ResizeObserver | undefined
let motionPreference: MediaQueryList | undefined

function updateScrollScale() {
  scrollFrame = 0
  const panel = previewPanel.value
  if (!panel || !panel.clientWidth) return
  const viewportHeight = window.innerHeight
  const panelTop = panel.getBoundingClientRect().top + window.scrollY
  const start = Math.max(0, panelTop - viewportHeight * 0.6)
  const distance = Math.min(360, viewportHeight * 0.4)
  const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance))
  const availableWidth = document.documentElement.clientWidth - 48
  const maxScale = Math.max(1, Math.min(1.12, availableWidth / panel.clientWidth))
  const scale = motionPreference?.matches ? 1 : 1 + (maxScale - 1) * progress
  panel.style.setProperty('--preview-scroll-scale', scale.toFixed(4))
}

function scheduleScrollScale() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollScale)
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', scheduleScrollScale)
  window.addEventListener('scroll', scheduleScrollScale, { passive: true })
  window.addEventListener('resize', scheduleScrollScale, { passive: true })
  panelObserver = new ResizeObserver(scheduleScrollScale)
  if (previewPanel.value) panelObserver.observe(previewPanel.value)
  updateScrollScale()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(scrollFrame)
  panelObserver?.disconnect()
  motionPreference?.removeEventListener('change', scheduleScrollScale)
  window.removeEventListener('scroll', scheduleScrollScale)
  window.removeEventListener('resize', scheduleScrollScale)
})

function onTabKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const index = features.findIndex(feature => feature.id === activeFeature.value)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? features.length - 1
    : (index + (event.key === 'ArrowRight' ? 1 : -1) + features.length) % features.length
  activeFeature.value = features[next]!.id
  showcase.value?.querySelector<HTMLButtonElement>(`[data-feature="${activeFeature.value}"]`)?.focus()
}

const navigation = [
  { icon: 'home', label: '首页' },
  { icon: 'questions', label: '题库' },
  { icon: 'campus', label: '校园题库' },
  { icon: 'study', label: '学习' },
  { icon: 'agent', label: 'Agent' },
] as const
</script>

<style scoped>
.app-showcase { flex: 0 1 auto; width: 55%; max-width: 960px; margin-top: clamp(3rem, 8vh, 6rem); }
.preview-panel { width: 100%; }
.preview-panel.is-flow {
  transform: scale(var(--preview-scroll-scale, 1));
  transform-origin: center top;
}
@media (prefers-reduced-motion: reduce) {
  .preview-panel.is-flow { transform: none; }
}
.app-window-preview {
  container-type: inline-size;
  width: 100%;
  margin: 0;
  aspect-ratio: 1000 / 610;
  border: 1px solid rgb(45 51 61 / 9%);
  border-radius: 10px;
  background: #f5f5f7;
  box-shadow: 0 24px 56px -16px rgb(37 41 48 / 21%), 0 4px 12px rgb(37 41 48 / 5%);
  overflow: hidden;
}
.preview-window {
  height: 100%;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.3cqw;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  user-select: none;
}
.preview-titlebar { height: 3.4cqw; display: flex; align-items: center; justify-content: space-between; }
.preview-app-name { display: flex; align-items: center; gap: 0.8cqw; padding-left: 1.1cqw; font-weight: 600; }
.preview-app-name img { display: block; width: 1.8cqw; height: 1.8cqw; border-radius: 0.4cqw; }
.preview-window-controls { display: flex; align-items: center; gap: 3.5cqw; padding-right: 1.8cqw; color: #6e6e73; }
.preview-window-controls > span { position: relative; display: block; width: 1cqw; height: 1cqw; }
.preview-minimize::before { content: ''; position: absolute; top: 50%; width: 100%; height: 1px; background: currentColor; }
.preview-maximize { border: 1px solid currentColor; border-radius: 0.15cqw; box-sizing: border-box; }
.preview-close::before, .preview-close::after { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: currentColor; transform: rotate(45deg); }
.preview-close::after { transform: rotate(-45deg); }
.preview-workspace { display: flex; height: calc(100% - 3.4cqw); }
.preview-sidebar { display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; width: 5.4cqw; padding-bottom: 0.8cqw; }
.preview-navigation { display: flex; flex-direction: column; align-items: center; }
.preview-nav-item { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; margin: 0.4cqw auto; border-radius: 1cqw; color: #858589; }
.preview-nav-item.is-current { background: #e7e7eb; color: #29292d; }
.preview-nav-item .preview-icon { width: 2cqw; height: 2cqw; }
@media (max-width: 1800px) { .app-showcase { width: 100%; } }
@media (max-width: 600px) { .app-window-preview { border-radius: 6px; } }

.preview-feature-tabs { display: flex; align-items: center; justify-content: center; gap: 0.375rem; margin: 0 auto 1.25rem; width: fit-content; max-width: 100%; padding: 5px; border: 1px solid #f0ede6; border-radius: 99px; background: #faf9f6; }
.preview-feature-tabs button { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; padding: 0.65rem 0.85rem; border: 0; border-radius: 99px; background: transparent; color: #7b8088; font: inherit; font-size: 0.8125rem; line-height: 1.4; white-space: nowrap; cursor: pointer; transition: background-color 160ms ease, color 160ms ease; }
.preview-feature-tabs button.is-active { background: #fff0d3; color: #a5690e; }
.preview-feature-tabs button:focus-visible { outline: 2px solid #fcb334; outline-offset: 2px; }
.preview-feature-tabs .preview-icon { width: 16px; height: 16px; }
@media (hover: hover) and (pointer: fine) { .preview-feature-tabs button:hover { color: #a5690e; background: #fff7e9; } }
@media (prefers-reduced-motion: reduce) { .preview-feature-tabs button { transition: none; } }
@media (max-width: 640px) {
  .app-showcase { margin-top: 1.5rem; }
  .preview-feature-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; box-sizing: border-box; border-radius: 18px; gap: 3px; }
  .preview-feature-tabs button { padding: 0.6rem 0.35rem; font-size: 0.75rem; gap: 0.35rem; }
  .preview-feature-tabs .preview-icon { width: 14px; height: 14px; }
}
</style>
