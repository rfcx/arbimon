import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { authRequiredGuard } from './guard-auth-required'
import { storeProjectGuard } from './guard-store-project'
import * as PAGES from './pages'
import { ROUTE_NAMES } from './route-names'

export * from './route-names'

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
    beforeEnter: [authRequiredGuard, storeProjectGuard],
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
      },
      {
        path: 'info/:topic',
        name: ROUTE_NAMES.info,
        component: PAGES.Info
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
