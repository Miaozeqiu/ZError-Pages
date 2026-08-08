<template>
  <div class="lb-page">
    <header class="lb-hero">
      <h1>模型排行榜</h1>
      <p class="lb-sub">公开题库评测 · 点击查看明细</p>
      <p v-if="meta.effectiveN" class="lb-desc">
        测试集为 ZError 公开题库的文本题，覆盖单选、多选、判断、填空；
        当前有效题量 <strong>{{ formatInt(meta.effectiveN) }}</strong> 道。
        右侧百分比为<strong>正确率</strong>：答对题数 ÷ 有效题量。
      </p>
    </header>

    <div v-if="loading" class="lb-state">加载中…</div>
    <div v-else-if="error" class="lb-state error">{{ error }}</div>

    <div v-else class="lb-board">
      <div class="lb-grid">
        <div class="axis-row" aria-hidden="true">
          <div class="axis-spacer" />
          <div class="axis-icon" />
          <div class="axis-rank" />
          <div class="axis">
            <span
              v-for="tick in axisTicks"
              :key="tick"
              class="axis-tick"
              :style="{ left: tickToLeft(tick) }"
            >{{ tick }}%</span>
          </div>
          <div class="axis-pct" />
        </div>

        <button
          v-for="(m, i) in rankedModels"
          :key="m.id"
          type="button"
          class="lb-row"
          :class="['place-' + Math.min(m.rank, 4)]"
          :style="{ '--i': i }"
          @click="goDetail(m.id)"
        >
          <div class="identity">
            <span class="name">{{ m.displayName || m.name }}</span>
            <span class="provider">{{ m.provider || '' }}</span>
          </div>
          <img
            v-if="modelIcon(m.id)"
            class="icon"
            :src="modelIcon(m.id)"
            alt=""
            loading="lazy"
          />
          <span v-else class="icon icon-fallback" aria-hidden="true" />
          <span class="rank">{{ m.rank }}</span>
          <div class="track">
            <div
              class="fill"
              :style="{ width: barWidth(m.accuracy) }"
            >
              <canvas
                v-if="m.rank === 1"
                class="bar-matrix"
                aria-hidden="true"
                :ref="bindMatrixCanvas"
              />
            </div>
          </div>
          <strong class="pct" :title="pctTitle(m)">{{ formatPct(m.accuracy) }}</strong>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { modelIcon } from '@/utils/modelIcons.js'

export default {
  name: 'LeaderboardView',
  data() {
    return {
      loading: true,
      error: '',
      models: [],
      meta: {
        effectiveN: 0,
        excludedCount: 0,
      },
    }
  },
  computed: {
    rankedModels() {
      return [...this.models].sort((a, b) => (a.rank || 99) - (b.rank || 99))
    },
    barFloor() {
      const accs = this.rankedModels.map((m) => Number(m.accuracy) || 0)
      if (!accs.length) return 0.7
      const min = Math.min(...accs)
      // Round down to nice 5% step, leave ~4pp headroom below lowest
      return Math.max(0, Math.floor((min - 0.04) * 20) / 20)
    },
    axisTicks() {
      const floor = Math.round(this.barFloor * 100)
      const ticks = []
      for (let t = floor; t <= 100; t += 5) ticks.push(t)
      if (ticks[ticks.length - 1] !== 100) ticks.push(100)
      // Avoid overcrowding: if too many, step by 10
      if (ticks.length > 7) {
        const sparse = ticks.filter((t) => t === floor || t === 100 || t % 10 === 0)
        return sparse
      }
      return ticks
    },
  },
  mounted() {
    this.fetchBoard()
  },
  beforeUnmount() {
    this.stopMatrixFx()
    this._matrixEl = null
  },
  methods: {
    modelIcon,
    bindMatrixCanvas(el) {
      this._matrixEl = el || null
      if (el) {
        this.$nextTick(() => this.startMatrixFx())
      } else {
        this.stopMatrixFx()
      }
    },
    async fetchBoard() {
      this.loading = true
      this.error = ''
      try {
        const res = await fetch('/leaderboard/index.json')
        if (!res.ok) throw new Error(`加载失败 (${res.status})`)
        const data = await res.json()
        this.models = Array.isArray(data.models) ? data.models : []
        this.meta = {
          effectiveN: Number(data.effectiveN) || this.models[0]?.n || 0,
          excludedCount: Number(data.excludedCount) || 0,
        }
      } catch (e) {
        this.error = e.message || '加载排行榜失败'
      } finally {
        this.loading = false
      }
    },
    startMatrixFx() {
      this.stopMatrixFx()
      const canvas = this._matrixEl
      if (!canvas || !canvas.getContext) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Fixed LED matrix: cells never move; only brightness changes
      const CELL = 4
      const GAP = 1
      const STEP = CELL + GAP
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let width = 0
      let height = 0
      let cols = 0
      let rows = 0
      let offsetX = 0
      let offsetY = 0
      let visible = true
      let running = true
      let last = performance.now()
      let bright = new Float32Array(0)

      // light pulses that step across the fixed grid (integer columns only)
      const pulses = []
      let spawnWait = 0

      const idx = (c, r) => r * cols + c

      const rebuild = () => {
        const cssW = canvas.clientWidth || canvas.parentElement?.clientWidth || 0
        const cssH = canvas.clientHeight || canvas.parentElement?.clientHeight || 0
        if (cssW < 2 || cssH < 2) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        width = cssW
        height = cssH
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        cols = Math.max(1, Math.floor((width + GAP) / STEP))
        rows = Math.max(1, Math.floor((height + GAP) / STEP))
        offsetX = (width - (cols * STEP - GAP)) / 2
        offsetY = (height - (rows * STEP - GAP)) / 2
        bright = new Float32Array(cols * rows)
        pulses.length = 0
      }

      const draw = (now) => {
        if (!running) return
        this._matrixRaf = requestAnimationFrame(draw)
        if (!visible || document.hidden) {
          last = now
          return
        }
        if (width < 2) rebuild()
        if (width < 2) return

        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        if (!reduceMotion) {
          // continuous emission from the right — no bursty gaps
          spawnWait -= dt
          while (spawnWait <= 0) {
            const r = (Math.random() * rows) | 0
            pulses.push({
              c: cols - 1,
              r,
              peak: 0.95 + Math.random() * 0.4,
              steps: 0,
              fadeRate: 0.7 + Math.random() * 0.9,
              maxSteps: Math.floor(cols * (0.45 + Math.random() * 0.6)),
              skipChance: Math.random() * 0.18,
              stepEvery: 0.05 + Math.random() * 0.05,
              stepAcc: 0,
            })
            const bi = idx(cols - 1, r)
            bright[bi] = Math.max(bright[bi], 1.2)
            // tiny interval → effectively continuous stream
            spawnWait += 0.012 + Math.random() * 0.02
          }

          for (let p = pulses.length - 1; p >= 0; p--) {
            const pulse = pulses[p]
            pulse.stepAcc += dt
            while (pulse.stepAcc >= pulse.stepEvery) {
              pulse.stepAcc -= pulse.stepEvery
              if (Math.random() < pulse.skipChance) {
                pulse.c -= 1
                pulse.steps += 1
              }
              pulse.c -= 1
              pulse.steps += 1
              if (pulse.c < 0 || pulse.steps >= pulse.maxSteps) {
                pulses.splice(p, 1)
                break
              }
              const fade = Math.max(
                0,
                1 - (pulse.steps / pulse.maxSteps) * pulse.fadeRate,
              )
              const endJitter =
                pulse.steps > pulse.maxSteps * 0.55
                  ? 0.5 + Math.random() * 0.5
                  : 0.85 + Math.random() * 0.2
              const g = pulse.peak * fade * endJitter
              if (g < 0.08 && Math.random() < 0.45) {
                pulses.splice(p, 1)
                break
              }
              const bi = idx(pulse.c, pulse.r)
              bright[bi] = Math.max(bright[bi], g)
            }
          }
        }

        // per-cell random decay — disappear unevenly
        for (let i = 0; i < bright.length; i++) {
          const decay = 0.1 + (i % 7) * 0.012 + Math.random() * 0.08
          bright[i] *= Math.pow(decay, dt)
          if (bright[i] < 0.01) bright[i] = 0
        }

        ctx.clearRect(0, 0, width, height)

        // only draw lit cells — idle cells match bar background (transparent)
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const g = bright[idx(c, r)]
            if (g < 0.04) continue

            const x = offsetX + c * STEP
            const y = offsetY + r * STEP
            const level = Math.min(1, g)

            if (g > 0.35) {
              ctx.globalAlpha = Math.min(0.9, (g - 0.25) * 0.85)
              ctx.fillStyle = '#ffd56a'
              ctx.fillRect(x - 0.5, y - 0.5, CELL + 1, CELL + 1)
            }

            ctx.globalAlpha = level
            ctx.fillStyle = g > 0.75 ? '#ffffff' : '#fff3cc'
            ctx.fillRect(x, y, CELL, CELL)
          }
        }
        ctx.globalAlpha = 1
      }

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = !!entry?.isIntersecting
          if (visible) last = performance.now()
        },
        { threshold: 0 },
      )
      io.observe(canvas)
      const ro = new ResizeObserver(() => rebuild())
      ro.observe(canvas.parentElement || canvas)

      rebuild()
      this._matrixIo = io
      this._matrixRo = ro
      this._matrixStop = () => {
        running = false
      }
      this._matrixRaf = requestAnimationFrame(draw)
    },
    stopMatrixFx() {
      this._matrixStop?.()
      this._matrixStop = null
      if (this._matrixRaf) {
        cancelAnimationFrame(this._matrixRaf)
        this._matrixRaf = 0
      }
      this._matrixIo?.disconnect()
      this._matrixRo?.disconnect()
      this._matrixIo = null
      this._matrixRo = null
    },
    formatInt(v) {
      const n = Number(v)
      if (!n && n !== 0) return '—'
      return n.toLocaleString('zh-CN')
    },
    pctTitle(m) {
      const ok = Number(m.correct)
      const n = Number(m.n)
      if (!n) return ''
      return `答对 ${ok.toLocaleString('zh-CN')} / ${n.toLocaleString('zh-CN')}`
    },
    barWidth(accuracy) {
      const floor = this.barFloor
      const span = Math.max(0.01, 1 - floor)
      const pct = Math.max(0, Math.min(100, (((Number(accuracy) || 0) - floor) / span) * 100))
      return pct + '%'
    },
    tickToLeft(tick) {
      const floor = this.barFloor * 100
      const span = Math.max(1, 100 - floor)
      return ((tick - floor) / span) * 100 + '%'
    },
    formatPct(v) {
      if (v == null || Number.isNaN(Number(v))) return '—'
      return (Number(v) * 100).toFixed(1) + '%'
    },
    goDetail(id) {
      this.$router.push({ name: 'leaderboard-model', params: { id } })
    },
  },
}
</script>

<style scoped>
.lb-page {
  --ink: #1c2421;
  --muted: #7d8882;
  --line: rgba(28, 36, 33, 0.08);
  --bar: #c5cbc7;
  --bar-1: #f0b04a;
  --bar-2: #efb65f;
  --bar-3: #f5cc8a;
  --track: #eef1ef;

  width: min(980px, 100%);
  margin: 0 auto;
  padding: 2.75rem 1.25rem 5rem;
  box-sizing: border-box;
}

.lb-hero {
  margin-bottom: 1.75rem;
}

.lb-hero h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-size: clamp(2rem, 4.5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.lb-sub {
  margin: 0.45rem 0 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.lb-desc {
  margin: 0.85rem 0 0;
  max-width: 42rem;
  color: #5f6b65;
  font-size: 0.88rem;
  line-height: 1.65;
}

.lb-desc strong {
  color: var(--ink);
  font-weight: 700;
}

.lb-state {
  padding: 2.5rem;
  text-align: center;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
}

.lb-state.error {
  color: #b42318;
  background: #fff1f0;
}

.lb-board {
  background: #fafbfa;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 1.1rem 1.15rem 1.25rem;
}

.lb-grid {
  display: grid;
  grid-template-columns: max-content 2.15rem 1.5rem minmax(0, 1fr) 3.4rem;
  column-gap: 0.7rem;
  row-gap: 0.4rem;
  align-items: center;
}

.axis-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: end;
  margin-bottom: 0.15rem;
}

.axis {
  position: relative;
  height: 1.15rem;
  border-bottom: 1px dashed rgba(28, 36, 33, 0.1);
}

.axis-tick {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #9aa49e;
  font-variant-numeric: tabular-nums;
}

.lb-row {
  --i: 0;
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  margin: 0;
  padding: 0.5rem 0.35rem;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s cubic-bezier(0.22, 1, 0.36, 1);
  animation: rise-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * 40ms);
}

.lb-row:active {
  transform: scale(0.992);
}

@media (hover: hover) and (pointer: fine) {
  .lb-row:hover {
    background: #eceeee;
  }
}

.identity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.1rem;
  text-align: right;
  white-space: nowrap;
  padding-right: 0.15rem;
}

.name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--ink);
  letter-spacing: -0.015em;
}

.provider {
  font-size: 0.72rem;
  color: var(--muted);
}

.rank {
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 0.92rem;
  color: #b0b8b3;
}

.place-1 .rank { color: #c4841e; }
.place-2 .rank { color: #d4a04a; }
.place-3 .rank { color: #e0b86e; }

.place-1 .pct { color: #9a6a12; }

.icon {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 9px;
  object-fit: cover;
  background: #fff;
  box-shadow: 0 0 0 1px var(--line);
}

.icon-fallback {
  display: block;
  box-sizing: border-box;
}

.track {
  position: relative;
  height: 1.65rem;
  border-radius: 8px;
  background: var(--track);
  overflow: hidden;
  min-width: 0;
}

.place-1 .track {
  overflow: hidden;
}

.lb-row.place-1 {
  z-index: 1;
}

.fill {
  position: relative;
  height: 100%;
  min-width: 0.5rem;
  border-radius: 8px;
  background: var(--bar);
  transform-origin: left center;
  animation: fill-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * 40ms + 60ms);
  overflow: hidden;
}

.place-1 .fill {
  /* baked brightness — avoids live CSS filter over the bar */
  background: #f5bc58;
}
.place-2 .fill {
  background: var(--bar-2);
  filter: brightness(1.04) saturate(1.12);
}
.place-3 .fill { background: var(--bar-3); }

.bar-matrix {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  display: block;
}

.pct {
  text-align: right;
  color: var(--ink);
  font-weight: 700;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fill-in {
  from { transform: scaleX(0.12); opacity: 0.55; }
  to { transform: scaleX(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .lb-row,
  .fill {
    animation: none;
  }
}

@media (max-width: 860px) {
  .lb-page {
    width: 100%;
    padding: 1.75rem 0.75rem 3.5rem;
  }

  .lb-hero {
    margin-bottom: 1.25rem;
  }

  .lb-hero h1 {
    font-size: clamp(1.65rem, 7vw, 2.1rem);
  }

  .lb-sub {
    font-size: 0.88rem;
  }

  .lb-desc {
    font-size: 0.84rem;
    margin-top: 0.75rem;
  }

  .axis-row {
    display: none;
  }

  .lb-board {
    border-radius: 14px;
    padding: 0.35rem 0.4rem 0.55rem;
    background: transparent;
    border: none;
  }

  .lb-grid {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .lb-row {
    display: grid;
    grid-column: auto;
    grid-template-columns: 2.1rem minmax(0, 1fr) 3.45rem;
    grid-template-areas:
      'icon identity rank'
      'bar bar pct';
    column-gap: 0.65rem;
    row-gap: 0.5rem;
    padding: 0.85rem 0.7rem;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: #fff;
    width: 100%;
    box-sizing: border-box;
  }

  .lb-row:hover {
    transform: none;
    background: #fff;
  }

  .icon {
    grid-area: icon;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 8px;
  }

  .icon-fallback {
    grid-area: icon;
  }

  .identity {
    grid-area: identity;
    align-items: flex-start;
    text-align: left;
    white-space: normal;
    padding-right: 0;
    min-width: 0;
  }

  .name {
    font-size: 0.92rem;
    line-height: 1.25;
    word-break: break-word;
  }

  .provider {
    font-size: 0.7rem;
  }

  .rank {
    grid-area: rank;
    align-self: center;
    justify-self: end;
    text-align: right;
    font-size: 0.95rem;
  }

  .track {
    grid-area: bar;
    height: 1.35rem;
    border-radius: 7px;
  }

  .pct {
    grid-area: pct;
    align-self: center;
    justify-self: end;
    font-size: 0.9rem;
    min-width: 0;
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .lb-page {
    /* cancel body side padding so board uses full phone width */
    width: calc(100% + 60px);
    margin-left: -30px;
    margin-right: -30px;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 420px) {
  .lb-row {
    grid-template-columns: 1.9rem minmax(0, 1fr) 3.2rem;
    column-gap: 0.5rem;
    padding: 0.75rem 0.6rem;
  }

  .icon {
    width: 1.9rem;
    height: 1.9rem;
  }

  .name {
    font-size: 0.86rem;
  }

  .pct {
    font-size: 0.84rem;
  }
}
</style>
