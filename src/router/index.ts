import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import * as Pages from '@/pages'

export const ROUTES_NAME = Object.freeze({
  root: 'root',
  overview: 'overview',
  species_richness: 'species_richness',
  error: 'error'
})

const routes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    component: Pages.ErrorPage
  },
  // { path: '/project/:id', component: Pages.RootPage },
  {
    path: '/project/:projectId',
    component: Pages.RootPage,
    // beforeEnter: (to, from, next) => {
    //   console.log('to: ', to)
    //   console.log('from: ', from)
    //   console.log('new: ', next)
    // },
    children: [
      {
        path: '/project/:projectId/',
        redirect: {
          name: ROUTES_NAME.overview
        }
      },
      {
        path: '/project/:projectId/overview',
        name: ROUTES_NAME.overview,
        component: Pages.OverviewPage
      },
      {
        path: '/project/:projectId/species_richness',
        name: ROUTES_NAME.species_richness,
        component: Pages.SpeciesRichnessPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
