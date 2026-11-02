import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/tuner' },
    { path: '/tuner', component: () => import('../views/Tuner.vue') },
    { path: '/metronome', component: () => import('../views/Metronome.vue') }
  ]
})

export default router