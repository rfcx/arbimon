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
        path: 'howitworks',
        name: ROUTE_NAMES.landingHowItWorks,
        component: PAGES.LandingHowItWorks
      },
      {
        path: 'publications',
        name: ROUTE_NAMES.landingPublications,
        component: PAGES.LandingPublications
      },
      {
        path: 'faq',
        name: ROUTE_NAMES.landingFAQ,
        component: PAGES.LandingFAQ
      },
      {
        path: 'about',
        name: ROUTE_NAMES.landingTeam,
        component: PAGES.LandingTeam
      },
      {
        path: 'contact',
        name: ROUTE_NAMES.landingContact,
        component: PAGES.LandingContact
      },
      {
        path: 'preferences',
        name: ROUTE_NAMES.userPreferences,
        component: PAGES.UserPreferences
      },
      {
        path: 'info',
        name: ROUTE_NAMES.info,
        component: PAGES.Info
      }
    ]
  },
  {
    path: '/projects',
    name: ROUTE_NAMES.explore,
    component: PAGES.Explore
  },
  {
    path: '/my-projects',
    name: ROUTE_NAMES.myProjects,
    component: PAGES.MyProjects,
    beforeEnter: [storeProjectGuard, authRequiredGuard]
  },
  {
    path: '/create-project',
    name: ROUTE_NAMES.createProject,
    component: PAGES.CreateProject,
    beforeEnter: [storeProjectGuard, authRequiredGuard]
  },
  {
    path: '/p/:projectSlug',
    component: PAGES.ProjectRoot,
    beforeEnter: [storeProjectGuard],
    redirect: { name: ROUTE_NAMES.overview },
    children: [
      {
        path: 'dashboard',
        name: ROUTE_NAMES.dashboard,
        component: PAGES.Dashboard
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.projectSettings,
        component: PAGES.ProjectSettings
      },
      {
        path: 'insights',
        component: PAGES.InsightsRoot,
        children: [
          {
            path: '',
            name: ROUTE_NAMES.overview,
            component: PAGES.InsightsOverview
          },
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
        path: 'analyse',
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
    path: '/complete-registration',
    name: ROUTE_NAMES.userCompleteRegistration,
    component: PAGES.UserCompleteRegistration,
    beforeEnter: [authRequiredGuard]
  },
  {
    path: '/callback',
    name: ROUTE_NAMES.callback,
    component: PAGES.Callback
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
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { el: '#default-scroll-start', behavior: 'smooth' }
    }
  }
}

export default routerOptions
