import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Equipment from '../views/Equipment.vue'
import Maintenance from '../views/Maintenance.vue'
import Analytics from '../views/Analytics.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'ダッシュボード' }
  },
  {
    path: '/equipment',
    name: 'Equipment',
    component: Equipment,
    meta: { title: '設備一覧' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: Maintenance,
    meta: { title: 'メンテナンス管理' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { title: 'データ分析' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ページタイトルの設定
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - 工場設備管理システム`
  next()
})

export default router