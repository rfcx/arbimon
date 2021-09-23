import { NavigationGuardNext, NavigationGuardWithThis, RouteLocationNormalized } from 'vue-router'
import * as Vuex from 'vuex'

import { ACTIONS, RootState } from '@/stores'

export const createSelectProjectGuard = (store: Vuex.Store<RootState>): NavigationGuardWithThis<undefined> =>
  (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const currentProjectId = store.state.selectedProject?.id ?? ''
    const newProjectId = to.params.projectId // TODO 44: Extract `projectId` as a const?

    if (newProjectId !== currentProjectId) {
      void store.dispatch(ACTIONS.root.updateSelectedProject, store.state.projects?.find(p => p.id === newProjectId))
    }

    next()
  }
