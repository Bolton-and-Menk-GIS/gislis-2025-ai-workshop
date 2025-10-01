import { createRouter, createWebHistory } from 'vue-router'

const baseUrl = import.meta.env.BASE_URL

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: ()=> import('@/views/Home.vue')
    },
    {
      path: '/ask',
      name: 'Ask',
      component: ()=> import('@/views/Ask.vue')
    },
    {
      path: '/survey',
      name: 'Survey',
      component: ()=> import('@/views/SurveyDemo.vue')
    },
    {
      path: '/rag',
      name: 'RAG',
      component: ()=> import('@/views/RAGDemo.vue')
    }
  ],
})

export default router
