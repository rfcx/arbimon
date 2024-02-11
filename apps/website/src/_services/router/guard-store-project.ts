import { type NavigationGuardWithThis } from 'vue-router'

import { rolesGreaterOrEqualTo } from '@rfcx-bio/common/roles'

import { useAuth0Client } from '~/auth-client'
import { useProjectUserPermissionsStore, useStore } from '~/store'
import { ROUTE_NAMES } from './route-names'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  const store = useStore()
  const userPermissionsStore = useProjectUserPermissionsStore()
  const currentProjectSlug = store.selectedProject?.slug
  const newProjectSlug = to.params.projectSlug // TODO 44: Extract `projectSlug` as a const?

  if (newProjectSlug !== currentProjectSlug) {
    const project = store.projects?.find(p => p.slug === newProjectSlug)

    if (project) {
      // Project found
      store.updateSelectedProject(project)
      await store.updateProjectFilters()
      await userPermissionsStore.getRole(project.id ?? -1)
    } else {
      const auth0Client = await useAuth0Client()
      if (await auth0Client.isAuthenticated()) {
        // Definitely no access to project
        store.updateSelectedProject(undefined)
        await store.updateProjectFilters()
        userPermissionsStore.role = undefined
      } else {
        // Might need to login
        await auth0Client.loginWithRedirect({ appState: { target: to.fullPath } })
      }
    }
  } else {
    // just need to update the filters when both of it is the same already.
    await store.updateProjectFilters()
    await userPermissionsStore.getRole(store.selectedProject?.id ?? -1)
  }

  next()
}

export const storeMemberGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  const userPermissionsStore = useProjectUserPermissionsStore()
  const currentRole = userPermissionsStore.role ?? 'none'
  if (rolesGreaterOrEqualTo('viewer').includes(currentRole)) {
    next()
  } else {
    next({ name: ROUTE_NAMES.error, query: { error: 'This project either does not exist or you do not have permission to access it.' } })
  }
}
