/**
 * Split model detail JSON into a small matrix summary + lazy-loadable questions bundle.
 * Run after rebuilding leaderboard model JSONs.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../../public/leaderboard')

const MODEL_IDS = [
  'kimi-k3',
  'doubao-seed-2.1-turbo',
  'qwen3.8-max',
  'gpt-5.6-sol',
  'deepseek-v4-flash',
  'deepseek-v4-pro',
  'glm-5.2',
  'minimax-m3',
  'grok-4.5',
  'longcat-2.0',
  'mimo-v2.5',
]

function cellKey(subject, type) {
  return `${subject}|${type}`
}

function splitModel(id) {
  const srcPath = path.join(outDir, `${id}.json`)
  if (!fs.existsSync(srcPath)) {
    console.warn('skip (missing):', id)
    return
  }

  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf8'))
  const types = Array.isArray(raw.types) ? raw.types : []
  const cells = {}

  for (const row of raw.rows || []) {
    for (const type of types) {
      const cell = row.cells?.[type]
      if (!cell?.questions?.length) continue
      const key = cellKey(row.subject, type)
      cells[key] = cell.questions
      delete cell.questions
    }
  }

  // 已拆分过的模型 summary 里没有 questions；勿覆盖已有 *-questions.json
  if (!Object.keys(cells).length) {
    const existingQ = path.join(outDir, `${id}-questions.json`)
    if (fs.existsSync(existingQ)) {
      console.log(`skip (already split): ${id}`)
      return
    }
    console.warn('skip (no questions embedded):', id)
    return
  }

  const summaryPath = path.join(outDir, `${id}.json`)
  const questionsPath = path.join(outDir, `${id}-questions.json`)

  fs.writeFileSync(summaryPath, JSON.stringify(raw))
  fs.writeFileSync(
    questionsPath,
    JSON.stringify({
      version: 1,
      modelId: id,
      count: Object.values(cells).reduce((n, arr) => n + arr.length, 0),
      cells,
    }),
  )

  const summaryKb = Math.round(fs.statSync(summaryPath).size / 1024)
  const questionsKb = Math.round(fs.statSync(questionsPath).size / 1024)
  console.log(`${id}: summary ${summaryKb}KB, questions ${questionsKb}KB, cells ${Object.keys(cells).length}`)
}

for (const id of MODEL_IDS) splitModel(id)
