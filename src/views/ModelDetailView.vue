<template>
  <div class="detail-page">
    <div class="detail-nav">
      <router-link class="back-link" :to="{ name: 'leaderboard' }">
        <svg class="back-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M631.168 183.168a42.666667 42.666667 0 0 1 62.826667 57.621333l-2.496 2.709334L423.04 512l268.48 268.501333a42.666667 42.666667 0 0 1 2.496 57.621334l-2.496 2.709333a42.666667 42.666667 0 0 1-57.621333 2.496l-2.709334-2.496-298.666666-298.666667a42.666667 42.666667 0 0 1-2.496-57.621333l2.496-2.709333 298.666666-298.666667z" fill="currentColor" />
        </svg>
        返回
      </router-link>
    </div>

    <div v-if="loading" class="lb-state">加载中…</div>
    <div v-else-if="error" class="lb-state error">{{ error }}</div>

    <template v-else-if="model">
      <header class="detail-hero" :class="'place-' + Math.min(model.rank || 99, 4)">
        <div class="hero-main">
          <img
            v-if="modelIcon(model.id)"
            class="detail-icon"
            :src="modelIcon(model.id)"
            :alt="model.displayName || model.name"
          />
          <div class="hero-text">
            <div class="hero-top">
              <span class="rank-pill">#{{ model.rank }}</span>
              <span class="provider-tag">{{ model.provider || '未知提供方' }}</span>
            </div>
            <h1>{{ model.displayName || model.name }}</h1>
          </div>
        </div>
        <div class="hero-score">
          <span class="score-label">正确率</span>
          <strong class="score-value">{{ formatPct(model.accuracy) }}</strong>
          <span class="score-meta">{{ model.correct }}/{{ model.n }}</span>
        </div>
      </header>

      <section class="matrix-panel">
        <div class="matrix-head">
          <h2>科目 × 题型正确率</h2>
          <p>点击有数据的格子可查看该分组下的具体题目</p>
        </div>

        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="sticky-col">科目</th>
                <th v-for="t in types" :key="t" class="num">{{ t }}</th>
                <th class="num total-col">合计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.subject">
                <td class="sticky-col subject">{{ row.subject }}</td>
                <td
                  v-for="t in types"
                  :key="t"
                  class="num cell"
                  :class="[accClass(row.cells[t]?.acc), { clickable: !!row.cells[t] }]"
                  :title="cellTitle(row.cells[t])"
                  @click="openCell(row.subject, t, row.cells[t])"
                >
                  <template v-if="row.cells[t]">
                    <span class="cell-acc">{{ formatPct(row.cells[t].acc) }}</span>
                    <span class="cell-n">{{ row.cells[t].ok }}/{{ row.cells[t].n }}</span>
                  </template>
                  <template v-else>—</template>
                </td>
                <td
                  class="num total-col cell clickable"
                  :class="accClass(row.total.acc)"
                  :title="cellTitle(row.total)"
                  @click="openSubjectTotal(row)"
                >
                  <span class="cell-acc">{{ formatPct(row.total.acc) }}</span>
                  <span class="cell-n">{{ row.total.ok }}/{{ row.total.n }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="typeTotals">
              <tr>
                <td class="sticky-col subject">全部科目</td>
                <td
                  v-for="t in types"
                  :key="'foot-' + t"
                  class="num cell clickable"
                  :class="accClass(typeTotals[t]?.acc)"
                  :title="cellTitle(typeTotals[t])"
                  @click="openTypeTotal(t)"
                >
                  <span class="cell-acc">{{ formatPct(typeTotals[t]?.acc) }}</span>
                  <span class="cell-n">{{ typeTotals[t]?.ok }}/{{ typeTotals[t]?.n }}</span>
                </td>
                <td
                  class="num total-col cell clickable"
                  :class="accClass(model.accuracy)"
                  @click="openAllQuestions"
                >
                  <span class="cell-acc">{{ formatPct(model.accuracy) }}</span>
                  <span class="cell-n">{{ model.correct }}/{{ model.n }}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <Transition name="drawer-panel" appear @after-leave="onDrawerAfterLeave">
        <div v-if="drawer.open" class="drawer-backdrop" @click.self="closeDrawer">
          <aside class="drawer">
          <header class="drawer-head">
            <div>
              <h3>{{ drawer.title }}</h3>
              <p>
                正确率 {{ formatPct(drawer.acc) }} ·
                {{ drawer.ok }}/{{ drawer.questions.length }}
              </p>
            </div>
            <button class="drawer-close" type="button" @click="closeDrawer">关闭</button>
          </header>

          <div class="drawer-toolbar">
            <div class="filter-seg">
              <button
                v-for="opt in filterOptions"
                :key="opt.value"
                type="button"
                :class="{ active: drawer.filter === opt.value }"
                @click="drawer.filter = opt.value"
              >
                {{ opt.label }}
                <span>{{ filterCount(opt.value) }}</span>
              </button>
            </div>
            <input
              v-model.trim="drawer.search"
              class="drawer-search"
              type="search"
              placeholder="搜索题干 / 答案…"
            />
          </div>

          <div v-if="drawer.loadingQuestions" class="drawer-loading">正在加载题目明细…</div>
          <div v-else-if="drawer.questionsError" class="drawer-empty error">{{ drawer.questionsError }}</div>
          <VirtualQuestionList
            v-else-if="filteredQuestions.length"
            :items="filteredQuestions"
          />
          <div v-else class="drawer-empty">没有匹配的题目</div>
        </aside>
      </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import VirtualQuestionList from '@/components/VirtualQuestionList.vue'
import { lockPageScroll, unlockPageScroll, forceUnlockPageScroll } from '@/utils/scrollLock.js'
import { modelIcon } from '@/utils/modelIcons.js'
import {
  fetchModelSummary,
  fetchModelQuestions,
  clearModelCache,
  getCellQuestions,
  collectQuestions,
} from '@/utils/leaderboardData.js'

export default {
  name: 'ModelDetailView',
  components: { VirtualQuestionList },
  data() {
    return {
      loading: true,
      error: '',
      modelId: '',
      model: null,
      types: [],
      rows: [],
      typeTotals: null,
      questionBundle: null,
      filterCounts: { all: 0, ok: 0, bad: 0 },
      drawer: {
        open: false,
        title: '',
        acc: 0,
        ok: 0,
        questions: [],
        filter: 'all',
        search: '',
        loadingQuestions: false,
        questionsError: '',
      },
      filterOptions: [
        { label: '全部', value: 'all' },
        { label: '正确', value: 'ok' },
        { label: '错误', value: 'bad' },
      ],
      searchTimer: null,
      debouncedSearch: '',
    }
  },
  computed: {
    filteredQuestions() {
      const q = this.debouncedSearch.toLowerCase()
      return this.drawer.questions.filter((item) => {
        if (this.drawer.filter === 'ok' && !item.correct) return false
        if (this.drawer.filter === 'bad' && item.correct) return false
        if (!q) return true
        const hay = [item.title, item.options, item.gold, item.pred, item.error]
          .filter(Boolean)
          .join('\n')
          .toLowerCase()
        return hay.includes(q)
      })
    },
  },
  watch: {
    'drawer.search'(val) {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.debouncedSearch = val
      }, 180)
    },
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() {
        this.closeDrawer()
        this.fetchDetail()
      },
    },
  },
  methods: {
    modelIcon,
    async fetchDetail() {
      const id = this.$route.params.id
      if (this.modelId && this.modelId !== id) {
        clearModelCache(this.modelId)
      }
      this.modelId = id
      this.loading = true
      this.error = ''
      this.model = null
      this.questionBundle = null
      try {
        const data = await fetchModelSummary(id)
        this.model = data
        this.types = Array.isArray(data.types) ? data.types : []
        this.rows = Array.isArray(data.rows) ? data.rows : []
        this.typeTotals = data.typeTotals || null
      } catch (e) {
        this.error = e.message || '加载详情失败'
      } finally {
        this.loading = false
      }
    },
    async ensureQuestions() {
      if (this.questionBundle) return this.questionBundle
      this.drawer.loadingQuestions = true
      this.drawer.questionsError = ''
      try {
        this.questionBundle = await fetchModelQuestions(this.modelId)
        return this.questionBundle
      } catch (e) {
        this.drawer.questionsError = e.message || '题目明细加载失败'
        throw e
      } finally {
        this.drawer.loadingQuestions = false
      }
    },
    formatPct(v) {
      if (v == null || Number.isNaN(Number(v))) return '—'
      return (Number(v) * 100).toFixed(1) + '%'
    },
    cellTitle(cell) {
      if (!cell) return '无数据'
      const base = `正确 ${cell.ok} / 共 ${cell.n}` + (cell.err ? ` · 报错 ${cell.err}` : '')
      return cell.n ? `${base} · 点击查看题目` : base
    },
    accClass(acc) {
      if (acc == null) return ''
      if (acc >= 0.9) return 'acc-high'
      if (acc >= 0.8) return 'acc-mid'
      if (acc >= 0.7) return 'acc-ok'
      return 'acc-low'
    },
    updateFilterCounts(questions) {
      const ok = questions.filter((q) => q.correct).length
      this.filterCounts = {
        all: questions.length,
        ok,
        bad: questions.length - ok,
      }
    },
    async openDrawer(title, pickQuestions) {
      this.drawer.open = true
      this.drawer.title = title
      this.drawer.filter = 'all'
      this.drawer.search = ''
      this.debouncedSearch = ''
      this.drawer.questions = []
      this.drawer.acc = 0
      this.drawer.ok = 0
      lockPageScroll()

      try {
        const bundle = await this.ensureQuestions()
        const questions = pickQuestions(bundle)
        if (!questions.length) {
          this.drawer.questionsError = '该分组下没有题目'
          return
        }
        const ok = questions.filter((q) => q.correct).length
        this.drawer.questions = questions
        this.drawer.ok = ok
        this.drawer.acc = ok / questions.length
        this.updateFilterCounts(questions)
      } catch {
        // error message already set
      }
    },
    closeDrawer() {
      if (!this.drawer.open) return
      this.drawer.open = false
      this.drawer.loadingQuestions = false
    },
    onDrawerAfterLeave() {
      unlockPageScroll()
    },
    openCell(subject, type, cell) {
      if (!cell?.n) return
      this.openDrawer(`${subject} · ${type}`, (bundle) => getCellQuestions(bundle, subject, type))
    },
    openSubjectTotal(row) {
      if (!row.total?.n) return
      this.openDrawer(`${row.subject} · 全部题型`, (bundle) =>
        collectQuestions(bundle, this.types, (subject) => subject === row.subject),
      )
    },
    openTypeTotal(type) {
      this.openDrawer(`全部科目 · ${type}`, (bundle) =>
        collectQuestions(bundle, this.types, (_, t) => t === type),
      )
    },
    openAllQuestions() {
      this.openDrawer('全部科目 · 全部题型', (bundle) => collectQuestions(bundle, this.types))
    },
    filterCount(value) {
      return this.filterCounts[value] ?? 0
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchTimer)
    forceUnlockPageScroll()
  },
}
</script>

<style scoped>
.detail-page {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 1.75rem 1.25rem 4rem;
  box-sizing: border-box;
}

.detail-nav {
  margin-bottom: 1.25rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.85rem 0.4rem 0.55rem;
  border: 1px solid rgba(28, 36, 33, 0.12);
  border-radius: 999px;
  background: #fff;
  color: #FCB334;
  text-decoration: none;
  font-weight: 650;
  font-size: 0.92rem;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.back-link:hover {
  border-color: rgba(252, 179, 52, 0.45);
  background: #fffaf0;
  text-decoration: none;
}

.back-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.lb-state {
  padding: 2.5rem;
  text-align: center;
  color: #6b7a72;
  background: #f4f7f5;
  border-radius: 16px;
}

.lb-state.error {
  color: #b42318;
  background: #fff1f0;
}

.detail-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 0 0 1.35rem;
  border-bottom: 1px solid rgba(28, 36, 33, 0.08);
}

.detail-hero.place-1 {
  border-bottom-color: rgba(232, 160, 58, 0.28);
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 1.05rem;
  min-width: 0;
}

.detail-icon {
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: #fff;
}

.hero-text {
  min-width: 0;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}

.rank-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 750;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: #9aa49e;
  background: none;
  padding: 0;
  min-width: 0;
  height: auto;
  border-radius: 0;
}

.place-1 .rank-pill { color: #c4841e; }
.place-2 .rank-pill { color: #d4a04a; }
.place-3 .rank-pill { color: #e0b86e; }

.provider-tag {
  font-size: 0.82rem;
  color: #8a9690;
}

.provider-tag::before {
  content: '·';
  margin-right: 0.55rem;
  color: #c5cbc7;
}

.detail-hero h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-size: clamp(1.7rem, 3.2vw, 2.15rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1c2421;
  line-height: 1.15;
}

.hero-score {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.12rem;
  padding-bottom: 0.1rem;
}

.score-label {
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9aa49e;
}

.score-value {
  font-size: clamp(1.7rem, 3.2vw, 2.1rem);
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  color: #e8a03a;
  line-height: 1;
}

.place-1 .score-value {
  color: #e8a03a;
}

.score-meta {
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  color: #8a9690;
}

@media (max-width: 640px) {
  .detail-hero {
    flex-direction: column;
    align-items: stretch;
    gap: 1.1rem;
    padding-bottom: 1.15rem;
  }

  .hero-score {
    align-items: flex-start;
    flex-direction: row;
    align-items: baseline;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .score-label {
    width: 100%;
  }
}

.matrix-panel {
  background: #fff;
  border: 1px solid #e2ebe5;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(20, 35, 28, 0.06);
}

.matrix-head {
  padding: 1.15rem 1.25rem 0.85rem;
  border-bottom: 1px solid #eef3f0;
}

.matrix-head h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #14231c;
}

.matrix-head p {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: #6b7a72;
}

.matrix-wrap {
  overflow: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 760px;
  font-variant-numeric: tabular-nums;
}

.matrix-table th,
.matrix-table td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid #eef3f0;
  border-right: 1px solid #f3f6f4;
}

.matrix-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8fbf9;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #6b7a72;
  text-align: left;
}

.matrix-table th.num,
.matrix-table td.num {
  text-align: right;
}

.sticky-col {
  position: sticky;
  left: 0;
  z-index: 1;
  background: #fff;
  min-width: 6.5rem;
}

.matrix-table th.sticky-col {
  z-index: 3;
  background: #f8fbf9;
}

.subject {
  font-weight: 700;
  color: #24352c;
}

.total-col {
  background: #f8fbf9;
}

.matrix-table tbody tr:hover td {
  background: #f3faf6;
}

.matrix-table tbody tr:hover .sticky-col,
.matrix-table tbody tr:hover .total-col {
  background: #eaf6ef;
}

.matrix-table tfoot td {
  background: #f0f6f2;
  font-weight: 700;
  border-bottom: none;
}

.cell {
  vertical-align: top;
}

.cell.clickable {
  cursor: pointer;
}

.cell.clickable:hover {
  outline: 2px solid rgba(15, 122, 77, 0.25);
  outline-offset: -2px;
  background: #e8f7ef !important;
}

.cell-acc {
  display: block;
  font-weight: 750;
  font-size: 0.98rem;
}

.cell-n {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
  color: #8a9690;
}

.acc-high .cell-acc { color: #0b6b40; }
.acc-mid .cell-acc { color: #1a7a4d; }
.acc-ok .cell-acc { color: #9a6700; }
.acc-low .cell-acc { color: #b42318; }

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(15, 25, 20, 0.35);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: flex-end;
  overscroll-behavior: contain;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: opacity 0.28s ease;
}

.drawer-panel-enter-active .drawer,
.drawer-panel-leave-active .drawer {
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-panel-enter-from,
.drawer-panel-leave-to {
  opacity: 0;
}

.drawer-panel-enter-from .drawer,
.drawer-panel-leave-to .drawer {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .drawer-panel-enter-active,
  .drawer-panel-leave-active,
  .drawer-panel-enter-active .drawer,
  .drawer-panel-leave-active .drawer {
    transition: none;
  }
}

.drawer {
  width: min(560px, 100%);
  height: 100%;
  background: #f7faf8;
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.12);
  min-height: 0;
}

.drawer-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.15rem 1.2rem;
  background: #fff;
  border-bottom: 1px solid #e2ebe5;
}

.drawer-head h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #14231c;
}

.drawer-head p {
  margin: 0.3rem 0 0;
  color: #6b7a72;
  font-size: 0.9rem;
}

.drawer-close {
  border: none;
  background: rgba(118, 118, 128, 0.12);
  color: #1a6b4a;
  border-radius: 10px;
  padding: 0.45rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.drawer-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.9rem 1.2rem;
  background: #fff;
  border-bottom: 1px solid #eef3f0;
}

.filter-seg {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: rgba(118, 118, 128, 0.12);
  width: fit-content;
}

.filter-seg button {
  border: none;
  background: transparent;
  border-radius: 9px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #5c6b63;
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
}

.filter-seg button span {
  font-size: 0.75rem;
  opacity: 0.75;
  font-variant-numeric: tabular-nums;
}

.filter-seg button.active {
  background: #fff;
  color: #0f7a4d;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.drawer-search {
  width: 100%;
  border: 1px solid #d7e3db;
  border-radius: 10px;
  padding: 0.55rem 0.8rem;
  font-size: 0.92rem;
  background: #f8fbf9;
  box-sizing: border-box;
}

.drawer-loading,
.drawer-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8a9690;
  padding: 2rem 1rem;
}

.drawer-empty.error {
  color: #b42318;
}

@media (max-width: 800px) {
  .drawer {
    width: 100%;
  }
}
</style>
