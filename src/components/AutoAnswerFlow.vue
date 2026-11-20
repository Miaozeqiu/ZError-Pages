<template>
  <section ref="root" class="auto-answer-flow" :class="{ 'is-paused': !canPlay, 'is-reduced': reducedMotion }" :data-phase="phase" aria-label="学习通、OCS 与 ZError 自动答题流程动画">
    <div class="flow-diagram" role="img" aria-label="学习通题目由 OCS 读取并发送给本机 ZError。优先查询本地题库，命中直接返回；未命中时调用多个模型，可选汇总后将答案交给 OCS 回填。">
      <svg :key="'routes-' + phase" ref="routes" class="flow-routes" viewBox="0 0 1000 450" fill="none" aria-hidden="true">
        <defs>
          <linearGradient v-for="beam in activeBeams" :id="beam.id" :key="beam.id" gradientUnits="userSpaceOnUse" :x1="beam.from - beam.direction * 80" y1="0" :x2="beam.from - beam.direction * 20" y2="0">
            <stop :stop-color="beam.color" stop-opacity="0" />
            <stop offset="0.4" :stop-color="beam.color" stop-opacity="0.5" />
            <stop offset="0.75" :stop-color="beam.color" />
            <stop offset="1" :stop-color="beam.color" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path v-for="route in architectureRoutes" :key="route.id" :d="route.path" class="flow-route" />
        <path v-for="beam in activeBeams" :key="beam.id" :d="beam.path" :stroke="'url(#' + beam.id + ')'" class="flow-beam" />
      </svg>

      <div class="flow-learning-node" :class="{ 'is-reading': phase === 0, 'is-filled': answerFilled }" aria-hidden="true">
        <div class="flow-learning-card">
          <div class="flow-browser-chrome"><i></i><i></i><i></i><span>章节练习</span></div>
          <div class="flow-learning-body">
            <div class="flow-learning-name"><img :src="chaoxingIcon" alt="" /><strong>学习通</strong><span>课程作业</span></div>
            <div class="flow-question-scan">
              <div class="flow-question-type">单选题 <span>1 / 1</span></div>
              <h4>函数 f(x) = x² 的导数是？</h4>
              <div v-for="option in options" :key="option.letter" class="flow-option" :class="{ 'is-answer': answerFilled && option.letter === 'B' }"><span>{{ option.letter }}</span>{{ option.text }}<AppPreviewIcon v-if="answerFilled && option.letter === 'B'" name="check" /></div>
            </div>
          </div>
        </div>
        <div class="flow-learning-status"><span v-if="answerFilled"><AppPreviewIcon name="circle-check" />答案已回填</span><span v-else-if="phase === 0" class="flow-reading-text">OCS 正在读取题目…</span><span v-else>等待答案返回</span></div>
      </div>

      <div class="flow-icon-node flow-ocs" :class="{ 'is-active': phase === 0 || phase === 1 || phase >= 5 }" aria-hidden="true">
        <div class="flow-icon-circle"><AppPreviewIcon name="ocs" /><span v-if="ocsReceived" class="flow-ocs-check"><AppPreviewIcon name="check" /></span></div>
        <strong>OCS 网课助手</strong>
      </div>

      <div class="flow-icon-node flow-zerror" :class="{ 'is-active': phase >= 1 && phase <= 4, 'is-complete': phase >= 5 }" aria-hidden="true">
        <div class="flow-icon-circle"><img src="@/assets/zerror.svg" alt="" /></div>
        <strong>ZError</strong>
        <span class="flow-hub-status" :class="{ 'is-answer': phase >= 5 }"><AppPreviewIcon v-if="phase >= 5" name="check" />{{ hubStatus }}</span>
      </div>
      <div class="flow-icon-node flow-local" :class="{ 'is-active': phase === 2 }" aria-hidden="true">
        <div class="flow-icon-circle"><AppPreviewIcon name="database" /></div>
        <span>本地题库</span>
      </div>
      <div :key="'models-' + phase" class="flow-models" aria-hidden="true">
        <div v-for="(model, index) in parallelModels" :key="model.name" class="flow-icon-node flow-model" :class="{ 'is-thinking': phase === 3, 'is-complete': phase >= 4 }" :style="{ '--model-index': index }">
          <div class="flow-icon-circle"><img class="flow-provider-logo" :src="model.icon" alt="" /><span class="flow-model-check"><AppPreviewIcon name="check" /></span></div>
          <span>{{ model.name }}</span>
        </div>
      </div>
    </div>

    <div class="flow-footer">
      <ol class="flow-steps" aria-label="答题流程步骤">
        <li v-for="(step, index) in phases" :key="step.label" :aria-label="step.label" :aria-current="phase === index ? 'step' : undefined" :class="{ active: phase === index, done: phase > index }"><span aria-hidden="true"></span></li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import AppPreviewIcon from './AppPreviewIcon.vue'
import chaoxingIcon from '@/assets/chaoxing.png'

const root = ref<HTMLElement>()
const routes = ref<SVGSVGElement>()
const phase = ref(0)
const inView = ref(false)
const pageVisible = ref(true)
const reducedMotion = ref(false)
const transferComplete = ref(false)
const ocsReceived = computed(() => phase.value > 5 || (phase.value === 5 && transferComplete.value))
const answerFilled = computed(() => phase.value === 6 && (transferComplete.value || reducedMotion.value))
const canPlay = computed(() => inView.value && pageVisible.value && !reducedMotion.value)
const parallelModels = [{ name: 'DeepSeek', icon: '/models/deepseek.png' }, { name: 'Qwen', icon: '/models/qwen.png' }, { name: 'GLM', icon: '/models/glm.png' }]
const beamId = useId().replace(/:/g, '')
const hubStatus = computed(() => ['等待题目', '收到题目', '检索题库', '并发思考', '汇总答案', 'B. 2x', 'B. 2x'][phase.value])

const options = [{ letter: 'A', text: 'x' }, { letter: 'B', text: '2x' }, { letter: 'C', text: 'x²' }]
const phases = [
  { label: '读取题目', description: '读取学习通题目', duration: 1400 },
  { label: '发送请求', description: 'OCS 发送题目', duration: 1300 },
  { label: '本地检索', description: '先查本地题库，命中即返回', duration: 1700 },
  { label: '并发回答', description: '未命中时，多个模型并行回答', duration: 3000 },
  { label: '汇总答案', description: '汇总回答，生成最终答案', duration: 1700 },
  { label: '返回答案', description: '答案返回 OCS', duration: 1500 },
  { label: '完成回填', description: '选项自动回填', duration: 2900 },
]
// The same curves carry requests outward and answers back to the ZError hub.
const architectureRoutes = [
  { id: 'read', path: 'M270 153C312 153 324 207 365 207', from: 270, to: 365 },
  { id: 'request', path: 'M425 207C480 188 520 188 571 207', from: 425, to: 571 },
  { id: 'local', path: 'M637 190C700 120 745 80 822 80', from: 637, to: 822 },
  { id: 'model-one', path: 'M650 220C720 220 744 180 822 180', from: 650, to: 822 },
  { id: 'model-two', path: 'M650 220C730 220 742 270 822 270', from: 650, to: 822 },
  { id: 'model-three', path: 'M650 220C720 220 742 360 822 360', from: 650, to: 822 },
  { id: 'return', path: 'M571 233C520 252 480 252 425 233', from: 571, to: 425 },
  { id: 'fill', path: 'M365 233C324 233 312 273 270 273', from: 365, to: 270 },
]
type BeamStep = { route: string; reverse?: boolean; begin?: number; duration?: number; answer?: boolean }
const beamsByPhase: Record<number, BeamStep[]> = {
  0: [{ route: 'read' }],
  1: [{ route: 'request' }],
  2: [{ route: 'local', duration: 0.8 }, { route: 'local', reverse: true, begin: 0.85, duration: 0.75 }],
  3: ['model-one', 'model-two', 'model-three'].map((route, index) => ({ route, begin: index * 0.12 })),
  4: ['model-one', 'model-two', 'model-three'].map((route, index) => ({ route, reverse: true, begin: index * 0.15, answer: true })),
  5: [{ route: 'return', answer: true }],
  6: [{ route: 'fill', answer: true }],
}
const activeBeams = computed(() => {
  if (reducedMotion.value) return []
  return (beamsByPhase[phase.value] || []).map((step, index) => {
    const route = architectureRoutes.find(route => route.id === step.route)!
    const from = step.reverse ? route.to : route.from
    const to = step.reverse ? route.from : route.to
    return {
      id: `${beamId}-beam-${index}`, path: route.path, from, to,
      direction: Math.sign(to - from), color: step.answer ? '#89b79d' : '#ffb52e',
      begin: step.begin ?? 0, duration: step.duration ?? 1.1,
    }
  })
})

let timer: ReturnType<typeof setTimeout> | undefined
let remaining = phases[0]!.duration
let startedAt = 0
let observer: IntersectionObserver | undefined
let motionQuery: MediaQueryList | undefined
let beamFrame = 0
let gradients: SVGLinearGradientElement[] = []

function drawBeams() {
  beamFrame = 0
  const elapsed = (phases[phase.value]!.duration - remaining
    + (timer === undefined ? 0 : performance.now() - startedAt)) / 1000
  let pending = false
  gradients.forEach((gradient, index) => {
    const beam = activeBeams.value[index]
    if (!beam) return
    const progress = Math.max(0, Math.min(1, (elapsed - beam.begin) / beam.duration))
    const offset = (beam.to - beam.from + beam.direction * 100) * progress
    gradient.setAttribute('x1', String(beam.from - beam.direction * 80 + offset))
    gradient.setAttribute('x2', String(beam.from - beam.direction * 20 + offset))
    if (progress < 1) pending = true
  })
  transferComplete.value = gradients.length > 0 && !pending
  if (canPlay.value && pending) beamFrame = requestAnimationFrame(drawBeams)
}

function stopTimer(preserveRemaining = true) {
  if (timer === undefined) return
  clearTimeout(timer)
  timer = undefined
  if (preserveRemaining) remaining = Math.max(0, remaining - (performance.now() - startedAt))
}
function schedule() {
  if (!canPlay.value || timer !== undefined) return
  startedAt = performance.now()
  timer = setTimeout(() => {
    timer = undefined
    phase.value = (phase.value + 1) % phases.length
  }, remaining)
}
watch(phase, () => {
  transferComplete.value = false
  stopTimer(false)
  remaining = phases[phase.value]!.duration
  schedule()
})
watch(canPlay, playing => { if (playing) schedule(); else stopTimer() })
watch([phase, canPlay], async () => {
  await nextTick()
  cancelAnimationFrame(beamFrame)
  gradients = Array.from(routes.value?.querySelectorAll('linearGradient') ?? [])
  drawBeams()
})
function onVisibility() { pageVisible.value = document.visibilityState === 'visible' }
function onMotionChange() {
  reducedMotion.value = motionQuery?.matches ?? false
  if (reducedMotion.value) phase.value = phases.length - 1
}
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', onMotionChange)
  onMotionChange()
  onVisibility()
  document.addEventListener('visibilitychange', onVisibility)
  observer = new IntersectionObserver(entries => { inView.value = entries[0]?.isIntersecting ?? false }, { threshold: 0.15 })
  if (root.value) observer.observe(root.value)
})
onUnmounted(() => { clearTimeout(timer); cancelAnimationFrame(beamFrame); observer?.disconnect(); motionQuery?.removeEventListener('change', onMotionChange); document.removeEventListener('visibilitychange', onVisibility) })
</script>

<style scoped>
.auto-answer-flow { container-type: inline-size; width: 100%; overflow: hidden; border: 1px solid #efeeeb; border-radius: 18px; background: #fff; text-align: left; box-shadow: 0 12px 40px -24px rgb(39 41 47 / 10%); }
.auto-answer-flow * { box-sizing: border-box; }
.flow-footer { position: relative; }
.flow-diagram { position: relative; width: 100%; height: 45cqw; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif; }
.flow-routes { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; overflow: visible; }
.flow-route { stroke: #e8e7e4; stroke-width: 1.6; stroke-linecap: round; }
.flow-beam { stroke-width: 2.2; stroke-linecap: round; }
.flow-learning-node { position: absolute; z-index: 2; left: 3%; top: 48.8889%; width: 24%; transform: translateY(-50%); }
.flow-learning-card { overflow: hidden; border: 1px solid #e8e8eb; border-radius: 1.3cqw; background: #fff; box-shadow: 0 1px 3px rgb(47 48 57 / 2%), 0 0.7cqw 2cqw rgb(47 48 57 / 4%); transition: border-color 180ms ease, box-shadow 180ms ease; }
.is-reading .flow-learning-card { border-color: #e8c58b; box-shadow: 0 0 0 0.25cqw rgb(240 184 82 / 5%), 0 0.7cqw 2cqw rgb(47 48 57 / 4%); }
.flow-browser-chrome { display: flex; align-items: center; gap: 0.4cqw; height: 2.4cqw; padding: 0 1cqw; background: #f5f5f7; color: #b1b0b5; }
.flow-browser-chrome i { width: 0.45cqw; height: 0.45cqw; border-radius: 50%; background: #d6d6db; }
.flow-browser-chrome > span { margin-left: 1.1cqw; font-size: 0.8cqw; }
.flow-learning-body { padding: 1.4cqw; }
.flow-learning-name { display: flex; align-items: center; gap: 0.7cqw; }
.flow-learning-name img { width: 2.6cqw; height: 2.6cqw; border-radius: 0.55cqw; }
.flow-learning-name strong { font-size: 1.5cqw; color: #4d4844; font-weight: 600; }
.flow-learning-name > span { margin-left: auto; color: #a49d93; font-size: 0.95cqw; }
.flow-question-scan { position: relative; overflow: hidden; margin-top: 1.6cqw; }
.is-reading .flow-question-scan::after {
  content: '';
  position: absolute;
  z-index: 1;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-bottom: 1px solid rgb(252 179 52 / 90%);
  background: linear-gradient(transparent 75%, rgb(252 179 52 / 4%) 88%, rgb(252 179 52 / 18%));
  box-shadow: 0 3px 10px rgb(252 179 52 / 16%);
  animation: flow-scan 1400ms linear both;
}
.flow-question-type { font-size: 1cqw; color: #a59b8d; }.flow-question-type > span { float: right; }
.flow-learning-body h4 { margin: 0.7cqw 0 1.3cqw; color: #49443f; font-size: 1.35cqw; font-weight: 500; line-height: 1.6; }
.flow-option { display: flex; align-items: center; gap: 0.8cqw; padding: 0.65cqw 0.7cqw; margin-bottom: 0.4cqw; border: 1px solid #f0eee9; border-radius: 0.5cqw; color: #8c8376; font-size: 1.15cqw; transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease; }
.flow-option:last-child { margin-bottom: 0; }
.flow-option > span { display: grid; place-items: center; width: 1.5cqw; height: 1.5cqw; border: 1px solid #e7e3dd; border-radius: 50%; font-size: 0.8cqw; }
.flow-option .preview-icon { width: 1.2cqw; height: 1.2cqw; margin-left: auto; }
.flow-option.is-answer { border-color: #b4d9c3; background: #f1f9f4; color: #599d77; }
.flow-option.is-answer > span { background: #83b99b; border-color: #83b99b; color: white; }
.flow-learning-status { margin-top: 1.2cqw; min-height: 1.5cqw; color: #a89f91; font-size: 1cqw; line-height: 1.5; }
.flow-learning-status > span { display: flex; align-items: center; justify-content: center; gap: 0.4cqw; }.flow-learning-status .preview-icon { width: 1.1cqw; height: 1.1cqw; }.is-filled .flow-learning-status { color: #6caa87; }.flow-reading-text { color: #bd985b; }

.flow-icon-node { position: absolute; z-index: 2; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); width: 13cqw; }
.flow-icon-circle { position: relative; display: grid; place-items: center; flex-shrink: 0; width: 5.6cqw; height: 5.6cqw; border: 1px solid #e9e8e5; border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgb(36 38 43 / 3%), 0 5px 18px rgb(36 38 43 / 5%); transition: border-color 200ms ease, box-shadow 200ms ease; }
.flow-icon-node > span:not(.flow-hub-status), .flow-icon-node > strong { position: absolute; top: calc(100% + 0.9cqw); color: #8e8b84; font-size: 1.1cqw; line-height: 1.4; font-weight: 400; white-space: nowrap; }
.flow-icon-node.is-active .flow-icon-circle, .flow-model.is-thinking .flow-icon-circle { border-color: #f2d59c; box-shadow: 0 2px 4px rgb(36 38 43 / 3%), 0 5px 20px rgb(243 183 66 / 10%); }
.flow-ocs { left: 39.5%; top: 48.8889%; }
.flow-ocs .flow-icon-circle { width: 6.4cqw; height: 6.4cqw; }
.flow-ocs .flow-icon-circle > .preview-icon { width: 3.4cqw; height: 3.4cqw; color: #8094ab; }
.flow-zerror { left: 61%; top: 48.8889%; }
.flow-zerror .flow-icon-circle { width: 8cqw; height: 8cqw; }
.flow-zerror img { width: 4.2cqw; height: 4.2cqw; border-radius: 1cqw; }
.flow-zerror > strong { color: #57544e; font-size: 1.5cqw; font-weight: 600; }
.flow-hub-status { position: absolute; top: calc(100% + 3.4cqw); display: flex; align-items: center; gap: 0.3cqw; color: #b4aea1; font-size: 1.05cqw; white-space: nowrap; }
.flow-hub-status.is-answer { color: #79a18a; }
.flow-hub-status .preview-icon { width: 1.15cqw; height: 1.15cqw; }
.flow-local { left: 85%; top: 17.7778%; }
.flow-local .preview-icon { width: 2.4cqw; height: 2.4cqw; color: #a29a8a; }
.flow-models { position: absolute; inset: 0; }
.flow-model { left: 85%; top: calc(40% + var(--model-index) * 20%); }
.flow-provider-logo { display: block; width: 2.7cqw; height: 2.7cqw; object-fit: contain; }
.flow-model-check, .flow-ocs-check { position: absolute; right: -0.1cqw; bottom: -0.1cqw; display: grid; place-items: center; width: 1.55cqw; height: 1.55cqw; border: 2px solid #fff; border-radius: 50%; background: #8db49b; color: #fff; }
.flow-model-check { opacity: 0; }
.flow-model-check .preview-icon, .flow-ocs-check .preview-icon { width: 0.9cqw; height: 0.9cqw; }
.flow-model.is-thinking .flow-model-check { animation: flow-confirm 180ms cubic-bezier(0.23, 1, 0.32, 1) calc(1.4s + var(--model-index) * 0.45s) both; }
.flow-model.is-complete .flow-model-check { opacity: 1; }
.flow-steps { display: flex; align-items: center; justify-content: center; height: 5cqw; margin: 0; padding: 0; list-style: none; }
.flow-steps li { display: grid; place-items: center; width: 2.5cqw; height: 2.5cqw; padding: 0; border: 0; border-radius: 50%; background: transparent; }
.flow-steps li > span { display: block; width: 0.45cqw; height: 0.45cqw; border-radius: 50%; background: #e9e7e3; transition: background-color 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1); }
.flow-steps li.active > span { background: #ffb52e; transform: scale(1.4); }
.flow-steps li.done > span { background: #d2dace; }
.flow-option.is-answer .preview-icon { animation: flow-confirm 180ms cubic-bezier(0.23, 1, 0.32, 1) both; }
@keyframes flow-scan {
  0% { transform: translateY(0); opacity: 0; }
  10%, 85% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}
@keyframes flow-confirm { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }

.is-paused .is-reading .flow-question-scan::after, .is-paused .flow-model.is-thinking .flow-model-check, .is-paused .flow-option.is-answer .preview-icon { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .flow-learning-card, .flow-option, .flow-icon-circle, .flow-steps li > span { transition: none; }.flow-question-scan::after { display: none; }.flow-option.is-answer .preview-icon, .flow-model.is-thinking .flow-model-check { animation: none; } }
@media (max-width: 640px) {
  .auto-answer-flow { border-radius: 12px; }
  .flow-steps { height: 36px; }.flow-steps li { width: 24px; height: 24px; }.flow-steps li > span { width: 3px; height: 3px; }
}
</style>
