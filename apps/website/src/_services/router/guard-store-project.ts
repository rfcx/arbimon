import { type NavigationGuardWithThis } from 'vue-router'

import { type ProjectRole, rolesGreaterOrEqualTo } from '@rfcx-bio/common/roles'

import { useProjectUserPermissionsStore, useStore } from '~/store'

export const storeProjectGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  const store = useStore()
  const userPermissionsStore = useProjectUserPermissionsStore()
  const newProjectSlug = to.params.projectSlug // TODO 44: Extract `projectSlug` as a const?

  await store.updateSelectedProjectSlug(newProjectSlug as string)
  const project = store.selectedProject

  if (project) {
    await store.updateProjectFilters()
    await userPermissionsStore.getRole(project.id ?? -1)
  } else {
    await resetSelectedProject()
  }

  next()
}

export const storePublicGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  if (!hasRoleGreaterThan('external')) {
    await resetSelectedProject()
  }
  next()
}

export const storeMemberGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  if (!hasRoleGreaterThan('viewer')) {
    await resetSelectedProject()
  }
  next()
}

const hasRoleGreaterThan = (minimumRole: ProjectRole): boolean => {
  const userPermissionsStore = useProjectUserPermissionsStore()
  const currentRole = userPermissionsStore.role ?? 'none'
  return rolesGreaterOrEqualTo(minimumRole).includes(currentRole)
}

const resetSelectedProject = async (): Promise<void> => {
  const store = useStore()
  const userPermissionsStore = useProjectUserPermissionsStore()
  store.updateSelectedProject(undefined)
  await store.updateProjectFilters()
  userPermissionsStore.role = undefined
}
