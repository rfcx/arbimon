import { type RouteRecordRaw, type RouterOptions, RouterView } from 'vue-router'

import { authRequiredGuard } from './guard-auth-required'
import { storeProjectGuard } from './guard-store-project'
import * as PAGES from './pages'
import { ROUTE_NAMES } from './route-names'

export * from './route-names'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PAGES.LandingRoot,
    children: [
      {
        path: '',
        name: ROUTE_NAMES.landingHome,
        component: PAGES.LandingHome
      },
      {
        path: 'featured',
        name: ROUTE_NAMES.landingFeatured,
        component: PAGES.LandingFeatured
      },
      {
        path: 'featured/:slug',
        name: ROUTE_NAMES.landingFeaturedDetail,
        component: PAGES.LandingFeaturedDetail
      },
      {
        path: 'explore',
        name: ROUTE_NAMES.explore,
        component: PAGES.Explore
      },
      {
        path: 'howitworks',
        name: ROUTE_NAMES.landingHowItWorks,
        component: PAGES.LandingHowItWorks
      },
      {
        path: 'faq',
        name: ROUTE_NAMES.landingFAQ,
        component: PAGES.LandingFAQ
      },
      {
        path: 'contact',
        name: ROUTE_NAMES.landingContact,
        component: PAGES.LandingContact
      },
      {
        path: 'preferences',
        name: ROUTE_NAMES.preferences,
        component: PAGES.Preferences
      },
      {
        path: 'info',
        name: ROUTE_NAMES.info,
        component: PAGES.Info
      }
    ]
  },
  {
    path: '/p/:projectSlug',
    component: PAGES.ProjectRoot,
    beforeEnter: [storeProjectGuard],
    children: [
      {
        path: '',
        name: ROUTE_NAMES.overview,
        component: PAGES.ProjectOverview
      },
      {
        path: 'insights/',
        component: RouterView,
        redirect: { name: ROUTE_NAMES.speciesRichness },
        children: [
          {
            path: 'richness',
            name: ROUTE_NAMES.speciesRichness,
            component: PAGES.InsightsSpeciesRichness
          },
          {
            path: 'activity',
            name: ROUTE_NAMES.activityOverview,
            component: PAGES.InsightsActivityOverview
          },
          {
            path: 'spotlight/:speciesSlug?',
            name: ROUTE_NAMES.activityPatterns,
            component: PAGES.InsightsActivityPatterns
          },
          {
            path: 'sync-history',
            name: ROUTE_NAMES.syncHistory,
            component: PAGES.InsightsSyncHistory
          }
        ]
      },
      {
        path: 'analyse/',
        component: RouterView,
        redirect: { name: ROUTE_NAMES.cnnJobList },
        beforeEnter: [authRequiredGuard],
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
        path: 'import',
        name: ROUTE_NAMES.import,
        component: RouterView,
        beforeEnter: [authRequiredGuard],
        children: [
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.error,
    component: PAGES.Error
  }
]

const routerOptions: Omit<RouterOptions, 'history'> = {
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (!to.hash) return { top: 0 }
    return {
      el: to.hash,
      behavior: 'smooth'
    }
  }
}

export default routerOptions
