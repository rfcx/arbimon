<template>
  <template v-if="stakeholders?.organizations.length === 0 && stakeholders?.users.length === 0 && !isEditing">
    <ProjectSummaryEmpty
      v-if="editable"
      @emit-add-content="isEditing = true"
    />
    <ProjectSummaryEmptyGuestView v-else />
  </template>
  <template v-else>
    <DashboardProjectStakeholdersViewer
      v-show="isEditing === false"
      :editable="editable"
      :organizations="stakeholders?.organizations ?? []"
      :project-members="stakeholders?.users ?? []"
      @emit-is-updating="isEditing = true"
    />
    <DashboardProjectStakeholdersEditor
      v-show="isEditing === true"
      :organizations="stakeholders?.organizations ?? []"
      :project-members="stakeholders?.users ?? []"
      @emit-finished-editing="onFinishedEditing"
    />
  </template>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { inject, ref } from 'vue'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useGetDashboardStakeholders } from '../../../../composables/use-get-dashboard-stakeholders'
import { useUpdateDashboardStakeholders } from '../../../../composables/use-update-stakeholders'
import ProjectSummaryEmpty from '../project-summary-empty.vue'
import ProjectSummaryEmptyGuestView from '../project-summary-empty-guest-view.vue'
import DashboardProjectStakeholdersEditor from './dashboard-project-stakeholders-editor.vue'
import DashboardProjectStakeholdersViewer from './dashboard-project-stakeholders-viewer.vue'

defineProps<{ editable: boolean, isProjectMember: boolean, isViewingAsGuest: boolean }>()

const isEditing = ref(false)
const store = useStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const { data: stakeholders, refetch: refetchStakeholdersData } = useGetDashboardStakeholders(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateStakeholders } = useUpdateDashboardStakeholders(apiClientBio, store.selectedProject?.id ?? -1)
// TODO: only selected project stakeholders are shown in the DashboardProjectStakeholdersViewer

const onFinishedEditing = (ids: number[]): void => {
  mutateStakeholders({ users: [], organizations: ids }, {
    onSuccess: async () => {
      await refetchStakeholdersData()
      isEditing.value = false
    },
    onError: () => {
      // TODO: Show user some respect
      isEditing.value = false
    }
  })

  isEditing.value = false
}
</script>
