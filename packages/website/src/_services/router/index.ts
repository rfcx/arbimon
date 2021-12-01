import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { authRequiredGuard } from '~/auth/auth-required-guard'
import { selectProjectGuard } from '~/router/select-project-guard'
import * as PAGES from './pages'

export const ROUTE_NAMES = <const>{
  home: 'home',
  dashboard: 'dashboard',
  speciesRichness: 'species_richness',
  activityOverview: 'activity_overview',
  activityPatterns: 'activity_patterns',
  preferences: 'preferences',
  error: 'error'
}
export type RouteNames = typeof ROUTE_NAMES

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
        name: ROUTE_NAMES.speciesRichness,
        component: PAGES.SpeciesRichness
      },
      {
        path: 'activity',
        name: ROUTE_NAMES.activityOverview,
        component: PAGES.ActivityOverview
      },
      {
        path: 'spotlight/:speciesSlug?',
        name: ROUTE_NAMES.activityPatterns,
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
