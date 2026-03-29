import {
  createHint,
  createModelIconMappingRow,
  formatModelIconMappings,
  normalizeModelIconMappings,
  parseModelIconKeywords,
  updateAssetPreview,
} from './utils.js'

export function createModelIconMappingsFeature(ctx) {
  const { dom, store } = ctx

  function getCountLabel() {
    return store.modelIconMappingsError ? '格式错误' : `${Object.keys(store.modelIconMappings).length} 项`
  }

  function renderSummary() {
    if (dom.modelIconMappingsCount) {
      dom.modelIconMappingsCount.textContent = getCountLabel()
    }

    if (dom.modelIconMappingsJsonPanel && store.modelIconMappingsError) {
      dom.modelIconMappingsJsonPanel.open = true
    }

    if (dom.modelIconMappingsErrorBox) {
      dom.modelIconMappingsErrorBox.hidden = !store.modelIconMappingsError
      dom.modelIconMappingsErrorBox.textContent = store.modelIconMappingsError || ''
    }
  }

  function syncRows(mappings) {
    const normalized = normalizeModelIconMappings(mappings)
    store.modelIconMappingsRows = Object.entries(normalized).map(([iconName, keywords]) => {
      return createModelIconMappingRow(store, iconName, keywords)
    })
  }

  function commitRows({ markChanged = false } = {}) {
    const normalized = {}

    for (let index = 0; index < store.modelIconMappingsRows.length; index += 1) {
      const row = store.modelIconMappingsRows[index]
      const iconName = row.iconName.trim()
      const keywords = parseModelIconKeywords(row.keywordsText)

      if (!iconName) {
        store.modelIconMappingsError = `第 ${index + 1} 项的图标文件名不能为空`
        renderSummary()
        if (markChanged) {
          ctx.setStatus(`model_icon_mappings 配置错误: ${store.modelIconMappingsError}`, 'error')
        }
        return false
      }

      if (!keywords.length) {
        store.modelIconMappingsError = `第 ${index + 1} 项至少需要一个模型关键字`
        renderSummary()
        if (markChanged) {
          ctx.setStatus(`model_icon_mappings 配置错误: ${store.modelIconMappingsError}`, 'error')
        }
        return false
      }

      if (normalized[iconName]) {
        store.modelIconMappingsError = `图标文件名重复: ${iconName}`
        renderSummary()
        if (markChanged) {
          ctx.setStatus(`model_icon_mappings 配置错误: ${store.modelIconMappingsError}`, 'error')
        }
        return false
      }

      normalized[iconName] = keywords
    }

    store.modelIconMappings = normalized
    store.modelIconMappingsDraft = formatModelIconMappings(store.modelIconMappings)
    store.modelIconMappingsError = ''

    if (dom.model_icon_mappings_json) {
      dom.model_icon_mappings_json.value = store.modelIconMappingsDraft
    }

    renderSummary()
    if (markChanged) {
      ctx.markDirty('模型图标映射已更新。')
    }
    return true
  }

  function createDefaultRow() {
    const usedIconNames = new Set()
    const usedKeywords = new Set()

    store.modelIconMappingsRows.forEach(row => {
      const iconName = row.iconName.trim()
      if (iconName) {
        usedIconNames.add(iconName)
      }
      parseModelIconKeywords(row.keywordsText).forEach(keyword => usedKeywords.add(keyword))
    })

    let iconIndex = 0
    let iconName = 'new-icon.png'
    while (usedIconNames.has(iconName)) {
      iconIndex += 1
      iconName = `new-icon-${iconIndex}.png`
    }

    let keywordIndex = 0
    let keyword = 'NEW-MODEL'
    while (usedKeywords.has(keyword)) {
      keywordIndex += 1
      keyword = `NEW-MODEL-${keywordIndex}`
    }

    return createModelIconMappingRow(store, iconName, [keyword])
  }

  function syncState(mappings) {
    store.modelIconMappings = normalizeModelIconMappings(mappings)
    store.modelIconMappingsDraft = formatModelIconMappings(store.modelIconMappings)
    store.modelIconMappingsError = ''
    syncRows(store.modelIconMappings)
  }

  function setDraft(value, { markChanged = false } = {}) {
    store.modelIconMappingsDraft = value

    try {
      const parsed = value.trim() ? JSON.parse(value) : {}
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('根结构必须是对象')
      }
      syncState(parsed)
      if (markChanged) {
        ctx.markDirty('模型图标映射已更新。')
      }
    } catch (error) {
      store.modelIconMappingsError = error.message
      if (markChanged) {
        ctx.setStatus(`model_icon_mappings JSON 格式错误: ${error.message}`, 'error')
      }
    }

    renderSummary()
  }

  function renderListEditor() {
    if (!dom.modelIconMappingsList) {
      return
    }

    dom.modelIconMappingsList.innerHTML = ''
    if (!store.modelIconMappingsRows.length) {
      dom.modelIconMappingsList.appendChild(createHint('暂无映射，点击“新增映射”创建。'))
      return
    }

    store.modelIconMappingsRows.forEach((row, index) => {
      const card = document.createElement('div')
      card.className = 'mapping-card'

      const head = document.createElement('div')
      head.className = 'mapping-card-head'

      const title = document.createElement('strong')
      title.textContent = `映射 ${index + 1}`

      const meta = document.createElement('span')
      meta.className = 'mapping-card-meta'
      meta.textContent = `${parseModelIconKeywords(row.keywordsText).length} 个关键字`

      const deleteBtn = document.createElement('button')
      deleteBtn.type = 'button'
      deleteBtn.textContent = '删除'
      deleteBtn.addEventListener('click', () => {
        store.modelIconMappingsRows = store.modelIconMappingsRows.filter(item => item.key !== row.key)
        commitRows({ markChanged: true })
        renderEditor()
      })

      head.appendChild(title)
      head.appendChild(meta)
      head.appendChild(deleteBtn)

      const preview = document.createElement('div')
      updateAssetPreview(preview, { type: 'models', fileName: row.iconName, label: '模型图片地址' })

      const grid = document.createElement('div')
      grid.className = 'mapping-card-grid'

      const iconField = document.createElement('div')
      iconField.className = 'field'
      const iconLabel = document.createElement('label')
      iconLabel.textContent = '图标文件名'
      const iconInput = document.createElement('input')
      iconInput.value = row.iconName
      iconInput.placeholder = '例如 deepseek.png'
      iconInput.addEventListener('input', () => {
        row.iconName = iconInput.value
        updateAssetPreview(preview, { type: 'models', fileName: row.iconName, label: '模型图片地址' })
        commitRows({ markChanged: true })
      })
      iconField.appendChild(iconLabel)
      iconField.appendChild(iconInput)

      const keywordsField = document.createElement('div')
      keywordsField.className = 'field full-width'
      const keywordsLabel = document.createElement('label')
      keywordsLabel.textContent = '模型关键字'
      const keywordsInput = document.createElement('textarea')
      keywordsInput.value = row.keywordsText
      keywordsInput.placeholder = '支持逗号或换行，例如：\nDEEPSEEK\nDEEPSEEK-R1'
      keywordsInput.spellcheck = false
      keywordsInput.addEventListener('input', () => {
        row.keywordsText = keywordsInput.value
        meta.textContent = `${parseModelIconKeywords(row.keywordsText).length} 个关键字`
        commitRows({ markChanged: true })
      })
      const keywordsTip = document.createElement('div')
      keywordsTip.className = 'field-tip'
      keywordsTip.textContent = '多个关键字可用英文逗号、中文逗号或换行分隔。'
      keywordsField.appendChild(keywordsLabel)
      keywordsField.appendChild(keywordsInput)
      keywordsField.appendChild(keywordsTip)

      grid.appendChild(iconField)
      grid.appendChild(keywordsField)
      card.appendChild(head)
      card.appendChild(preview)
      card.appendChild(grid)
      dom.modelIconMappingsList.appendChild(card)
    })
  }

  function renderEditor() {
    if (dom.model_icon_mappings_json) {
      dom.model_icon_mappings_json.value = store.modelIconMappingsError
        ? store.modelIconMappingsDraft
        : formatModelIconMappings(store.modelIconMappings)
    }

    renderSummary()
    renderListEditor()

    if (!dom.model_icon_mappings_json) {
      return
    }

    dom.model_icon_mappings_json.oninput = () => {
      setDraft(dom.model_icon_mappings_json.value, { markChanged: true })
      renderListEditor()
    }

    dom.model_icon_mappings_json.onblur = () => {
      if (!store.modelIconMappingsError) {
        dom.model_icon_mappings_json.value = store.modelIconMappingsDraft
      }
      renderSummary()
    }
  }

  return {
    commitRows,
    createDefaultRow,
    renderEditor,
    renderListEditor,
    setDraft,
    syncState,
  }
}
