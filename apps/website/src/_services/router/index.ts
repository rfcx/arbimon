import { type RouteRecordRaw, type RouterOptions, RouterView } from 'vue-router'

import { authRequiredGuard } from './guard-auth-required'
import { rfcxEmailRequired } from './guard-rfcx-email'
import { storeMemberGuard, storeProjectGuard } from './guard-store-project'
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
    path: '/explore',
    name: ROUTE_NAMES.explore,
    component: PAGES.Explore
  },
  {
    path: '/my-projects',
    name: ROUTE_NAMES.myProjects,
    component: PAGES.MyProjects,
    beforeEnter: [authRequiredGuard]
  },
  {
    path: '/create-project',
    name: ROUTE_NAMES.createProject,
    component: PAGES.CreateProject,
    beforeEnter: [authRequiredGuard]
  },
  {
    path: '/p/:projectSlug',
    component: PAGES.ProjectRoot,
    beforeEnter: [storeProjectGuard],
    redirect: { name: ROUTE_NAMES.overview },
    children: [
      {
        path: 'overview',
        name: ROUTE_NAMES.dashboard,
        component: PAGES.Dashboard,
        beforeEnter: [authRequiredGuard, storeMemberGuard]
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.projectSettings,
        component: PAGES.ProjectSettings,
        beforeEnter: [authRequiredGuard, storeMemberGuard]
      },
      {
        path: 'users',
        name: ROUTE_NAMES.projectMember,
        component: PAGES.ProjectMember,
        beforeEnter: [authRequiredGuard, storeMemberGuard]
      },
      {
        path: 'richness',
        redirect: to => {
          const projectSlug = to.params.projectSlug as string
          return `/p/${projectSlug}/insights/richness`
        }
      },
      {
        path: 'activity',
        redirect: to => {
          const projectSlug = to.params.projectSlug as string
          return `/p/${projectSlug}/insights/activity`
        }
      },
      {
        path: 'spotlight/:speciesSlug?',
        redirect: to => {
          const projectSlug = to.params.projectSlug as string
          const speciesSlug = (to.params?.speciesSlug ?? '') as string
          return `/p/${projectSlug}/insights/spotlight/${speciesSlug}`
        }
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
        beforeEnter: [authRequiredGuard, rfcxEmailRequired, storeMemberGuard],
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
        path: 'audiodata',
        component: RouterView,
        redirect: { name: ROUTE_NAMES.mySites },
        children: [
          {
            path: 'sites',
            name: ROUTE_NAMES.mySites,
            component: PAGES.MySites,
            beforeEnter: [authRequiredGuard, storeMemberGuard]
          },
          {
            path: 'recordings',
            name: ROUTE_NAMES.myRecordings,
            component: PAGES.MyRecordings,
            beforeEnter: [authRequiredGuard, storeMemberGuard]
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
      },
      {
        path: 'import-recordings',
        name: ROUTE_NAMES.importRecordings,
        component: PAGES.importRecordings
      }
    ]
  },
  {
    path: '/complete-profile',
    name: ROUTE_NAMES.userCompleteProfile,
    component: PAGES.UserCompleteProfile,
    beforeEnter: [authRequiredGuard]
  },
  {
    path: '/account-settings',
    name: ROUTE_NAMES.accountSettings,
    component: PAGES.AccountSettings,
    beforeEnter: [authRequiredGuard]
  },
  {
    path: '/callback',
    name: ROUTE_NAMES.callback,
    component: PAGES.Callback
  },
  {
    path: '/sa',
    name: ROUTE_NAMES.super,
    component: PAGES.Admin,
    redirect: { name: ROUTE_NAMES.superProject },
    beforeEnter: [authRequiredGuard],
    children: [
      {
        path: '',
        name: ROUTE_NAMES.superProject,
        component: PAGES.AdminProject
      },
      {
        path: ':projectId/members',
        name: ROUTE_NAMES.superMember,
        component: PAGES.AdminMember
      },
      {
        path: ':projectId/sync-history',
        name: ROUTE_NAMES.superSyncHistory,
        component: PAGES.superSyncHistory
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.error,
    component: PAGES.Error
  },
  {
    path: '/login',
    name: ROUTE_NAMES.login,
    component: PAGES.Auth
  },
  {
    path: '/signup',
    name: ROUTE_NAMES.signup,
    component: PAGES.Auth
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
      return { el: '.default-scroll-start', behavior: 'smooth' }
    }
  }
}

export default routerOptions
