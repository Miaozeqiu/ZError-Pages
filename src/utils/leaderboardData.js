/** @typedef {{ index: number, title: string, options?: string, gold?: string, pred?: string, correct: boolean, score_reason?: string, error?: string | null }} Question */

const summaryCache = new Map()
const questionsCache = new Map()

/**
 * @param {string} modelId
 */
export async function fetchModelSummary(modelId) {
  if (summaryCache.has(modelId)) return summaryCache.get(modelId)

  const res = await fetch(`/leaderboard/${modelId}.json`)
  if (!res.ok) {
    throw new Error(res.status === 404 ? '未找到该模型的评测数据' : `加载失败 (${res.status})`)
  }

  const data = await res.json()
  const hasEmbeddedQuestions = (data.rows || []).some((row) =>
    Object.values(row.cells || {}).some((cell) => cell?.questions?.length),
  )

  summaryCache.set(modelId, data)

  // Legacy single-file format: keep questions in memory after first parse.
  if (hasEmbeddedQuestions) {
    /** @type {Record<string, Question[]>} */
    const cells = {}
    for (const row of data.rows || []) {
      for (const type of data.types || []) {
        const cell = row.cells?.[type]
        if (!cell?.questions?.length) continue
        cells[`${row.subject}|${type}`] = cell.questions
        delete cell.questions
      }
    }
    questionsCache.set(modelId, { version: 1, modelId, cells })
  }

  return data
}

/**
 * @param {string} modelId
 * @returns {Promise<{ cells: Record<string, Question[]> }>}
 */
export async function fetchModelQuestions(modelId) {
  if (questionsCache.has(modelId)) return questionsCache.get(modelId)

  const res = await fetch(`/leaderboard/${modelId}-questions.json`)
  if (!res.ok) {
    throw new Error(`题目明细加载失败 (${res.status})`)
  }

  const data = await res.json()
  questionsCache.set(modelId, data)
  return data
}

/**
 * @param {string} modelId
 */
export function clearModelCache(modelId) {
  summaryCache.delete(modelId)
  questionsCache.delete(modelId)
}

export function cellKey(subject, type) {
  return `${subject}|${type}`
}

/**
 * @param {{ cells: Record<string, Question[]> }} bundle
 * @param {string} subject
 * @param {string} type
 */
export function getCellQuestions(bundle, subject, type) {
  return bundle.cells[cellKey(subject, type)] || []
}

/**
 * @param {{ cells: Record<string, Question[]> }} bundle
 * @param {string[]} types
 * @param {(subject: string, type: string) => boolean} [predicate]
 */
export function collectQuestions(bundle, types, predicate) {
  /** @type {Question[]} */
  const list = []
  for (const key of Object.keys(bundle.cells)) {
    const sep = key.indexOf('|')
    if (sep < 0) continue
    const subject = key.slice(0, sep)
    const type = key.slice(sep + 1)
    if (predicate && !predicate(subject, type)) continue
    if (types.length && !types.includes(type)) continue
    list.push(...bundle.cells[key])
  }
  return list
}
