<template>
  <template v-if="stakeholders?.organizations.length === 0 && stakeholders?.users.filter(u => u.ranking > -1).length === 0 && !isEditing">
    <ProjectSummaryEmpty
      v-if="editable && store.userIsAdminProjectMember"
      @emit-add-content="isEditing = true"
    />
  </template>
  <template v-else>
    <DashboardProjectStakeholdersViewer
      v-if="isEditing === false"
      :editable="editable"
      :is-project-member="isProjectMember"
      :is-external-guest="isViewingAsGuest"
      :loading="stakeholdersLoading || stakeholdersRefetching || isUpdating"
      :organizations="stakeholders?.organizations ?? []"
      :project-members="stakeholders?.users.filter(u => u.ranking !== -1).sort((a, b) => a.ranking - b.ranking) ?? []"
      @emit-is-updating="isEditing = true"
    />
    <DashboardProjectStakeholdersEditor
      v-if="isEditing === true"
      :organizations="stakeholders?.organizations ?? []"
      :project-members="stakeholders?.users ?? []"
      @emit-finished-editing="onFinishedEditing"
    />
  </template>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type UpdateDashboardStakeholdersRequestBodyUser } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useGetDashboardStakeholders } from '../../../../composables/use-get-dashboard-stakeholders'
import { useUpdateDashboardStakeholders } from '../../../../composables/use-update-stakeholders'
import ProjectSummaryEmpty from '../project-summary-empty.vue'
import DashboardProjectStakeholdersEditor from './dashboard-project-stakeholders-editor.vue'
import DashboardProjectStakeholdersViewer from './dashboard-project-stakeholders-viewer.vue'

const props = defineProps<{ editable: boolean, isProjectMember: boolean, isViewingAsGuest: boolean, isSelectedTab: boolean }>()

const isEditing = ref(false)
const isUpdating = ref(false)
const store = useStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const { isLoading: stakeholdersLoading, data: stakeholders, isRefetching: stakeholdersRefetching, refetch: refetchStakeholdersData } = useGetDashboardStakeholders(apiClientBio, store.project?.id ?? -1, computed(() => props.isSelectedTab))
const { mutate: mutateStakeholders } = useUpdateDashboardStakeholders(apiClientBio, store.project?.id ?? -1)

const onFinishedEditing = (ids: number[], selectedProjectMembers: UpdateDashboardStakeholdersRequestBodyUser[]): void => {
  isUpdating.value = true
  mutateStakeholders({ users: selectedProjectMembers, organizations: ids }, {
    onSuccess: async () => {
      await refetchStakeholdersData()
      isEditing.value = false
      isUpdating.value = false
    },
    onError: () => {
      // TODO: Show user some respect
      isEditing.value = false
      isUpdating.value = false
    }
  })

  isEditing.value = false
}
</script>
