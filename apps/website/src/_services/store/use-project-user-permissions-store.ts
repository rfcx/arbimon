import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { type ProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'
import { apiBioGetProjectRole } from '@rfcx-bio/common/api-bio/project/project-role'
import { type ProjectRole } from '@rfcx-bio/common/roles'
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
  const role = ref<ProjectRole | undefined>(undefined)
  const projectMembers = ref<ProjectMembersResponse>([])
  const store = useStore()

  const getRole = async (id: number): Promise<void> => {
    if (id == null || id === -1) {
      role.value = undefined
      return
    }
    const authClient = await useAuth0Client()
    const apiClient = getApiClient(import.meta.env.VITE_API_BASE_URL, store.user ? async () => await getIdToken(authClient) : undefined)
    role.value = await apiBioGetProjectRole(apiClient, id)
  }

  const isExternalGuest = computed<boolean>(() => {
    return role.value === 'external'
  })

  return {
    role,
    projectMembers,
    getRole,
    isExternalGuest
  }
})
