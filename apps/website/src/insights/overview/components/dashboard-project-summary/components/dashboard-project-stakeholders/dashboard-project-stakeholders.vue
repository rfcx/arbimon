<template>
  <template v-if="organizations.length === 0">
    <ProjectSummaryEmpty @emit-add-content="isEditing = true" />
  </template>
  <template v-else>
    <DashboardProjectStakeholdersViewer
      v-show="isEditing === false"
      :editable="true"
      :organizations="organizations"
      @emit-is-updating="isEditing = true"
    />
    <DashboardProjectStakeholdersEditor
      v-show="isEditing === true"
      :organizations="organizations"
      @emit-finished-editing="isEditing = false"
    />
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { type OrganizationTypes } from '@rfcx-bio/common/dao/types/organization'

import ProjectSummaryEmpty from '../project-summary-empty.vue'
import DashboardProjectStakeholdersEditor from './dashboard-project-stakeholders-editor.vue'
import DashboardProjectStakeholdersViewer from './dashboard-project-stakeholders-viewer.vue'

const isEditing = ref(false)

defineProps<{
  editable: boolean,
  organizations: Array<OrganizationTypes['light']>
}>()
</script>
