<template>
  <div>
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
        :value="isAllUsersSelected"
        @click="toggleAllUsersSelect"
      >
    </div>
    <a
      :href="arbimonLink"
      class="text-frequency text-sm font-medium font-display leading-none"
    >
      <icon-custom-fi-external-link class="w-4 h-4 inline-flex" /> Manage project members
    </a>
    <div class="grid grid-cols-2 gap-3 mt-3 mb-11 lg:grid-cols-3">
      <StakeholderCardEdit
        v-for="(member, idx) of projectMembers"
        :key="idx"
        v-model="selectedProjectMembers"
        :name="member.firstname + ' ' + member.lastname"
        :image="member.picture ?? undefined"
        :email="member.email ?? ''"
        :ranking="idx === 0 ? 0 : 1"
        @emit-hide-email="hideUserEmail"
      />
    </div>
    <div class="flex justify-start items-center">
      <h3 class="text-white text-xl font-medium font-sans my-2">
        Affiliated organizations
      </h3>
      <div class="flex items-center ml-4">
        <button
          v-if="dropdownStatus === 'idle'"
          @click="openOrganizationSearch()"
        >
          <icon-custom-ft-search-lg
            class="text-white w-4 h-4"
          />
        </button>
        <div
          v-else
        >
          <div class="relative">
            <input
              ref="organizationSearchInput"
              v-model="searchOrganizationValue"
              class="px-3 py-2 w-[20.0rem] text-sm text-insight bg-echo outline-none focus:outline-none rounded-t-lg font-sans"
              :class="{ 'rounded-b-lg': orgsSearchResult.length === 0 || dropdownStatus !== 'search' }"
              type="text"
              placeholder="Type to search organizations"
              data-dropdown-toggle="dropdown"
              @input="organizationSearchInputChanged"
              @blur="onBlur"
            >
            <div
              ref="organizationSearchLoading"
              role="status"
              class="absolute z-index-10 absolute top-1 right-3"
              :class="{ hidden: !isSearchOrganizationFetching }"
            >
              <svg
                aria-hidden="true"
                class="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          </div>

          <div
            ref="createNewOrganizationFormContainer"
            class="z-10 hidden w-[20.0rem] text-insight bg-moss border-cloud border-b border-l border-r rounded-b-lg shadow"
          >
            <div class="max-w-sm mx-auto p-3">
              <div class="mb-5">
                <label
                  for="dashboard-project-summary-stakeholders-select-partner-type"
                  class="block mb-2 text-insight text-sm font-normal font-sans leading-normal"
                >
                  Select partner type
                </label>
                <select
                  id="dashboard-project-summary-stakeholders-select-partner-type"
                  v-model="newOrganizationType"
                  class="bg-echo border border-cloud text-insight text-sm rounded-lg block w-full py-2 px-3 font-sans"
                >
                  <option
                    v-for="orgType in ORGANIZATION_TYPE"
                    :key="orgType"
                    :value="orgType"
                  >
                    {{ ORGANIZATION_TYPE_NAME[orgType] }}
                  </option>
                </select>
              </div>
              <div class="mb-5">
                <label
                  for="dashboard-project-summary-stakeholders-input-organization-url"
                  class="block mb-2 text-insight text-sm font-normal font-sans leading-normal"
                >
                  Website
                </label>
                <input
                  id="dashboard-project-summary-stakeholders-input-organization-url"
                  v-model="newOrganizationUrl"
                  type="text"
                  placeholder="www.darwinfoundation.org"
                  class="bg-echo border-cloud py-2 px-3 text-insight placeholder:italic placeholder:opacity-75 placeholder:text-stone-300 text-sm rounded-lg block w-full font-sans"
                  required
                >
              </div>
              <div class="flex w-full flex-row justify-end">
                <button
                  type="submit"
                  class="btn btn-primary"
                  @click="createNewOrganization"
                >
                  Create organization
                </button>
              </div>
            </div>
          </div>

          <div
            ref="organizationSearchResultNotFoundContainer"
            class="z-10 hidden w-[20.0rem] text-insight bg-echo border-cloud border-b border-l border-r rounded-b-lg shadow flex flex-row justify-between p-3"
          >
            <p class="text-sm font-normal font-sans text-insight leading-tight">
              We are unable to find this organization.
            </p>
            <button
              type="button"
              class="text-frequency text-sm font-medium font-display leading-none"
              @click="openCreateNewOrganizationForm"
            >
              Create
            </button>
          </div>
          <div
            ref="organizationSearchResultContainer"
            class="z-10 hidden w-[20.0rem] text-insight bg-echo border-cloud border-b border-l border-r rounded-b-lg divide-y divide-gray-100 shadow"
          >
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
        </div>
      </div>
    </div>

    <div
      class="grid gap-3 mt-3 mb-10"
      style="grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))"
    >
      <SelectedOrganizationCard
        v-for="o in displayedOrganizations"
        :id="o.id"
        :key="`${o.id}-${o.name}-current`"
        v-model="selectedOrganizationIds"
        :name="o.name"
        :description="o.description"
        :image="o.image"
      />
    </div>

    <div class="flex w-full justify-end">
      <button
        class="btn btn-secondary"
        @click="onFinishedEditing"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import type { DropdownOptions } from 'flowbite'
import { Dropdown } from 'flowbite'
import { computed, inject, nextTick, ref, watch } from 'vue'

import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { type OrganizationType, type OrganizationTypes, ORGANIZATION_TYPE, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useCreateOrganization } from '../../../../composables/use-create-organization'
import { useGetSearchOrganizationsResult } from '../../../../composables/use-get-search-organizations-result'
import OrganizationSearchResultCard from './organization-search-result-card.vue'
import SelectedOrganizationCard from './selected-organization-card.vue'
import StakeholderCardEdit from './stakeholder-card-edit.vue'

const props = defineProps<{
  projectMembers: Array<CoreUser>,
  organizations: Array<OrganizationTypes['light']>
}>()
const emit = defineEmits<{(event: 'emit-finished-editing', orgIds: number[]): void}>()

const dropdownStatus = ref<'idle' | 'search' | 'create-org'>('idle')
const createNewOrganizationFormContainer = ref<HTMLDivElement | null>(null)
const organizationSearchInput = ref<HTMLDivElement | null>(null)
const organizationSearchResultContainer = ref<HTMLDivElement | null>(null)
const organizationSearchResultNotFoundContainer = ref<HTMLDivElement | null>(null)
const searchOrganizationValue = ref('')
const addedOrganizations = ref<Array<OrganizationTypes['light']>>([])
const selectedOrganizationIds = ref(props.organizations.map(o => o.id))
const selectedProjectMembers = ref(props.projectMembers.filter(o => o.role === 'Admin').map(o => o.email))
const isAllUsersSelected = ref<boolean>(false)

const newOrganizationType = ref<OrganizationType>('non-profit-organization')
const newOrganizationUrl = ref<string>('')

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance

const { data: organizationsSearchResult, refetch: refetchOrganizationsSearchResult, isFetching: isSearchOrganizationFetching } = useGetSearchOrganizationsResult(apiClientBio, searchOrganizationValue)
const { mutate: mutateNewOrganization } = useCreateOrganization(apiClientBio)

const arbimonLink = computed(() => {
  const selectedProjectSlug = store.selectedProject?.slug
  if (selectedProjectSlug === undefined) return ''
  else return `${import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL}/project/${selectedProjectSlug}/settings/users`
})

const openOrganizationSearch = async () => {
  dropdownStatus.value = 'search'
  await nextTick()
  organizationSearchInput.value?.focus()
  const dropdownOptions: DropdownOptions = { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }
  new Dropdown(organizationSearchResultContainer.value, organizationSearchInput.value, dropdownOptions).show()
}

const organizationSearchInputChanged = () => {
  dropdownStatus.value = 'search'
  refetchOrganizationsSearch()
  if (organizationsSearchResult.value == null || organizationsSearchResult.value.length === 0) {
    new Dropdown(organizationSearchResultNotFoundContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }).show()
  }
}

const onBlur = () => {
  // INFO: I don't know why the timeout works, guess it's a race condition between the onBlur and the emit from the search component.
  // If you remove this timeout. The dropdown will close and turn to button before the `onAddNewOrganizationFromSearch` function gets called.
  setTimeout(() => {
    if (dropdownStatus.value === 'create-org') {
      new Dropdown(organizationSearchResultNotFoundContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }).show()
      new Dropdown(organizationSearchResultNotFoundContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }).hide()
      return
    }

    dropdownStatus.value = 'idle'
  }, 100)
}

const openCreateNewOrganizationForm = async (): Promise<void> => {
  dropdownStatus.value = 'create-org'
  new Dropdown(createNewOrganizationFormContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }).show()
}

const onAddNewOrganizationFromSearch = (id: number): void => {
  // Return when the org already exists
  if (displayedOrganizations.value.findIndex(o => o.id === id) > -1) {
    dropdownStatus.value = 'idle'
    return
  }

  // Add to the list when it's new org
  const newOrg = organizationsSearchResult.value?.find((o) => o.id === id)
  if (newOrg == null) {
    dropdownStatus.value = 'idle'
    return
  }

  selectedOrganizationIds.value.push(newOrg.id)
  addedOrganizations.value.push(newOrg)
  dropdownStatus.value = 'idle'
}

const orgsSearchResult = computed(() => {
  return organizationsSearchResult.value?.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  }) ?? []
})

const displayedOrganizations = computed(() => {
  const organizations = props.organizations.concat(addedOrganizations.value)
  return organizations.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  })
})

watch(() => props.organizations, (value) => {
  const newIds = value.map(o => o.id)
  // Remove from added orgs
  addedOrganizations.value = addedOrganizations.value.filter(o => !newIds.includes(o.id))
  // Add to selected orgs
  selectedOrganizationIds.value = Array.from(new Set([...selectedOrganizationIds.value, ...newIds]))
})

const createNewOrganization = (): void => {
  mutateNewOrganization({ name: searchOrganizationValue.value, type: newOrganizationType.value, url: newOrganizationUrl.value }, {
    onSuccess: (newOrganization) => {
      addedOrganizations.value.push(newOrganization)
      selectedOrganizationIds.value.push(newOrganization.id)
      dropdownStatus.value = 'idle'
    },
    onError: () => {
      // TODO: Show user some respect and show them error
      dropdownStatus.value = 'idle'
    }
  })
}

const refetchOrganizationsSearch = async (): Promise<void> => {
  if (searchOrganizationValue.value !== '') {
    await refetchOrganizationsSearchResult()
  }
}

const toggleAllUsersSelect = (): void => {
  isAllUsersSelected.value = !isAllUsersSelected.value
  selectedProjectMembers.value = isAllUsersSelected.value ? props.projectMembers.map(u => u.email) : []
}

const hideUserEmail = (): void => {
  // TODO: create endpoint
}

const onFinishedEditing = (): void => {
  searchOrganizationValue.value = ''
  emit('emit-finished-editing', selectedOrganizationIds.value)
}

</script>
