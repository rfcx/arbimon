import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import * as NavBars from '@/components/page-navbar'
import * as Pages from '@/pages'
import { Auth0 } from '../auth'

export const ROUTES_NAME = Object.freeze({
  root: 'root',
  overview: 'overview',
  species_richness: 'species_richness'
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Pages.RootPage,
    beforeEnter: Auth0.routeGuard,
    children: [
      {
        path: '/',
        redirect: {
          name: ROUTES_NAME.overview
        }
      },
      {
        path: '/overview',
        name: ROUTES_NAME.overview,
        components: {
          default: Pages.OverviewPage,
          navbar: NavBars.Default
        }
      },
      {
        path: '/species_richness',
        name: ROUTES_NAME.species_richness,
        components: {
          default: Pages.SpeciesRichnessPage,
          navbar: NavBars.Default
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
