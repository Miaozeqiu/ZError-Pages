import { createActions } from './actions.js'
import { getDom } from './dom.js'
import { createModelIconMappingsFeature } from './modelIconMappings.js'
import { createRenderer } from './render.js'
import { createStore } from './store.js'

export function initEditorApp() {
  const dom = getDom()
  const store = createStore()
  const ctx = { dom, store }

  ctx.setStatus = (message, type = 'info') => {
    if (!dom.statusBox) {
      return
    }
    dom.statusBox.textContent = message
    dom.statusBox.dataset.type = type
  }

  ctx.markDirty = (message = '内容已修改，记得保存。') => {
    store.isDirty = true
    ctx.setStatus(message, 'warning')
  }

  ctx.modelIconMappingsFeature = createModelIconMappingsFeature(ctx)
  Object.assign(ctx, createRenderer(ctx))
  Object.assign(ctx, createActions(ctx))

  ctx.bindEvents()
  ctx.loadModels()

  return ctx
}
