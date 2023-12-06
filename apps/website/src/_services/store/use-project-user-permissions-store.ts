import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { type GetProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'
import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { getApiClient } from '@rfcx-bio/utils/api'

import { getIdToken, useAuth0Client } from '~/auth-client'
import { useStore } from './index'

/**
 * A store that stores information about project member's permissions of each person to help display the UI based on who's logging in to the project at the time.
 *
 * The store works like this
 *
 * - When user first enters the page
 *   - Checks if that person is logged in.
 *     - Get the information if he's logged in.
 *       - Compare the email with currently logged in user's email and get the person's role.
 *       - If the role is 'Guest', hide all edit buttons.
 *     - Otherwise hide all edit buttons because they can only view the insights page.
 *
 * - Refetch this API when user changes the project. If the project changes to null, only clear the data and don't query for new data.
 */
export const useProjectUserPermissionsStore = defineStore('project-user-permissions-store', () => {
  const projectMembers = ref<CoreUser[]>([])
  const permissionOverride = ref<null | CoreUser['role']>(null)
  const store = useStore()

  const getProjectMembers = async (id: number): Promise<void> => {
    if (id == null || id === -1) {
      projectMembers.value = []
      permissionOverride.value = null
      return
    }

    const authClient = await useAuth0Client()
    const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, async () => await getIdToken(authClient))

    try {
      const members = await apiClient.get<GetProjectMembersResponse>(`/projects/${id}/users`)
      permissionOverride.value = null
      projectMembers.value = members.data
    } catch (_e) {
      // guaranteed Guest
      permissionOverride.value = 'Guest'
      projectMembers.value = []
    }
  }

  const currentUserRoleOfCurrentProject = computed<CoreUser['role']>(() => {
    if (permissionOverride.value != null) {
      return permissionOverride.value
    }

    if (projectMembers.value.length === 0 && (store.selectedProject?.isMyProject ?? false)) {
      return 'Admin'
    }

    if (projectMembers.value.length === 0) {
      return 'Guest'
    }

    if (store.user == null || store.user?.email == null) {
      return 'Guest'
    }

    const userIndex = projectMembers.value.findIndex(m => m.email === store.user?.email)
    if (userIndex === -1) {
      return 'Guest'
    }

    return projectMembers.value[userIndex]?.role ?? 'Guest'
  })

  const isGuest = computed<boolean>(() => {
    return currentUserRoleOfCurrentProject.value === 'Guest'
  })

  return {
    projectMembers,
    getProjectMembers,
    currentUserRoleOfCurrentProject,
    isGuest
  }
})
