<template>
  <template v-if="organizations.length === 0">
    <ProjectSummaryEmpty @emit-add-content="$emit('update:isEditing', true)" />
  </template>
  <template v-else>
    <h3 class="text-white text-xl font-medium font-sans mt-10">
      Project members
    </h3>
    <div
      class="grid"
      style="grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr))"
    >
      <StakeholderCard
        name="Lori Tan"
        :ranking="0"
        email="loritan@tmu.com"
      />
      <StakeholderCard
        name="Lori Tan"
        :ranking="1"
      />
      <StakeholderCard
        name="Lori Tan"
        :ranking="1"
      />
      <StakeholderCard
        name="Lori Tan"
        :ranking="1"
      />
      <StakeholderCard
        name="Lori Tan"
        :ranking="1"
      />
      <StakeholderCard
        name="Lori Tan"
        :ranking="1"
      />
    </div>
    <h3 class="text-white text-xl font-medium font-sans mt-6">
      Organizations
    </h3>
    <div
      class="grid"
      style="grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr))"
    >
      <StakeholderCard
        v-for="org of organizations"
        :key="org.id"
        :name="org.name"
        :description="ORGANIZATION_TYPE_NAME[org.type]"
        :ranking="1"
      />
    </div>
    <div class="flex w-full justify-end mt-6">
      <button
        v-show="editable"
        class="btn btn-secondary"
      >
        Manage stakeholders
      </button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { type OrganizationTypes, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import ProjectSummaryEmpty from '../project-summary-empty.vue'
import StakeholderCard from './stakeholder-card.vue'

defineProps<{
  isEditing: boolean,
  editable: boolean,
  organizations: Array<OrganizationTypes['light']>
}>()
defineEmits<{(event: 'update:isEditing', value: boolean): void}>()
</script>