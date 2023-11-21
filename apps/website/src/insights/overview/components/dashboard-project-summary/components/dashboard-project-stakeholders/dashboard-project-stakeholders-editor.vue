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
      class="relative flex items-center justify-between border border-frequency bg-pitch rounded-lg px-6 py-4 max-w-sm -z-10"
    >
      <icon-custom-fi-check-circle class="text-frequency bg-pitch w-6 h-6 absolute -translate-y-1/2 translate-x-1/2 left-auto -top-3 -right-3" />
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
    </div>
    <div class="flex justify-start items-center mt-10 mb-3">
      <h3 class="text-white text-xl font-medium font-sans leading-7 mr-8">
        Project members
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
      <SelectedOrganizationCard
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
        Affiliated organizations
      </h3>
      <div class="flex items-center ml-4">
        <button
          v-if="!isOrganizationSearchInputOpen"
          @click="openOrganizationSearch()"
        >
          <icon-custom-ft-search-lg
            class="text-white w-4 h-4"
          />
        </button>
        <div
          v-else
        >
          <input
            ref="organizationSearchInput"
            v-model="searchOrganizationValue"
            class="px-3 py-2 w-[20.0rem] text-sm text-insight bg-echo outline-none focus:outline-none rounded-t-lg font-sans"
            type="text"
            placeholder="Type to search organizations"
            data-dropdown-toggle="dropdown"
            @input="refetchOrganizationsSearch"
            @blur="isOrganizationSearchInputOpen = false"
          >
          <div
            ref="organizationSearchResultContainer"
            class="z-10 hidden w-[20.0rem] text-insight bg-echo border-cloud border-b border-l border-r rounded-b-lg divide-y divide-gray-100 shadow"
          >
            <ul
              class="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              <li
                v-for="o in organizationSearchResults"
                :key="o.id"
              >
                <a
                  href="#"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >{{ o.name }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div
      class="grid gap-3 mt-3 mb-10"
      style="grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))"
    >
      <SelectedOrganizationCard
        v-for="o in orgsList"
        :id="o.id"
        :key="`${o.id}-${o.name}-current`"
        v-model="selectedOrganizations"
        :name="o.name"
        :description="o.description"
        :image="o.image"
      />

      <OrganizationSearchResultCard
        v-for="s in orgsSearchResult"
        :id="s.id"
        :key="`${s.id}-${s.name}-search`"
        :name="s.name"
        :description="s.description"
        :image="s.image"
        @emit-add-to-selected-organization="onAddNewOrganizationFromSearch"
      />
    </div>

    <div class="flex w-full justify-end">
      <button
        class="btn btn-secondary"
        @click="onFinishedEditing"
      >
        Save displayed stakeholders
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import type { DropdownOptions } from 'flowbite'
import { Dropdown } from 'flowbite'
import { computed, inject, nextTick, ref } from 'vue'

import { type OrganizationTypes, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import { apiClientBioKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useGetSearchOrganizationsResult } from '../../../../composables/use-get-search-organizations-result'
import OrganizationSearchResultCard from './organization-search-result-card.vue'
import SelectedOrganizationCard from './selected-organization-card.vue'

const props = defineProps<{ organizations: Array<OrganizationTypes['light']>}>()
const emit = defineEmits<{(event: 'emit-finished-editing', orgIds: number[]): void}>()

const selectedUsers = ref([1])

const isOrganizationSearchInputOpen = ref(false)
const organizationSearchInput = ref<HTMLDivElement | null>(null)
const organizationSearchResultContainer = ref<HTMLDivElement | null>(null)
const editableOrganizations = ref([...props.organizations])
const selectedOrganizations = ref(props.organizations.map(o => o.id))
const searchOrganizationValue = ref('')

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { data: organizationsSearchResult, refetch: refetchOrganizationsSearchResult } = useGetSearchOrganizationsResult(apiClientBio, searchOrganizationValue)

const openOrganizationSearch = async () => {
  isOrganizationSearchInputOpen.value = true
  await nextTick()
  organizationSearchInput.value?.focus()
  const dropdownOptions: DropdownOptions = { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }
  new Dropdown(organizationSearchResultContainer.value, organizationSearchInput.value, dropdownOptions).show()
}

const organizationSearchResults = [
  { id: 1, name: 'Company X' },
  { id: 2, name: 'Company Y' },
  { id: 3, name: 'Non-profit Z' }
]

const onAddNewOrganizationFromSearch = (id: number): void => {
  // Return when the org already exists
  if (selectedOrganizations.value.findIndex(o => o === id) > -1) {
    return
  }

  // if the ID already existed, check whether there is an element in there already so we don't add it twice.
  // in this case we just add the ID to the selected list again and remove it from the search list.
  // TODO: Looks like mutating the data attribute of useQuery is invalid, seems to be read-only.
  if (editableOrganizations.value.findIndex(o => o.id === id) > -1) {
    selectedOrganizations.value.push(id)
    return
  }

  // Add to the list when it's new org
  const newOrg = organizationsSearchResult.value?.find((o) => o.id === id)
  if (newOrg == null) {
    return
  }

  selectedOrganizations.value.push(id)
  editableOrganizations.value.push(newOrg)
}

const orgsSearchResult = computed(() => {
  return organizationsSearchResult.value?.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  }) ?? []
})

const orgsList = computed(() => {
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

const onFinishedEditing = (): void => {
  searchOrganizationValue.value = ''
  emit('emit-finished-editing', selectedOrganizations.value)
}

const refetchOrganizationsSearch = (): void => {
  if (searchOrganizationValue.value !== '') {
    refetchOrganizationsSearchResult.value()
  }
}

const selectAllUsers = (): void => {
  selectedUsers.value = users.value.map(u => u.id)
}

const primaryContact = ref<{ id: number, name: string, email: string, image: string } | null>({ id: 122, name: 'Logan Sargeant', email: 'kingsargeant1122@gmail.com', image: 'https://picsum.photos/id/233/200/200' })
</script>
