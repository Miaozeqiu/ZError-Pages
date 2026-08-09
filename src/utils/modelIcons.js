/** Map leaderboard model id → public icon path */
const MODEL_ICONS = {
  'kimi-k3': '/models/kimi.png',
  'doubao-seed-2.1-turbo': '/models/doubao.png',
  'qwen3.8-max': '/models/qwen.png',
  'gpt-5.6-sol': '/models/openai.png',
  'deepseek-v4-flash': '/models/deepseek.png',
  'deepseek-v4-pro': '/models/deepseek.png',
  'glm-5.2': '/models/glm.png',
  'minimax-m3': '/models/minimax.png',
  'grok-4.5': '/models/grok.png',
  'longcat-2.0': '/models/longcat.png',
  'mimo-v2.5': '/models/mimo.png',
}

export function modelIcon(modelId) {
  return MODEL_ICONS[modelId] || null
}
