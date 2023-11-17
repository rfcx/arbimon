<template>
  <div>
    <h3 class="text-white text-xl font-medium font-sans leading-7 mb-3">
      Project's primary contact
    </h3>

    <div
      v-if="primaryContact == null"
      class="flex items-center justify-center-max-w-sm"
    >
      <h3>No user selected</h3>
    </div>

    <div
      v-else
      class="flex items-center justify-between border border-frequency bg-pitch rounded-lg px-6 py-4 max-w-sm"
    >
      <div class="flex items-center justify-start">
        <img
          class="w-12 h-12 rounded-full shadow"
          :src="primaryContact?.image"
          alt="user profile image"
        >
        <div class="ml-3">
          <h3 class="text-danger text-xs font-medium font-eyebrow uppercase">
            Primary contact
          </h3>
          <h3 class="text-base font-normal font-sans">
            {{ primaryContact?.name }}
          </h3>
          <a
            :href="`mailto:${primaryContact?.email}`"
            class="text-util-gray-01 text-sm font-normal leading-tight hover:underline hover:cursor-pointer"
          >
            {{ primaryContact?.email }}
          </a>
        </div>
      </div>

      <div class="ml-3 flex justify-center items-center">
        <icon-custom-fi-check-circle class="w-6 h-6 text-frequency" />
      </div>
    </div>
    <div class="flex justify-start items-center mt-10 mb-3">
      <h3 class="text-white text-xl font-medium font-sans leading-7 mr-8">
        Select to show project members
      </h3>
      <label
        for="dashboard-project-stakeholders-editor-select-all-users-checkbox"
        class="text-white text-sm font-normal font-sans leading-tight mr-2"
      >
        Select all
      </label>
      <input
        id="dashboard-project-stakeholders-editor-select-all-users-checkbox"
        type="checkbox"
        class="w-4 h-4 rounded checked:text-frequency border-0 outline-none"
        @click="selectAllUsers"
      >
    </div>
    <router-link
      class="text-frequency text-sm font-medium font-display leading-none"
      :to="{ name: ROUTE_NAMES.projectSettings }"
    >
      <icon-custom-fi-external-link class="w-4 h-4 inline-flex" /> Manage project members
    </router-link>
    <div
      class="grid gap-3 mt-3 mb-11"
      style="grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))"
    >
      <MemberCheckbox
        v-for="u in users"
        :id="u.id"
        :key="`${u.id}${u.name}`"
        v-model="selectedUsers"
        :name="u.name"
        :image="u.image"
      />
    </div>

    <div class="flex justify-start items-center">
      <h3 class="text-white text-xl font-medium font-sans">
        Select to show affiliated organizations
      </h3>
      <div class="flex items-center ml-4">
        <icon-custom-ft-search-lg
          id="dashboard-project-stakeholders-search-organizations-search-icon"
          class="text-white w-4 h-4"
        />
        <input
          id="dashboard-project-stakeholders-search-organizations-input"
          v-model="searchOrganizationValue"
          class="px-4 py-2 text-insight bg-echo outline-none focus:outline-none border-cloud rounded-lg font-sans"
          type="text"
          autofocus
          placeholder="Type to search organizations"
        >
      </div>
    </div>

    <div
      class="grid gap-3 mt-3 mb-10"
      style="grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))"
    >
      <MemberCheckbox
        v-for="o in orgsList"
        :id="o.id"
        :key="`${o.id}${o.name}`"
        v-model="selectedOrganizations"
        :name="o.name"
        :description="o.description"
        :image="o.image"
      />
    </div>

    <div class="flex w-full justify-end">
      <button
        class="btn btn-secondary"
        @click="$emit('emit-finished-editing')"
      >
        Save displayed stakeholders
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import { type OrganizationTypes, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import { ROUTE_NAMES } from '~/router'
import MemberCheckbox from './member-checkbox.vue'

const props = defineProps<{ organizations: Array<OrganizationTypes['light']>}>()
defineEmits<{(event: 'emit-finished-editing'): void}>()

const selectedUsers = ref([1])

const editableOrganizations = toRef(() => props.organizations)
const selectedOrganizations = toRef(() => props.organizations.map(o => o.id))
const searchOrganizationValue = ref('')

const orgsList = computed<Array<OrganizationTypes['light'] & { description: string }>>(() => {
  return editableOrganizations.value.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  })
})

const users = ref([
  {
    id: 1,
    name: 'Oscar Piastri',
    image: 'https://picsum.photos/id/339/200/200'
  },
  {
    id: 2,
    name: 'Lando Norris',
    image: 'https://picsum.photos/id/350/200/200'
  },
  {
    id: 3,
    name: 'Max Verstappen',
    image: 'https://picsum.photos/id/324/200/200'
  },
  {
    id: 4,
    name: 'Lewis Hamilton',
    image: 'https://picsum.photos/id/448/200/200'
  }
])

const selectAllUsers = (): void => {
  selectedUsers.value = users.value.map(u => u.id)
}

const primaryContact = ref<{ id: number, name: string, email: string, image: string } | null>({ id: 122, name: 'Logan Sargeant', email: 'kingsargeant1122@gmail.com', image: 'https://picsum.photos/id/233/200/200' })
</script>
