import { NavigationGuardNext, NavigationGuardWithThis, RouteLocationNormalized } from 'vue-router'

import { useStore } from '~/store'

const createSelectProjectGuard = (): NavigationGuardWithThis<undefined> =>
  (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const store = useStore()
    const currentProjectId = store.selectedProject?.id
    const newProjectId = to.params.projectId // TODO 44: Extract `projectId` as a const?

    if (newProjectId !== currentProjectId) {
      store.updateSelectedProject(store.projects?.find(p => p.id === newProjectId))
    }

    next()
  }

export const selectProjectGuard = createSelectProjectGuard()
