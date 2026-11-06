import { createApp, createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory } from 'vue-router'
import App from './App.vue'
import { makeRouter } from './router'
import { getPageSeo } from './seo'

const root = document.getElementById('app')!
const pathname = window.location.pathname.replace(/\/$/, '') || '/'
const hydrate = root.dataset.prerendered === pathname
const router = makeRouter(createWebHistory(import.meta.env.BASE_URL))
const app = (hydrate ? createSSRApp : createApp)(App)
app.use(createPinia())
app.use(router)

router.afterEach((to) => {
  const page = getPageSeo(to.path)
  document.title = page.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', page.description)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', page.title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', page.description)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', page.url)
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = page.url
})

router.isReady().then(() => app.mount(root))
