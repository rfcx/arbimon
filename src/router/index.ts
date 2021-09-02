import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import * as Pages from '@/pages'
import authGuard from '../auth/authGuard'

export const ROUTES_NAME = Object.freeze({
  root: 'root',
  overview: 'overview',
  species_richness: 'species_richness'
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Pages.RootPage,
    beforeEnter: authGuard,
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
      },
      {
        path: '/species_richness',
        name: ROUTES_NAME.species_richness,
        component: Pages.SpeciesRichnessPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
