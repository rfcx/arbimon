<template>
  <template v-if="stakeholders?.organization.length === 0 && stakeholders?.user.length === 0 && !isEditing">
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
      :organizations="stakeholders?.organization ?? []"
      @emit-is-updating="isEditing = true"
    />
    <DashboardProjectStakeholdersEditor
      v-show="isEditing === true"
      :organizations="stakeholders?.organization ?? []"
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
import { useUpdateStakeholdersOrganizationsList } from '../../../../composables/use-update-stakeholders-organizations'
import ProjectSummaryEmpty from '../project-summary-empty.vue'
import ProjectSummaryEmptyGuestView from '../project-summary-empty-guest-view.vue'
import DashboardProjectStakeholdersEditor from './dashboard-project-stakeholders-editor.vue'
import DashboardProjectStakeholdersViewer from './dashboard-project-stakeholders-viewer.vue'

defineProps<{ editable: boolean, isProjectMember: boolean, isViewingAsGuest: boolean }>()

const isEditing = ref(false)
const store = useStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const { data: stakeholders, refetch: refetchStakeholdersData } = useGetDashboardStakeholders(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateStakeholdersOrganizations } = useUpdateStakeholdersOrganizationsList(apiClientBio, store.selectedProject?.id ?? -1)

const onFinishedEditing = (ids: number[]): void => {
  mutateStakeholdersOrganizations(ids, {
    onSuccess: () => {
      refetchStakeholdersData.value()
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
