<template>
  <div class="lb-page">
    <header class="lb-hero">
      <h1>模型排行榜</h1>
      <p class="lb-sub">公开题库评测 · 点击查看明细</p>
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
            />
          </div>
          <strong class="pct">{{ formatPct(m.accuracy) }}</strong>
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
  methods: {
    modelIcon,
    async fetchBoard() {
      this.loading = true
      this.error = ''
      try {
        const res = await fetch('/leaderboard/index.json')
        if (!res.ok) throw new Error(`加载失败 (${res.status})`)
        const data = await res.json()
        this.models = Array.isArray(data.models) ? data.models : []
      } catch (e) {
        this.error = e.message || '加载排行榜失败'
      } finally {
        this.loading = false
      }
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
  --bar-1: #e8a03a;
  --bar-2: #efb65f;
  --bar-3: #f5cc8a;
  --track: #eef1ef;
  --hover: #fff9f0;

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

.lb-row:hover {
  background: var(--hover);
  border-color: var(--line);
}

.lb-row:active {
  transform: scale(0.992);
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
  height: 1.65rem;
  border-radius: 8px;
  background: var(--track);
  overflow: hidden;
  min-width: 0;
}

.fill {
  height: 100%;
  min-width: 0.5rem;
  border-radius: 8px;
  background: var(--bar);
  transform-origin: left center;
  animation: fill-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * 40ms + 60ms);
}

.place-1 .fill { background: var(--bar-1); }
.place-2 .fill { background: var(--bar-2); }
.place-3 .fill { background: var(--bar-3); }

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

@media (max-width: 720px) {
  .axis-row {
    display: none;
  }

  .lb-grid {
    grid-template-columns: max-content 2rem 1.35rem minmax(0, 1fr) 3.2rem;
    column-gap: 0.5rem;
  }

  .lb-page {
    padding-left: 0.85rem;
    padding-right: 0.85rem;
  }
}
</style>
