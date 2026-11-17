import { createRouter, type RouterHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DownloadView from '../views/DownloadView.vue'
import ChangelogView from '../views/ChangelogView.vue'
import PrivacyView from '../views/PrivacyView.vue'

export function makeRouter(history: RouterHistory) {
  return createRouter({
    history,
    routes: [
      {
        path: '/',
        name: 'home',
        component: HomeView
      },
      {
        path: '/download',
        name: 'download',
        component: DownloadView
      },
      {
        path: '/changelog',
        name: 'changelog',
        component: ChangelogView
      },
      {
        path: '/privacy',
        name: 'privacy',
        component: PrivacyView
      },
      {
        path: '/privacy/en',
        name: 'privacy-english',
        component: PrivacyView,
        props: { english: true }
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
}
