import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { useStoreOutsideSetup } from '~/store'
import { storeProjectGuard } from './guard-store-project'
import * as PAGES from './pages'
import { ROUTE_NAMES } from './route-names'

export * from './route-names'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.home,
    component: PAGES.Home,
    beforeEnter: (to, from, next) => {
      const store = useStoreOutsideSetup()
      if (store.selectedProject) return next({ name: ROUTE_NAMES.dashboard, params: { projectSlug: store.selectedProject.slug } })
      next()
    }
  },
  {
    path: '/preferences',
    name: ROUTE_NAMES.preferences,
    component: PAGES.Preferences
  },
  {
    path: '/:projectSlug',
    component: PAGES.ProjectRoot,
    beforeEnter: [storeProjectGuard],
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
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (!to.hash) return { top: 0 }
    return {
      el: to.hash,
      behavior: 'smooth'
    }
  }
})

export default router
