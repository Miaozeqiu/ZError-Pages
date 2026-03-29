import {
  applyPayload,
  buildPayload,
  ensureSelections,
  getCurrentPlatform,
  modelTemplate,
  moveItem,
  normalizeModelIconMappings,
  platformTemplate,
} from './utils.js'

export function createActions(ctx) {
  const { dom, store } = ctx

  function closePlatformContextMenu() {
    if (store.platformContextMenu) {
      store.platformContextMenu.hidden = true
    }
    store.platformContextMenuIndex = -1
  }

  function ensurePlatformContextMenu() {
    if (store.platformContextMenu) {
      return store.platformContextMenu
    }

    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.hidden = true
    menu.addEventListener('click', event => event.stopPropagation())
    menu.addEventListener('contextmenu', event => event.preventDefault())

    const editBtn = document.createElement('button')
    editBtn.type = 'button'
    editBtn.textContent = '编辑'
    editBtn.addEventListener('click', event => {
      event.stopPropagation()
      if (store.platformContextMenuIndex < 0 || store.platformContextMenuIndex >= store.state.length) {
        closePlatformContextMenu()
        return
      }
      store.selectedPlatformIndex = store.platformContextMenuIndex
      store.selectedModelIndex = 0
      ctx.renderAll()
      closePlatformContextMenu()
      openPlatformEditor()
    })

    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'context-menu-danger'
    deleteBtn.textContent = '删除'
    deleteBtn.addEventListener('click', event => {
      event.stopPropagation()
      if (store.platformContextMenuIndex < 0 || store.platformContextMenuIndex >= store.state.length) {
        closePlatformContextMenu()
        return
      }
      store.selectedPlatformIndex = store.platformContextMenuIndex
      store.selectedModelIndex = 0
      closePlatformContextMenu()
      deletePlatform()
    })

    menu.appendChild(editBtn)
    menu.appendChild(deleteBtn)
    document.body.appendChild(menu)
    store.platformContextMenu = menu
    return menu
  }

  function openPlatformContextMenu(index, clientX, clientY) {
    if (index < 0 || index >= store.state.length) {
      return
    }

    store.selectedPlatformIndex = index
    store.selectedModelIndex = 0
    ctx.renderAll()

    const menu = ensurePlatformContextMenu()
    store.platformContextMenuIndex = index
    menu.hidden = false
    menu.style.left = '0px'
    menu.style.top = '0px'

    const rect = menu.getBoundingClientRect()
    const left = Math.min(clientX, window.innerWidth - rect.width - 12)
    const top = Math.min(clientY, window.innerHeight - rect.height - 12)

    menu.style.left = `${Math.max(12, left)}px`
    menu.style.top = `${Math.max(12, top)}px`
  }

  function openPlatformEditor() {
    if (!dom.platformEditorModal || !getCurrentPlatform(store)) {
      return
    }
    ctx.renderPlatformForm()
    dom.platformEditorModal.hidden = false
    document.body.classList.add('modal-open')
  }

  function closePlatformEditor() {
    if (!dom.platformEditorModal) {
      return
    }
    dom.platformEditorModal.hidden = true
    document.body.classList.remove('modal-open')
  }

  async function loadModels() {
    ctx.setStatus('正在加载 models.json ...')
    try {
      const response = await fetch('/api/models')
      if (!response.ok) {
        ctx.setStatus(`加载失败: ${await response.text()}`, 'error')
        return
      }

      applyPayload(store, await response.json(), ctx.modelIconMappingsFeature.syncState)
      if (!Array.isArray(store.state)) {
        store.state = []
      }
      if (!Array.isArray(store.providersList)) {
        store.providersList = []
      }
      store.modelIconMappings = normalizeModelIconMappings(store.modelIconMappings)
      store.isDirty = false
      ensureSelections(store)
      ctx.renderAll()
      ctx.setStatus(`已加载最新配置，providers_list 共 ${store.providersList.length} 项，model_icon_mappings 共 ${Object.keys(store.modelIconMappings).length} 项。`, 'success')
    } catch (error) {
      ctx.setStatus(`加载异常: ${error.message}`, 'error')
    }
  }

  async function saveModels() {
    if (store.modelIconMappingsError) {
      ctx.setStatus(`保存失败: model_icon_mappings JSON 格式错误 - ${store.modelIconMappingsError}`, 'error')
      return
    }

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(store)),
      })
      const output = await response.json()
      if (!response.ok || !output.ok) {
        const message = output.errors ? output.errors.join('\n') : (output.error || '未知错误')
        ctx.setStatus(`保存失败: ${message}`, 'error')
        return
      }
      store.isDirty = false
      ctx.setStatus('保存成功，已自动创建备份。', 'success')
    } catch (error) {
      ctx.setStatus(`保存异常: ${error.message}`, 'error')
    }
  }

  function validateStructure() {
    const errors = []
    if (!Array.isArray(store.providersList)) {
      errors.push('providers_list 必须是数组')
    }
    if (store.modelIconMappingsError) {
      errors.push(`model_icon_mappings JSON 格式错误: ${store.modelIconMappingsError}`)
    }
    if (!store.modelIconMappings || typeof store.modelIconMappings !== 'object' || Array.isArray(store.modelIconMappings)) {
      errors.push('model_icon_mappings 必须是对象')
    } else {
      Object.entries(store.modelIconMappings).forEach(([iconName, keywords]) => {
        if (typeof iconName !== 'string' || !iconName.trim()) {
          errors.push('model_icon_mappings 的键必须是非空字符串')
          return
        }
        if (!Array.isArray(keywords)) {
          errors.push(`model_icon_mappings[${iconName}] 必须是数组`)
          return
        }
        keywords.forEach(keyword => {
          if (typeof keyword !== 'string' || !keyword.trim()) {
            errors.push(`model_icon_mappings[${iconName}] 的关键字必须是非空字符串`)
          }
        })
      })
    }
    if (!Array.isArray(store.state)) {
      errors.push('platforms 必须是数组')
    } else {
      store.state.forEach((platform, platformIndex) => {
        ['id', 'name', 'displayName', 'models'].forEach(key => {
          if (!(key in platform)) {
            errors.push(`平台[${platformIndex}]缺少字段: ${key}`)
          }
        })
        if (platform.models && !Array.isArray(platform.models)) {
          errors.push(`平台[${platformIndex}].models 必须是数组`)
        }
        if (Array.isArray(platform.models)) {
          platform.models.forEach((model, modelIndex) => {
            ['id', 'displayName', 'platformId'].forEach(key => {
              if (!(key in model)) {
                errors.push(`平台[${platformIndex}].models[${modelIndex}] 缺少字段: ${key}`)
              }
            })
          })
        }
      })
    }

    if (errors.length) {
      ctx.setStatus(`校验失败:\n${errors.join('\n')}`, 'error')
    } else {
      ctx.setStatus('结构校验通过。', 'success')
    }
  }

  function addPlatform() {
    if (!Array.isArray(store.state)) {
      store.state = []
    }

    const platform = platformTemplate()
    const ids = new Set(store.state.map(item => item.id).filter(Boolean))
    const baseId = platform.id
    let nextIndex = 1
    while (ids.has(platform.id)) {
      platform.id = `${baseId}-${nextIndex++}`
    }

    store.state.push(platform)
    store.selectedPlatformIndex = store.state.length - 1
    store.selectedModelIndex = 0
    ctx.renderAll()
    openPlatformEditor()
    ctx.markDirty(`已新增供应商：${platform.id}。`)
  }

  function deletePlatform() {
    if (!store.state.length) {
      ctx.setStatus('无供应商可删除。', 'error')
      return
    }

    const removed = store.state.splice(store.selectedPlatformIndex, 1)[0]
    store.selectedPlatformIndex = Math.max(0, store.selectedPlatformIndex - 1)
    store.selectedModelIndex = 0
    ctx.renderAll()
    ctx.markDirty(`已删除供应商：${removed?.id || '未命名供应商'}。`)
  }

  function movePlatform(offset) {
    if (!store.state.length) {
      ctx.setStatus('无供应商可排序。', 'error')
      return
    }

    const targetIndex = store.selectedPlatformIndex + offset
    if (targetIndex < 0 || targetIndex >= store.state.length) {
      ctx.setStatus('当前供应商已经在边界位置。', 'error')
      return
    }

    store.selectedPlatformIndex = moveItem(store.state, store.selectedPlatformIndex, targetIndex)
    ctx.renderAll()
    ctx.markDirty(`已调整供应商顺序：当前位于第 ${store.selectedPlatformIndex + 1} 位。`)
  }

  function addModel() {
    const platform = getCurrentPlatform(store)
    if (!platform) {
      ctx.setStatus('请先选择或新增供应商。', 'error')
      return
    }

    platform.models = Array.isArray(platform.models) ? platform.models : []
    const model = modelTemplate(platform.id)
    const ids = new Set(platform.models.map(item => item.id).filter(Boolean))
    const baseId = model.id
    let nextIndex = 1
    while (ids.has(model.id)) {
      model.id = `${baseId}-${nextIndex++}`
    }

    platform.models.push(model)
    store.selectedModelIndex = platform.models.length - 1
    ctx.renderAll()
    ctx.markDirty(`已在供应商 ${platform.id || '未命名供应商'} 下新增模型：${model.id}。`)
  }

  function deleteModel() {
    const platform = getCurrentPlatform(store)
    if (!platform || !Array.isArray(platform.models) || !platform.models.length) {
      ctx.setStatus('无模型可删除。', 'error')
      return
    }

    const removed = platform.models.splice(store.selectedModelIndex, 1)[0]
    store.selectedModelIndex = Math.max(0, store.selectedModelIndex - 1)
    ctx.renderAll()
    ctx.markDirty(`已删除模型：${removed?.id || '未命名模型'}。`)
  }

  function moveModel(offset) {
    const platform = getCurrentPlatform(store)
    if (!platform || !Array.isArray(platform.models) || !platform.models.length) {
      ctx.setStatus('无模型可排序。', 'error')
      return
    }

    const targetIndex = store.selectedModelIndex + offset
    if (targetIndex < 0 || targetIndex >= platform.models.length) {
      ctx.setStatus('当前模型已经在边界位置。', 'error')
      return
    }

    store.selectedModelIndex = moveItem(platform.models, store.selectedModelIndex, targetIndex)
    ctx.renderAll()
    ctx.markDirty(`已调整模型顺序：当前位于第 ${store.selectedModelIndex + 1} 位。`)
  }

  function bindEvents() {
    dom.reloadBtn?.addEventListener('click', loadModels)
    dom.saveBtn?.addEventListener('click', saveModels)
    dom.validateBtn?.addEventListener('click', validateStructure)
    dom.addPlatformBtn?.addEventListener('click', addPlatform)
    dom.deletePlatformBtn?.addEventListener('click', deletePlatform)
    dom.movePlatformUpBtn?.addEventListener('click', () => movePlatform(-1))
    dom.movePlatformDownBtn?.addEventListener('click', () => movePlatform(1))
    dom.addModelBtn?.addEventListener('click', addModel)
    dom.deleteModelBtn?.addEventListener('click', deleteModel)
    dom.moveModelUpBtn?.addEventListener('click', () => moveModel(-1))
    dom.moveModelDownBtn?.addEventListener('click', () => moveModel(1))
    dom.addModelIconMappingBtn?.addEventListener('click', () => {
      store.modelIconMappingsRows.push(ctx.modelIconMappingsFeature.createDefaultRow())
      ctx.modelIconMappingsFeature.commitRows({ markChanged: true })
      ctx.modelIconMappingsFeature.renderEditor()
    })
    dom.closePlatformEditorBtn?.addEventListener('click', closePlatformEditor)
    dom.platformEditorModal?.addEventListener('click', event => {
      if (event.target === dom.platformEditorModal || event.target.dataset.closePlatformEditor === 'true') {
        closePlatformEditor()
      }
    })
    document.addEventListener('pointerdown', event => {
      if (store.platformContextMenu && !store.platformContextMenu.hidden && !store.platformContextMenu.contains(event.target)) {
        closePlatformContextMenu()
      }
    })
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closePlatformContextMenu()
        closePlatformEditor()
      }
    })
    document.addEventListener('scroll', closePlatformContextMenu, true)
    window.addEventListener('resize', () => {
      closePlatformContextMenu()
      closePlatformEditor()
    })
    window.addEventListener('blur', () => {
      closePlatformContextMenu()
      closePlatformEditor()
    })
  }

  return {
    addModel,
    addPlatform,
    bindEvents,
    closePlatformContextMenu,
    closePlatformEditor,
    deleteModel,
    deletePlatform,
    ensurePlatformContextMenu,
    loadModels,
    moveModel,
    movePlatform,
    openPlatformContextMenu,
    openPlatformEditor,
    saveModels,
    validateStructure,
  }
}
