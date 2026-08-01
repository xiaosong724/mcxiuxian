import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/ItemList.vue') },
  { path: '/login', name: 'login', component: () => import('./views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('./views/Register.vue') },
  { path: '/cart', name: 'cart', component: () => import('./views/Cart.vue') },
  { path: '/mine', name: 'mine', component: () => import('./views/MyItems.vue') },
  { path: '/orders', name: 'orders', component: () => import('./views/Orders.vue') },
  { path: '/rank', name: 'rank', component: () => import('./views/Rank.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
