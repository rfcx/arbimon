import { NavigationGuardWithThis } from 'vue-router'

import { useAuth0Client } from '~/auth-client'
import { useStore } from '~/store'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  const store = useStore()
  const currentProjectSlug = store.selectedProject?.slug
  const newProjectSlug = to.params.projectSlug // TODO 44: Extract `projectSlug` as a const?

  if (newProjectSlug !== currentProjectSlug) {
    const project = store.projects?.find(p => p.slug === newProjectSlug)
    if (project) {
      // Project found
      await store.updateSelectedProject(project)
    } else {
      const auth0Client = await useAuth0Client()
      if (await auth0Client.isAuthenticated()) {
        // Definitely no access to project
        await store.updateSelectedProject(undefined)
      } else {
        // Might need to login
        await auth0Client.loginWithRedirect({ appState: { redirectPath: to.fullPath } })
      }
    }
  }

  next()
}
