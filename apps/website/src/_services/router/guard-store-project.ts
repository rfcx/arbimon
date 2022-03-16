import { NavigationGuardWithThis } from 'vue-router'

import { useStore } from '~/store'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  const store = useStore()
  const currentProjectSlug = store.selectedProject?.slug
  const newProjectSlug = to.params.projectSlug // TODO 44: Extract `projectSlug` as a const?

  if (newProjectSlug !== currentProjectSlug) {
    await store.updateSelectedProject(store.projects?.find(p => p.slug === newProjectSlug))
  }

  next()
}
