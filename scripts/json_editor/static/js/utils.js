export function normalizeModelIconMappings(mappings) {
  if (!mappings || typeof mappings !== 'object' || Array.isArray(mappings)) {
    return {}
  }

  const normalized = {}
  Object.entries(mappings).forEach(([iconName, keywords]) => {
    if (typeof iconName !== 'string' || !iconName.trim()) {
      return
    }

    const list = Array.isArray(keywords)
      ? keywords.filter(keyword => typeof keyword === 'string' && keyword.trim()).map(keyword => keyword.trim())
      : typeof keywords === 'string' && keywords.trim()
        ? [keywords.trim()]
        : []

    if (list.length) {
      normalized[iconName.trim()] = list
    }
  })

  return normalized
}

export function formatModelIconMappings(mappings) {
  return JSON.stringify(normalizeModelIconMappings(mappings), null, 2)
}

export function createModelIconMappingRow(store, iconName = '', keywords = []) {
  return {
    key: `mapping-${++store.modelIconMappingRowSeed}`,
    iconName,
    keywordsText: Array.isArray(keywords) ? keywords.join(', ') : String(keywords || ''),
  }
}

export function parseModelIconKeywords(value) {
  return String(value || '')
    .split(/[\n,，]+/)
    .map(keyword => keyword.trim())
    .filter(Boolean)
}

const ASSET_ORIGIN = 'http://localhost:5175'

export function getAssetPath(type, fileName) {
  const normalized = String(fileName || '').trim()
  return normalized ? `/${type}/${encodeURIComponent(normalized)}` : ''
}

export function getAssetUrl(type, fileName) {
  const path = getAssetPath(type, fileName)
  return path ? new URL(path, ASSET_ORIGIN).href : ''
}


export function updateAssetPreview(container, { type, fileName, label }) {
  if (!container) {
    return
  }

  const normalized = String(fileName || '').trim()
  container.innerHTML = ''
  container.className = 'asset-preview'

  if (!normalized) {
    container.classList.add('is-empty')
    container.textContent = `${label}：未设置`
    return
  }

  const url = getAssetUrl(type, normalized)

  const image = document.createElement('img')
  image.className = 'asset-preview-thumb'
  image.src = url

  image.alt = normalized
  image.loading = 'lazy'

  const copy = document.createElement('div')
  copy.className = 'asset-preview-copy'

  const labelEl = document.createElement('div')
  labelEl.className = 'asset-preview-label'
  labelEl.textContent = label

  const link = document.createElement('a')
  link.className = 'asset-preview-link'
  link.href = url
  link.target = '_blank'
  link.rel = 'noreferrer noopener'
  link.textContent = url

  copy.appendChild(labelEl)
  copy.appendChild(link)
  container.appendChild(image)
  container.appendChild(copy)

  image.addEventListener('error', () => {
    image.remove()
    labelEl.textContent = `${label}（未找到图片）`
  }, { once: true })
}

export function syncModelIdentity(model) {
  if (!model || typeof model !== 'object') {
    return
  }

  model.name = model.id || ''
}

export function syncPlatformModels(platform) {
  if (!platform || !Array.isArray(platform.models)) {
    return
  }

  platform.models.forEach(model => {
    model.platformId = platform.id || ''
    syncModelIdentity(model)
  })
}

export function syncPlatformIdentity(platform) {
  if (!platform || typeof platform !== 'object') {
    return
  }

  platform.name = platform.id || ''
  syncPlatformModels(platform)
}

export function applyPayload(store, payload, syncModelIconMappingsState) {
  if (Array.isArray(payload)) {
    store.providersList = []
    syncModelIconMappingsState({})
    store.state = payload
    store.state.forEach(syncPlatformIdentity)
    return
  }

  store.providersList = Array.isArray(payload?.providers_list) ? payload.providers_list : []
  syncModelIconMappingsState(payload?.model_icon_mappings)
  store.state = Array.isArray(payload?.platforms) ? payload.platforms : []
  store.state.forEach(syncPlatformIdentity)
}

export function buildPayload(store) {
  if (Array.isArray(store.state)) {
    store.state.forEach(syncPlatformIdentity)
  }

  return {
    providers_list: Array.isArray(store.providersList) ? store.providersList : [],
    model_icon_mappings: normalizeModelIconMappings(store.modelIconMappings),
    platforms: Array.isArray(store.state) ? store.state : [],
  }
}

export function platformTemplate() {
  return {
    id: 'new-platform',
    name: 'new-platform',
    displayName: '新供应商',
    baseUrl: '',
    url: '',
    inviteUrl: '',
    inviteText: '',
    inviteCode: '',
    icon: '',

    models: [],
    description: '',
  }
}

export function modelTemplate(platformId) {
  return {
    id: 'new-model',
    name: '',
    displayName: '新模型',
    platformId,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    enabled: true,
    category: 'text',
    description: '',
    pricing: { inputTokens: 0, outputTokens: 0 },
    jsCode: 'async function processModel(input, config, abortSignal) {\n  // TODO: 实现模型的 API 请求逻辑\n  return \'未实现\';\n}',
  }
}

export function getCurrentPlatform(store) {
  return Array.isArray(store.state) ? store.state[store.selectedPlatformIndex] || null : null
}

export function getCurrentModel(store) {
  const platform = getCurrentPlatform(store)
  if (!platform || !Array.isArray(platform.models)) {
    return null
  }

  return platform.models[store.selectedModelIndex] || null
}

export function ensureSelections(store) {
  if (!Array.isArray(store.state)) {
    store.state = []
  }

  if (!store.state.length) {
    store.selectedPlatformIndex = 0
    store.selectedModelIndex = 0
    return
  }

  store.selectedPlatformIndex = Math.max(0, Math.min(store.selectedPlatformIndex, store.state.length - 1))
  const models = Array.isArray(store.state[store.selectedPlatformIndex].models) ? store.state[store.selectedPlatformIndex].models : []
  store.selectedModelIndex = models.length ? Math.max(0, Math.min(store.selectedModelIndex, models.length - 1)) : 0
}

export function moveItem(items, fromIndex, toIndex) {
  if (!Array.isArray(items) || fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return fromIndex
  }

  const [movedItem] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, movedItem)
  return toIndex
}

export function createBadge(text, muted = false) {
  const badge = document.createElement('span')
  badge.className = `badge${muted ? ' badge-muted' : ''}`
  badge.textContent = text
  return badge
}

export function createHint(text) {
  const empty = document.createElement('div')
  empty.className = 'hint'
  empty.textContent = text
  return empty
}

export function buildListItem({ title, subtitle, badges = [], selected = false, onClick, onContextMenu }) {
  const li = document.createElement('li')
  li.className = `item-card${selected ? ' selected' : ''}`

  const main = document.createElement('div')
  main.className = 'item-main'

  const titleEl = document.createElement('div')
  titleEl.className = 'item-title'
  titleEl.textContent = title

  const subtitleEl = document.createElement('div')
  subtitleEl.className = 'item-subtitle'
  subtitleEl.textContent = subtitle

  main.appendChild(titleEl)
  main.appendChild(subtitleEl)

  const meta = document.createElement('div')
  meta.className = 'item-meta'
  badges.forEach(badge => meta.appendChild(badge))

  li.appendChild(main)
  li.appendChild(meta)

  if (typeof onClick === 'function') {
    li.addEventListener('click', onClick)
  }

  if (typeof onContextMenu === 'function') {
    li.addEventListener('contextmenu', event => {
      event.preventDefault()
      onContextMenu(event)
    })
  }

  return li
}
