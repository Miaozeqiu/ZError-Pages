<template>
  <div
    ref="root"
    class="virtual-list"
    @scroll.passive="onScroll"
  >
    <div class="virtual-inner" :style="{ height: totalHeight + 'px' }">
      <article
        v-for="item in visibleItems"
        :key="item.index"
        class="q-card"
        :data-q-index="item.index"
        :class="{ wrong: !item.correct, error: !!item.error }"
        :style="{ transform: `translateY(${item._offset}px)` }"
      >
        <div class="q-top">
          <span class="q-index">#{{ item.index }}</span>
          <span class="q-tag" :class="item.correct ? 'ok' : 'bad'">
            {{ item.error ? '报错' : (item.correct ? '正确' : '错误') }}
          </span>
          <span v-if="item.score_reason" class="q-reason">{{ item.score_reason }}</span>
        </div>
        <div class="q-title">{{ item.title }}</div>
        <pre v-if="item.options" class="q-options">{{ item.options }}</pre>
        <div class="q-answers">
          <div><span>标准</span>{{ item.gold || '—' }}</div>
          <div><span>预测</span>{{ item.pred || '—' }}</div>
        </div>
        <div v-if="item.error" class="q-error">{{ item.error }}</div>
      </article>
    </div>
  </div>
</template>

<script>
const ESTIMATE = 180
const GAP = 12
const OVERSCAN_PX = 800

export default {
  name: 'VirtualQuestionList',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      scrollTop: 0,
      viewportHeight: 480,
      /** @type {Record<number, number>} */
      heights: {},
      measureTick: 0,
    }
  },
  computed: {
    layout() {
      void this.measureTick
      const items = this.items
      const offsets = new Array(items.length)
      let y = 0
      for (let i = 0; i < items.length; i++) {
        offsets[i] = y
        y += (this.heights[items[i].index] ?? ESTIMATE) + GAP
      }
      return { offsets, totalHeight: y }
    },
    totalHeight() {
      return this.layout.totalHeight
    },
    range() {
      const items = this.items
      const n = items.length
      if (!n) return { start: 0, end: 0 }

      const { offsets } = this.layout
      const top = Math.max(0, this.scrollTop - OVERSCAN_PX)
      const bottom = this.scrollTop + this.viewportHeight + OVERSCAN_PX

      let start = 0
      let lo = 0
      let hi = n - 1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const h = this.heights[items[mid].index] ?? ESTIMATE
        if (offsets[mid] + h <= top) lo = mid + 1
        else {
          start = mid
          hi = mid - 1
        }
      }

      let end = start
      while (end < n && offsets[end] < bottom) end++
      return { start, end: Math.min(n, end) }
    },
    visibleItems() {
      const { start, end } = this.range
      const { offsets } = this.layout
      const out = []
      for (let i = start; i < end; i++) {
        out.push({
          ...this.items[i],
          _offset: offsets[i],
        })
      }
      return out
    },
  },
  watch: {
    items() {
      this.heights = {}
      this.measureTick++
      this.$nextTick(() => {
        const root = this.$refs.root
        if (root) root.scrollTop = 0
        this.scrollTop = 0
        this.scheduleMeasure()
      })
    },
    'range.start'() {
      this.scheduleMeasure()
    },
    'range.end'() {
      this.scheduleMeasure()
    },
  },
  mounted() {
    this.viewportHeight = this.$refs.root?.clientHeight || 480
    this.rootRO = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height
      if (h && Math.abs(h - this.viewportHeight) > 1) {
        this.viewportHeight = h
      }
    })
    if (this.$refs.root) this.rootRO.observe(this.$refs.root)
    this.scheduleMeasure()
  },
  beforeUnmount() {
    this.rootRO?.disconnect()
    if (this._raf) cancelAnimationFrame(this._raf)
  },
  methods: {
    onScroll(e) {
      this.scrollTop = e.target.scrollTop
    },
    scheduleMeasure() {
      if (this._raf) cancelAnimationFrame(this._raf)
      this._raf = requestAnimationFrame(() => {
        this._raf = 0
        this.measureVisible()
      })
    },
    measureVisible() {
      const root = this.$refs.root
      if (!root) return

      const nodes = root.querySelectorAll('.q-card[data-q-index]')
      if (!nodes.length) return

      // Map question index -> list position for anchor correction
      const posByQ = new Map()
      for (let i = 0; i < this.items.length; i++) {
        posByQ.set(this.items[i].index, i)
      }

      const { offsets } = this.layout
      let scrollDelta = 0
      let changed = false
      const next = { ...this.heights }

      for (const node of nodes) {
        const qIndex = Number(node.getAttribute('data-q-index'))
        if (!Number.isFinite(qIndex)) continue
        const h = Math.round(node.offsetHeight)
        if (h <= 0 || next[qIndex] === h) continue

        const listPos = posByQ.get(qIndex)
        const prevH = next[qIndex] ?? ESTIMATE
        const delta = h - prevH
        // Items that end above the viewport: keep visual anchor stable
        if (listPos != null && offsets[listPos] + prevH <= this.scrollTop) {
          scrollDelta += delta
        }
        next[qIndex] = h
        changed = true
      }

      if (!changed) return
      this.heights = next
      this.measureTick++
      if (scrollDelta) {
        const nextTop = Math.max(0, this.scrollTop + scrollDelta)
        root.scrollTop = nextTop
        this.scrollTop = nextTop
      }
    },
  },
}
</script>

<style scoped>
.virtual-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  overflow-anchor: none;
  padding: 0.9rem 1rem 1.5rem;
  box-sizing: border-box;
}

.virtual-inner {
  position: relative;
  width: 100%;
}

.q-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2ebe5;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  box-sizing: border-box;
  will-change: transform;
}

.q-card.wrong {
  border-color: rgba(180, 71, 8, 0.28);
  background: #fffaf5;
}

.q-card.error {
  border-color: rgba(180, 35, 24, 0.28);
}

.q-top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.q-index {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  color: #8a9690;
}

.q-tag {
  font-size: 0.72rem;
  font-weight: 750;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

.q-tag.ok {
  color: #0f7a4d;
  background: rgba(15, 122, 77, 0.12);
}

.q-tag.bad {
  color: #b54708;
  background: rgba(181, 71, 8, 0.12);
}

.q-reason {
  font-size: 0.72rem;
  color: #8a9690;
}

.q-title {
  font-size: 0.95rem;
  font-weight: 650;
  color: #14231c;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.q-options {
  margin: 0.55rem 0 0;
  padding: 0.65rem 0.75rem;
  background: #f4f7f5;
  border-radius: 10px;
  font-size: 0.84rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  color: #3d5248;
  font-family: inherit;
}

.q-answers {
  margin-top: 0.65rem;
  display: grid;
  gap: 0.35rem;
  font-size: 0.88rem;
  color: #24352c;
}

.q-answers span {
  display: inline-block;
  min-width: 2.4rem;
  margin-right: 0.45rem;
  color: #7a8a81;
  font-weight: 700;
  font-size: 0.78rem;
}

.q-error {
  margin-top: 0.55rem;
  color: #b42318;
  font-size: 0.84rem;
}
</style>
