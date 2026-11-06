import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createPinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { makeRouter } from './router'

export { getPageSeo, publicPaths, siteOrigin } from './seo'

export async function render(path: string) {
  const router = makeRouter(createMemoryHistory())
  const app = createSSRApp(App).use(createPinia()).use(router)
  await router.push(path)
  await router.isReady()
  return renderToString(app)
}
