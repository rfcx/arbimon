import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { authRequiredGuard } from '~/auth/auth-required-guard'
import { selectProjectGuard } from '~/router/select-project-guard'
import * as PAGES from './pages'

export const ROUTE_NAMES = Object.freeze({
  home: 'home',
  overview: 'overview',
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
    path: '/project/:projectId',
    component: PAGES.ProjectRoot,
    beforeEnter: [authRequiredGuard, selectProjectGuard],
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
        path: 'activity-overview',
        name: ROUTE_NAMES.activity_overview,
        component: PAGES.ActivityOverviewPage
      },
      {
        path: 'activity-patterns/:speciesSlug?',
        name: ROUTE_NAMES.activity_patterns,
        component: PAGES.ActivityPatterns
      }
    ]
  },
  {
    path: '/preferences',
    name: ROUTE_NAMES.preferences,
    component: PAGES.Preferences
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
