import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/ItemList.vue') },
  { path: '/login', name: 'login', component: () => import('./views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('./views/Register.vue') },
  { path: '/cart', name: 'cart', component: () => import('./views/Cart.vue') },
  { path: '/mine', name: 'mine', component: () => import('./views/MyItems.vue') },
  { path: '/orders', name: 'orders', component: () => import('./views/Orders.vue') },
  { path: '/rank', name: 'rank', component: () => import('./views/Rank.vue') },
  { path: '/admin', name: 'admin', component: () => import('./views/Admin.vue') },
  { path: '/help', name: 'help', component: () => import('./views/Help.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局守卫：管理页仅「已登录且是管理员」可访问，否则一律重定向回首页
router.beforeEach((to) => {
  if (to.path === '/admin') {
    const isLogin = !!localStorage.getItem('ctm_token')
    const isAdmin = localStorage.getItem('ctm_admin') === '1'
    if (!isLogin || !isAdmin) return { path: '/' }
  }
  return true
})

export default router
