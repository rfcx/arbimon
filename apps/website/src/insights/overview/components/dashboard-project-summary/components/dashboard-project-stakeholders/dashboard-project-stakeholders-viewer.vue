<template>
  <div class="px-6 pb-6">
    <div
      v-if="isProjectMember && !isExternalGuest"
      class="flex w-full justify-end mt-6"
    >
      <button
        v-if="!store.userIsAdminProjectMember"
        class="btn btn-primary font-medium flex flex-row py-2 px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        data-tooltip-target="editStakeholdersTooltipId"
        data-tooltip-placement="bottom"
        :disabled="loading || !editable"
        @click="$emit('emit-is-updating')"
      >
        Edit stakeholders
        <icon-custom-ic-edit class="ml-2 w-4 h-4 self-center" />
      </button>
      <div
        v-if="!editable"
        id="editStakeholdersTooltipId"
        role="tooltip"
        class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ disableText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
    <div v-if="projectMembers.length !== 0">
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
          :name="memberName(member.firstName, member.lastName)"
          :image="member.image ?? undefined"
          :email="member.email ?? ''"
          :ranking="member.ranking"
        />
      </div>
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
    <div
      v-if="organizations.length === 0"
      class="mt-4"
    >
      <dashboard-project-stakeholders-empty
        v-if="editable && store.userIsAdminProjectMember"
        @emit-add-stakeholders="$emit('emit-is-updating')"
      />
      <ProjectSummaryEmptyForNonProjectMember v-else />
    </div>
    <StakeholdersTosBanner
      v-if="store.user === null"
      class="mt-6"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { type DashboardStakeholdersUser } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { type OrganizationTypes, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'
import { memberName } from '@rfcx-bio/utils/string'

import { useStore } from '~/store'
import ProjectSummaryEmptyForNonProjectMember from '../project-summary-empty-for-non-project-member.vue'
import DashboardProjectStakeholdersEmpty from './dashboard-project-stakeholders-empty.vue'
import StakeholderCard from './stakeholder-card.vue'
import StakeholdersTosBanner from './stakeholders-tos-banner.vue'

defineProps<{
  editable: boolean,
  isProjectMember: boolean,
  isExternalGuest: boolean,
  loading: boolean,
  organizations: Array<OrganizationTypes['light']>
  projectMembers: Array<DashboardStakeholdersUser>
}>()
defineEmits<{(event: 'emit-is-updating'): void}>()

const store = useStore()

const disableText = ref('Contact your project administrator for permission to edit stakeholders')
</script>
