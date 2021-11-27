import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { authRequiredGuard } from '~/auth/auth-required-guard'
import { selectProjectGuard } from '~/router/select-project-guard'
import * as PAGES from './pages'

export const ROUTE_NAMES = Object.freeze({
  home: 'home',
  dashboard: 'dashboard',
  species_richness: 'species_richness',
  activity_overview: 'activity_overview',
  activity_patterns: 'activity_patterns',
  preferences: 'preferences',
  error: 'error'
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.home,
    component: PAGES.Home
  },
  {
    path: '/preferences',
    name: ROUTE_NAMES.preferences,
    component: PAGES.Preferences
  },
  {
    path: '/:projectId',
    component: PAGES.ProjectRoot,
    beforeEnter: [authRequiredGuard, selectProjectGuard],
    children: [
      {
        path: '',
        name: ROUTE_NAMES.dashboard,
        component: PAGES.Dashboard
      },
      {
        path: 'richness',
        name: ROUTE_NAMES.species_richness,
        component: PAGES.SpeciesRichness
      },
      {
        path: 'activity',
        name: ROUTE_NAMES.activity_overview,
        component: PAGES.ActivityOverview
      },
      {
        path: 'spotlight/:speciesSlug?',
        name: ROUTE_NAMES.activity_patterns,
        component: PAGES.ActivityPatterns
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.error,
    component: PAGES.Error
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
