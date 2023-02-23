import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { authRequiredGuard } from './guard-auth-required'
import { storeProjectGuard } from './guard-store-project'
import * as PAGES from './pages'
import { ROUTE_NAMES } from './route-names'

export * from './route-names'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.landingHome,
    component: PAGES.LandingHome
  },
  {
    path: '/featured',
    name: ROUTE_NAMES.landingFeatured,
    component: PAGES.LandingFeatured
  },
  {
    path: '/explore',
    name: ROUTE_NAMES.explore,
    component: PAGES.Explore
  },
  {
    path: '/howitworks',
    name: ROUTE_NAMES.landingHowItWorks,
    component: PAGES.LandingHowItWorks
  },
  {
    path: '/faq',
    name: ROUTE_NAMES.landingFAQ,
    component: PAGES.LandingFAQ
  },
  {
    path: '/preferences',
    name: ROUTE_NAMES.preferences,
    component: PAGES.Preferences
  },
  {
    path: '/info/:topic',
    name: ROUTE_NAMES.info,
    component: PAGES.Info
  },
  {
    path: '/:projectSlug/detect',
    component: PAGES.AppGlobalRoot,
    redirect: { name: ROUTE_NAMES.cnnJobList },
    beforeEnter: [authRequiredGuard, storeProjectGuard],
    children: [
      {
        path: 'cnn',
        name: ROUTE_NAMES.cnnJobList,
        component: PAGES.CnnJobList
      },
      {
        path: 'cnn/create',
        name: ROUTE_NAMES.cnnJobCreate,
        component: PAGES.CnnJobCreate
      },
      {
        path: 'cnn/detail/:jobId',
        name: ROUTE_NAMES.cnnJobDetail,
        component: PAGES.CnnJobDetail
      },
      {
        path: 'cnn/detail/:jobId/:speciesSlug',
        name: ROUTE_NAMES.cnnJobDetailBySpecies,
        component: PAGES.CnnJobDetailBySpecies
      }
    ]
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
        path: 'sync-history',
        name: ROUTE_NAMES.syncHistory,
        component: PAGES.SyncHistory
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
