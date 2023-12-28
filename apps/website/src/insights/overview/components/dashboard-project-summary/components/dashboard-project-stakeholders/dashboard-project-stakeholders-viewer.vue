<template>
  <div class="px-6 pb-6">
    <div
      v-if="projectUserPermissionsStore.role === 'owner' || projectUserPermissionsStore.role === 'admin'"
      class="flex w-full justify-end mt-6"
    >
      <button
        class="btn btn-primary font-medium flex flex-row py-2 px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="loading"
        @click="$emit('emit-is-updating')"
      >
        Edit displayed stakeholders
        <icon-custom-ic-edit class="ml-2 w-4 h-4 self-center" />
      </button>
    </div>
    <h3 class="text-white text-xl font-medium font-sans mt-2">
      Project members
    </h3>
    <div
      v-if="loading"
      class="py-2"
    >
      <icon-fas-spinner class="animate-spin inline w-4 h-4 mr-1" /> Loading...
    </div>
    <div
      v-else
      class="grid"
      style="grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr))"
    >
      <StakeholderCard
        v-for="(member, idx) of projectMembers"
        :key="idx"
        :name="member.firstName + ' ' + member.lastName"
        :image="member.image ?? undefined"
        :email="member.email ?? ''"
        :ranking="member.ranking"
      />
    </div>
    <h3 class="text-white text-xl font-medium font-sans mt-6">
      Affiliated organizations
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
        :image="org.image ?? undefined"
        :ranking="1"
      />
    </div>
    <StakeholdersTosBanner
      v-if="store.user === null"
      class="mt-6"
    />
  </div>
</template>

<script setup lang="ts">
import { type DashboardStakeholdersUser } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { type OrganizationTypes, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import { useProjectUserPermissionsStore, useStore } from '~/store'
import StakeholderCard from './stakeholder-card.vue'
import StakeholdersTosBanner from './stakeholders-tos-banner.vue'

defineProps<{
  editable: boolean,
  loading: boolean,
  organizations: Array<OrganizationTypes['light']>
  projectMembers: Array<DashboardStakeholdersUser>
}>()
defineEmits<{(event: 'emit-is-updating'): void}>()

const store = useStore()

const projectUserPermissionsStore = useProjectUserPermissionsStore()
</script>
