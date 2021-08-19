import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import * as Pages from '@/pages'

export const ROUTES_NAME = Object.freeze({
  root: 'root',
  overview: 'overview'
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Pages.RootPage,
    children: [
      {
        path: '/',
        redirect: {
          name: ROUTES_NAME.overview
        }
      },
      {
        path: '/overview',
        name: ROUTES_NAME.overview,
        component: Pages.OverviewPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
