import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import stores from '@/_services/stores'
import { Auth0 } from '../auth'
import * as PAGES from './pages'
import { createSelectProjectGuard } from './select-project-guard'

export const ROUTE_NAMES = Object.freeze({
  home: 'home',
  overview: 'overview',
  species_richness: 'species_richness',
  activity_patterns: 'activity_patterns',
  error: 'error'
})

const selectProjectGuard = createSelectProjectGuard(stores)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.home,
    component: PAGES.AppHome
  },
  {
    path: '/project/:projectId',
    component: PAGES.AppRoot,
    beforeEnter: [Auth0.routeGuard, selectProjectGuard],
    children: [
      {
        path: '',
        name: ROUTE_NAMES.overview,
        component: PAGES.Overview
      },
      {
        path: 'species-richness',
        name: ROUTE_NAMES.species_richness,
        component: PAGES.SpeciesRichness
      },
      {
        path: 'activity-patterns/:speciesSlug?',
        name: ROUTE_NAMES.activity_patterns,
        component: PAGES.ActivityPatterns
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.error,
    component: PAGES.AppError
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
