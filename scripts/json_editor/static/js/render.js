import {
  buildListItem,
  createBadge,
  createHint,
  ensureSelections,
  getCurrentModel,
  getCurrentPlatform,
  syncModelIdentity,
  syncPlatformIdentity,
  updateAssetPreview,
} from './utils.js'

export function createRenderer(ctx) {
  const { dom, store } = ctx

  function updateOverview() {
    const totalPlatforms = store.state.length
    const totalModels = store.state.reduce((sum, platform) => {
      return sum + (Array.isArray(platform.models) ? platform.models.length : 0)
    }, 0)
    const platform = getCurrentPlatform(store)
    const models = Array.isArray(platform?.models) ? platform.models : []

    if (dom.platformCount) {
      dom.platformCount.textContent = String(totalPlatforms)
    }
    if (dom.modelCount) {
      dom.modelCount.textContent = String(totalModels)
    }
    if (dom.sidebarPlatformCount) {
      dom.sidebarPlatformCount.textContent = `${totalPlatforms} 个`
    }
    if (dom.currentModelCount) {
      dom.currentModelCount.textContent = `${models.length} 个`
    }
  }

  function updateActionStates() {
    const platform = getCurrentPlatform(store)
    const models = Array.isArray(platform?.models) ? platform.models : []
    const hasPlatform = !!platform
    const hasModel = !!models.length

    if (dom.deletePlatformBtn) {
      dom.deletePlatformBtn.disabled = !store.state.length
    }
    if (dom.movePlatformUpBtn) {
      dom.movePlatformUpBtn.disabled = !store.state.length || store.selectedPlatformIndex <= 0
    }
    if (dom.movePlatformDownBtn) {
      dom.movePlatformDownBtn.disabled = !store.state.length || store.selectedPlatformIndex >= store.state.length - 1
    }
    if (dom.addModelBtn) {
      dom.addModelBtn.disabled = !hasPlatform
    }
    if (dom.deleteModelBtn) {
      dom.deleteModelBtn.disabled = !hasModel
    }
    if (dom.moveModelUpBtn) {
      dom.moveModelUpBtn.disabled = !hasModel || store.selectedModelIndex <= 0
    }
    if (dom.moveModelDownBtn) {
      dom.moveModelDownBtn.disabled = !hasModel || store.selectedModelIndex >= models.length - 1
    }
  }

  function renderPlatformList() {
    if (!dom.platformList) {
      return
    }

    dom.platformList.innerHTML = ''
    if (!store.state.length) {
      ctx.closePlatformContextMenu()
      dom.platformList.appendChild(createHint('暂无供应商，点击“新增供应商”创建。'))
      return
    }

    store.state.forEach((platform, index) => {
      const name = platform.displayName || platform.id || '未命名供应商'
      const idText = platform.id || '未设置 ID'
      const modelsLength = Array.isArray(platform.models) ? platform.models.length : 0
      const item = buildListItem({
        title: name,
        subtitle: idText,
        badges: [
          createBadge(`第 ${index + 1} 位`, index !== store.selectedPlatformIndex),
          createBadge(`${modelsLength} 个模型`, true),
        ],
        selected: index === store.selectedPlatformIndex,
        onClick: () => {
          ctx.closePlatformContextMenu()
          store.selectedPlatformIndex = index
          store.selectedModelIndex = 0
          ctx.renderAll()
        },
        onContextMenu: event => {
          ctx.openPlatformContextMenu(index, event.clientX, event.clientY)
        },
      })
      dom.platformList.appendChild(item)
    })
  }

  function renderPlatformForm() {
    const platform = getCurrentPlatform(store)
    const disabled = !platform
    ;[
      dom.platform_id,
      dom.platform_displayName,
      dom.platform_baseUrl,
      dom.platform_url,
      dom.platform_inviteUrl,
      dom.platform_inviteText,
      dom.platform_inviteCode,
      dom.platform_icon,
    ].filter(Boolean).forEach(element => {

      element.disabled = disabled
    })

    if (!platform) {
      if (dom.platform_id) dom.platform_id.value = ''
      if (dom.platform_displayName) dom.platform_displayName.value = ''
      if (dom.platform_baseUrl) dom.platform_baseUrl.value = ''
      if (dom.platform_url) dom.platform_url.value = ''
      if (dom.platform_inviteUrl) dom.platform_inviteUrl.value = ''
      if (dom.platform_inviteText) dom.platform_inviteText.value = ''
      if (dom.platform_inviteCode) dom.platform_inviteCode.value = ''
      if (dom.platform_icon) dom.platform_icon.value = ''
      updateAssetPreview(dom.platformIconPreview, { type: 'providers', fileName: '', label: '供应商图片地址' })
      return
    }

    syncPlatformIdentity(platform)
    if (dom.platform_id) dom.platform_id.value = platform.id || ''
    if (dom.platform_displayName) dom.platform_displayName.value = platform.displayName || ''
    if (dom.platform_baseUrl) dom.platform_baseUrl.value = platform.baseUrl || ''
    if (dom.platform_url) dom.platform_url.value = platform.url || ''
    if (dom.platform_inviteUrl) dom.platform_inviteUrl.value = platform.inviteUrl || ''
    if (dom.platform_inviteText) dom.platform_inviteText.value = platform.inviteText || ''
    if (dom.platform_inviteCode) dom.platform_inviteCode.value = platform.inviteCode || ''
    if (dom.platform_icon) dom.platform_icon.value = platform.icon || ''

    updateAssetPreview(dom.platformIconPreview, { type: 'providers', fileName: platform.icon, label: '供应商图片地址' })

    if (dom.platform_id) {
      dom.platform_id.oninput = () => {
        platform.id = dom.platform_id.value
        syncPlatformIdentity(platform)
        ctx.renderPlatformList()
        ctx.renderModelList()
        ctx.renderModelForm()
        ctx.updateOverview()
        ctx.markDirty('供应商 ID 已更新，内部名称与关联模型的 platformId 已同步。')
      }
    }

    if (dom.platform_displayName) {
      dom.platform_displayName.oninput = () => {
        platform.displayName = dom.platform_displayName.value
        ctx.renderPlatformList()
        ctx.updateOverview()
        ctx.markDirty()
      }
    }

    if (dom.platform_baseUrl) {
      dom.platform_baseUrl.oninput = () => {
        platform.baseUrl = dom.platform_baseUrl.value
        ctx.markDirty()
      }
    }

    if (dom.platform_url) {
      dom.platform_url.oninput = () => {
        platform.url = dom.platform_url.value
        ctx.markDirty()
      }
    }

    if (dom.platform_inviteUrl) {
      dom.platform_inviteUrl.oninput = () => {
        platform.inviteUrl = dom.platform_inviteUrl.value
        ctx.markDirty()
      }
    }

    if (dom.platform_inviteText) {
      dom.platform_inviteText.oninput = () => {
        platform.inviteText = dom.platform_inviteText.value
        ctx.markDirty()
      }
    }

    if (dom.platform_inviteCode) {
      dom.platform_inviteCode.oninput = () => {
        platform.inviteCode = dom.platform_inviteCode.value
        ctx.markDirty()
      }
    }

    if (dom.platform_icon) {

      dom.platform_icon.oninput = () => {
        platform.icon = dom.platform_icon.value
        updateAssetPreview(dom.platformIconPreview, { type: 'providers', fileName: platform.icon, label: '供应商图片地址' })
        ctx.markDirty()
      }
    }
  }

  function renderModelList() {
    if (!dom.modelList) {
      return
    }

    dom.modelList.innerHTML = ''
    const platform = getCurrentPlatform(store)
    if (!platform || !Array.isArray(platform.models) || !platform.models.length) {
      dom.modelList.appendChild(createHint('暂无模型，点击“新增模型”创建。'))
      return
    }

    platform.models.forEach((model, index) => {
      const name = model.displayName || model.id || '未命名模型'
      const idText = model.id || '未设置 ID'
      const item = buildListItem({
        title: name,
        subtitle: idText,
        badges: [
          createBadge(`第 ${index + 1} 位`, index !== store.selectedModelIndex),
          createBadge(model.category || '未分类', true),
        ],
        selected: index === store.selectedModelIndex,
        onClick: () => {
          store.selectedModelIndex = index
          ctx.renderModelList()
          ctx.renderModelForm()
          ctx.updateOverview()
          ctx.updateActionStates()
        },
      })
      dom.modelList.appendChild(item)
    })
  }

  function renderModelForm() {
    const platform = getCurrentPlatform(store)
    const model = getCurrentModel(store)
    const disabled = !model

    ;[
      dom.model_id,
      dom.model_displayName,
      dom.model_platformId,
      dom.model_category,
      dom.model_jsCode,
    ].filter(Boolean).forEach(element => {
      element.disabled = disabled || element === dom.model_platformId
    })

    if (!model) {
      if (dom.model_id) dom.model_id.value = ''
      if (dom.model_displayName) dom.model_displayName.value = ''
      if (dom.model_platformId) dom.model_platformId.value = platform?.id || ''
      if (dom.model_category) dom.model_category.value = 'text'
      if (dom.model_jsCode) dom.model_jsCode.value = ''
      return
    }

    syncModelIdentity(model)
    if (dom.model_id) dom.model_id.value = model.id || ''
    if (dom.model_displayName) dom.model_displayName.value = model.displayName || ''
    if (dom.model_platformId) dom.model_platformId.value = model.platformId || platform?.id || ''
    if (dom.model_category) dom.model_category.value = model.category || 'text'
    if (dom.model_jsCode) dom.model_jsCode.value = model.jsCode || ''

    if (dom.model_id) {
      dom.model_id.oninput = () => {
        model.id = dom.model_id.value
        syncModelIdentity(model)
        ctx.renderModelList()
        ctx.updateOverview()
        ctx.markDirty('模型 ID 已更新，内部名称已同步。')
      }
    }

    if (dom.model_displayName) {
      dom.model_displayName.oninput = () => {
        model.displayName = dom.model_displayName.value
        ctx.renderModelList()
        ctx.updateOverview()
        ctx.markDirty()
      }
    }

    if (dom.model_category) {
      dom.model_category.onchange = () => {
        model.category = dom.model_category.value
        ctx.renderModelList()
        ctx.markDirty()
      }
    }

    if (dom.model_jsCode) {
      dom.model_jsCode.oninput = () => {
        model.jsCode = dom.model_jsCode.value
        ctx.markDirty()
      }
    }
  }

  function renderAll() {
    ensureSelections(store)
    renderPlatformList()
    renderPlatformForm()
    ctx.modelIconMappingsFeature.renderEditor()
    renderModelList()
    renderModelForm()
    updateOverview()
    updateActionStates()
  }

  return {
    renderAll,
    renderModelForm,
    renderModelList,
    renderPlatformForm,
    renderPlatformList,
    updateActionStates,
    updateOverview,
  }
}
