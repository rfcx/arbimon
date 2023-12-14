<template>
  <div class="px-6 pb-6">
    <h3 class="text-white text-xl font-medium font-sans mt-2">
      Project members
    </h3>
    <div
      class="grid"
      style="grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr))"
    >
      <StakeholderCard
        v-for="(member, idx) of projectMembers"
        :key="idx"
        :name="member.firstname + ' ' + member.lastname"
        :image="member.picture ?? undefined"
        :email="member.email ?? ''"
        :ranking="1"
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
    <div
      v-if="editable"
      class="flex w-full justify-end mt-6"
    >
      <button
        v-show="editable"
        class="btn btn-secondary"
        @click="$emit('emit-is-updating')"
      >
        Manage stakeholders
      </button>
    </div>
    <StakeholdersReadonlyBanner
      v-else-if="store.user != null"
      class="mt-6"
    />
    <StakeholdersTosBanner
      v-else
      class="mt-6"
    />
  </div>
</template>

<script setup lang="ts">
import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { type OrganizationTypes, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import { useStore } from '~/store'
import StakeholderCard from './stakeholder-card.vue'
import StakeholdersReadonlyBanner from './stakeholders-readonly-banner.vue'
import StakeholdersTosBanner from './stakeholders-tos-banner.vue'

defineProps<{
  editable: boolean,
  organizations: Array<OrganizationTypes['light']>
  projectMembers: Array<CoreUser>
}>()
defineEmits<{(event: 'emit-is-updating'): void}>()

const store = useStore()
</script>
