import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/download',
      name: 'download',
      component: () => import('../views/DownloadView.vue')
    },
    {
      path: '/changelog',
      name: 'changelog',
      component: () => import('../views/ChangelogView.vue')
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/LeaderboardView.vue')
    },
    {
      path: '/leaderboard/:id',
      name: 'leaderboard-model',
      component: () => import('../views/ModelDetailView.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
