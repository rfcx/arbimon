import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { type GetProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'

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
  const projectMembers = ref<GetProjectMembersResponse>([])
  const permissionOverride = ref<number | undefined>(undefined)
  const store = useStore()

  const getProjectMembers = async (id: number): Promise<void> => {
    if (id == null || id === -1) {
      projectMembers.value = []
      permissionOverride.value = undefined
      return
    }

    const members = await axios.get<GetProjectMembersResponse>(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/users`, { timeout: 30 * 1000 })
    projectMembers.value = members.data
    permissionOverride.value = undefined
  }

  const currentUserRoleOfCurrentProject = computed<number>(() => {
    if (permissionOverride.value !== undefined) {
      return permissionOverride.value
    }

    // This means not logged in. So guest
    if (store.user == null || store.user?.email == null) {
      return 3
    }

    const userIndex = projectMembers.value.findIndex(m => m.email === store.user?.email)
    if (userIndex === -1) {
      return 3
    }

    return projectMembers.value[userIndex]?.roleId ?? 3
  })

  const isGuest = computed<boolean>(() => {
    return currentUserRoleOfCurrentProject.value === 3 // legacy arbimon's guest role
  })

  return {
    projectMembers,
    getProjectMembers,
    currentUserRoleOfCurrentProject,
    isGuest
  }
})
