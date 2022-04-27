import { NavigationGuardWithThis } from 'vue-router'

import { useStore } from '~/store'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  const store = useStore()
  const newProjectSlug = Array.isArray(to.params.projectSlug) ? to.params.projectSlug[0] : to.params.projectSlug // TODO 44: Extract `projectSlug` as a const?

  if (newProjectSlug !== store.selectedProjectSlug) {
    await store.updateSelectedProjectSlug(newProjectSlug)
  }

  next()
}
