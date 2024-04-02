import { type NavigationGuardWithThis } from 'vue-router'

import { useStore } from '~/store'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  const store = useStore()
  const newProjectSlug = to.params.projectSlug // TODO 44: Extract `projectSlug` as a const?

  await store.updateSelectedProjectSlug(newProjectSlug as string)
  const project = store.project

  if (project) {
    await store.updateProjectFilters()
  }
  next()
}

export const storeMemberGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  const store = useStore()
  if (!store.userIsProjectMember) {
    store.updateSelectedProject(undefined)
  }
  next()
}
