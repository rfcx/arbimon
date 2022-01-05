import { NavigationGuardWithThis } from 'vue-router'

import { useStore } from '~/store'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = (to, from, next) => {
  const store = useStore()
  const currentProjectId = store.selectedProject?.id
  const newProjectId = to.params.projectId // TODO 44: Extract `projectId` as a const?

  if (newProjectId !== currentProjectId) {
    store.updateSelectedProject(store.projects?.find(p => p.id === newProjectId))
  }

  next()
}
