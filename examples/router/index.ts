import { createWebHashHistory, createRouter } from 'vue-router';

const routes = [
  { path: '/', component: () => import('@/views/index.vue') },
  { path: '/table', component: () => import('@/views/Table/index.vue') },
  { path: '/form', component: () => import('@/views/Form/index.vue') },
  { path: '/form-designer', component: () => import('@/views/FormDesigner/index.vue') },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
