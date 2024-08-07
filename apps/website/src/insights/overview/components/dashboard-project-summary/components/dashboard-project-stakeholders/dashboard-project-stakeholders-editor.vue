<template>
  <div>
    <div class="flex flex-col gap-y-4 mt-10">
      <div class="flex justify-start items-center gap-x-8">
        <h3 class="text-white text-xl font-medium font-sans leading-7">
          Project members
        </h3>
        <div>
          <label
            v-if="projectMembers.length"
            for="dashboard-project-stakeholders-editor-select-all-users-checkbox"
            class="text-white text-sm font-normal font-sans leading-tight mr-2"
          >
            Select all
          </label>
          <input
            v-if="projectMembers.length"
            id="dashboard-project-stakeholders-editor-select-all-users-checkbox"
            type="checkbox"
            class="w-4 h-4 rounded checked:text-frequency border-0 outline-none"
            :value="isAllUsersSelected"
            :checked="checkAllUsersSelection"
            @click="toggleAllUsersSelect"
          >
        </div>
      </div>
      <router-link
        :to="{name: ROUTE_NAMES.projectMember, params: { projectSlug: store.project?.slug }}"
        class="text-frequency text-sm font-medium font-display leading-none"
      >
        <icon-custom-fi-external-link class="w-4 h-4 inline-flex" /> Manage project members
      </router-link>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StakeholderCardEdit
          v-for="(member, idx) of sortedProjectMembers"
          :key="idx"
          v-model="selectedProjectMembers"
          :name="memberName(member.firstName, member.lastName)"
          :image="member.image ?? undefined"
          :email="member.email ?? ''"
          :ranking="member.ranking"
          :user-id="member.id"
          @emit-primary-contact="togglePrimaryContact"
        />
      </div>
    </div>
    <div class="flex flex-col gap-y-4 mt-10">
      <div class="flex justify-start items-center gap-x-8">
        <h3 class="text-white text-xl font-medium font-sans my-2">
          Affiliated organizations
        </h3>
        <div class="flex items-center">
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
                class="px-3 py-2 w-[20.0rem] rounded-lg text-sm text-insight bg-echo outline-none focus:(outline-none rounded-lg font-sans border-frequency ring-frequency)"
                :class="{ 'rounded-lg': orgsSearchResult.length === 0 || dropdownStatus !== 'search' }"
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
                <icon-custom-ic-loading class="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-frequency" />
                <span class="sr-only">Loading...</span>
              </div>
            </div>
            <div
              ref="createNewOrganizationFormContainer"
              class="z-10 hidden w-[20.0rem] text-insight bg-moss border-cloud border-1 rounded-lg shadow"
              :class="{'border-1': !orgsSearchResult?.length}"
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
                    class="bg-echo border border-cloud text-insight text-sm rounded-lg block w-full py-2 px-3 font-sans focus:(border-frequency ring-frequency)"
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
                    class="bg-echo border-cloud py-2 px-3 text-insight placeholder:italic placeholder:opacity-75 placeholder:text-stone-300 text-sm rounded-lg block w-full font-sans focus:(border-frequency ring-frequency)"
                    required
                  >
                </div>
                <div class="flex w-full flex-wrap justify-end">
                  <button
                    type="submit"
                    class="btn btn-primary px-3 py-2 disabled:hover:btn-disabled disabled:btn-disabled"
                    :disabled="createNewOrganizationLoading"
                    @click="createNewOrganization"
                  >
                    Create organization
                  </button>
                  <div
                    v-if="hasFailed"
                    class="mt-1"
                  >
                    <span
                      class="relative text-sm text-red-800 dark:text-flamingo font-medium"
                      role="alert"
                    >
                      {{ errorMessage }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              ref="organizationSearchResultNotFoundContainer"
              class="z-10 hidden w-[20.0rem] text-insight bg-echo border-cloud rounded-lg shadow flex flex-row justify-between p-3"
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
          </div>
          <div
            ref="organizationSearchResultContainer"
            class="z-10 hidden w-[20.0rem] text-insight bg-echo border-cloud rounded-lg divide-y divide-gray-100 shadow overflow-y-scroll"
            :class="{'border-1': searchOrganizationValue && !organizationsSearchResult, 'border-1 max-h-66': orgsSearchResult?.length}"
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
      <div class="grid grid-cols-2 gap-3 mb-10 lg:grid-cols-3">
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
    </div>

    <div class="flex w-full justify-end">
      <button
        class="btn btn-primary"
        @click="onFinishedEditing"
      >
        Save changes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import type { DropdownOptions } from 'flowbite'
import { Dropdown } from 'flowbite'
import { type Ref, computed, inject, nextTick, ref, unref, watch } from 'vue'

import { type DashboardStakeholdersUser, type UpdateDashboardStakeholdersRequestBodyUser } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { type OrganizationType, type OrganizationTypes, ORGANIZATION_TYPE, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'
import { memberName } from '@rfcx-bio/utils/string'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { useCreateOrganization } from '../../../../composables/use-create-organization'
import { useGetRecommendedOrganizations, useGetSearchOrganizationsResult } from '../../../../composables/use-get-search-organizations-result'
import OrganizationSearchResultCard from './organization-search-result-card.vue'
import SelectedOrganizationCard from './selected-organization-card.vue'
import StakeholderCardEdit from './stakeholder-card-edit.vue'

const props = defineProps<{
  projectMembers: Array<DashboardStakeholdersUser>,
  organizations: Array<OrganizationTypes['light']>
}>()
const emit = defineEmits<{(event: 'emit-finished-editing', orgIds: number[], selectedProjectMembers: UpdateDashboardStakeholdersRequestBodyUser[]): void}>()

const searchDropdown = ref() as Ref<Dropdown>
const notFoundDropdown = ref() as Ref<Dropdown>
const createNewOrganizationForm = ref() as Ref<Dropdown>
const dropdownStatus = ref<'idle' | 'search' | 'create-org'>('idle')
const createNewOrganizationFormContainer = ref<HTMLDivElement | null>(null)
const organizationSearchInput = ref<HTMLDivElement | null>(null)
const organizationSearchResultContainer = ref<HTMLDivElement | null>(null)
const organizationSearchResultNotFoundContainer = ref<HTMLDivElement | null>(null)
const addedOrganizations = ref<Array<OrganizationTypes['light']>>([])
const dropdownOptions: DropdownOptions = { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }
const searchOrganizationValue = ref('')
const selectedOrganizationIds = ref(props.organizations.map(o => o.id))
const newOrganizationType = ref<OrganizationType>('non-profit-organization')
const newOrganizationUrl = ref<string>('')
const createNewOrganizationLoading = ref(false)

const selectedProjectMembers = ref(props.projectMembers.filter(u => u.ranking !== -1).map(u => u.email))
const primaryContact = ref({
  userId: props.projectMembers.filter(u => u.ranking === 0).map(u => u.id)[0],
  email: props.projectMembers.filter(u => u.ranking === 0).map(u => u.email)[0]
})
const isAllUsersSelected = ref<boolean>(selectedProjectMembers.value.length === props.projectMembers.length)

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance

const { data: organizationsSearchResult, refetch: refetchOrganizationsSearchResult, isFetching: isSearchOrganizationFetching } = useGetSearchOrganizationsResult(apiClientBio, searchOrganizationValue)
const { data: recommendedOrganizationsResult } = useGetRecommendedOrganizations(apiClientBio, props.projectMembers.map(user => user.id))
const { mutate: mutateNewOrganization } = useCreateOrganization(apiClientBio)

const checkAllUsersSelection = computed(() => {
  return selectedProjectMembers.value.length === props.projectMembers.length
})

const tempProjectMembers = ref(unref(props.projectMembers))

const sortedProjectMembers = computed<DashboardStakeholdersUser[]>(() => {
  const primary = tempProjectMembers.value.filter(u => u.ranking === 0)
  const selected = tempProjectMembers.value.filter(u => u.ranking === 1)
  const hidden = tempProjectMembers.value.filter(u => u.ranking === -1)
  return primary.concat(selected).concat(hidden)
})

const togglePrimaryContact = (userId: number, email: string, isPrimaryContact: boolean): void => {
  const prevPrimary = tempProjectMembers.value.find(user => user.ranking === 0)
  const newRanking = isPrimaryContact === true ? 0 : 1
  tempProjectMembers.value = tempProjectMembers.value.map(user => {
    return {
      ...user,
      ranking: user.email === email ? newRanking : (prevPrimary?.email === user.email) ? 1 : user.ranking
    }
  })
  primaryContact.value.userId = isPrimaryContact === true ? userId : -1
  primaryContact.value.email = isPrimaryContact === true ? email : ''
}

const toggleAllUsersSelect = (): void => {
  isAllUsersSelected.value = !isAllUsersSelected.value
  selectedProjectMembers.value = isAllUsersSelected.value ? props.projectMembers.map(u => u.email) : []
}

const openOrganizationSearch = async () => {
  dropdownStatus.value = 'search'
  await nextTick()
  organizationSearchInput.value?.focus()
  searchDropdown.value = new Dropdown(organizationSearchResultContainer.value, organizationSearchInput.value, dropdownOptions)
  searchDropdown.value.show()
}

const organizationSearchInputChanged = async (): Promise<void> => {
  createNewOrganizationForm.value?.hide()
  dropdownStatus.value = 'search'
  await refetchOrganizationsSearch()
  if (orgsSearchResult.value.length) {
    searchDropdown.value.show()
    notFoundDropdown.value?.hide()
  } else {
    notFoundDropdown.value = new Dropdown(organizationSearchResultNotFoundContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 })
    notFoundDropdown.value.show()
  }
  if (searchOrganizationValue.value.length === 0) {
    notFoundDropdown.value?.hide()
  }
}

const onBlur = () => {
  // INFO: I don't know why the timeout works, guess it's a race condition between the onBlur and the emit from the search component.
  // If you remove this timeout. The dropdown will close and turn to button before the `onAddNewOrganizationFromSearch` function gets called.
  setTimeout(() => {
    if (dropdownStatus.value === 'create-org') {
      notFoundDropdown.value?.show()
      notFoundDropdown.value?.hide()
      return
    }

    dropdownStatus.value = 'idle'
  }, 200)
}

const openCreateNewOrganizationForm = async (): Promise<void> => {
  dropdownStatus.value = 'create-org'
  notFoundDropdown.value.hide()
  createNewOrganizationForm.value = new Dropdown(createNewOrganizationFormContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 })
  createNewOrganizationForm.value.show()
}

const onAddNewOrganizationFromSearch = (id: number): void => {
  searchDropdown.value.hide()
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
  searchOrganizationValue.value = newOrg.name
  refetchOrganizationsSearch()
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

const recommendedOrganizations = computed(() => {
  return recommendedOrganizationsResult.value?.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  }) ?? []
})

const displayedOrganizations = computed(() => {
  let organizations = props.organizations.concat(addedOrganizations.value)
  const orgIds = organizations.map(o => o.id)
  organizations = organizations.concat(recommendedOrganizations.value.filter(r => !orgIds.includes(r.id)))
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

watch(() => dropdownStatus.value, (value) => {
  if (value === 'idle') {
    searchDropdown.value.hide()
  }
})

const hasFailed = ref(false)
const errorMessage = ref('')

const createNewOrganization = (): void => {
  createNewOrganizationLoading.value = true
  mutateNewOrganization({ name: searchOrganizationValue.value, type: newOrganizationType.value, url: newOrganizationUrl.value }, {
    onSuccess: (newOrganization) => {
      addedOrganizations.value.push(newOrganization)
      selectedOrganizationIds.value.push(newOrganization.id)
      dropdownStatus.value = 'idle'
      refetchOrganizationsSearch()
      createNewOrganizationLoading.value = false
      createNewOrganizationForm.value?.hide()
    },
    onError: () => {
      hasFailed.value = true
      errorMessage.value = "Please enter the organization's URL."

      dropdownStatus.value = 'create-org'
      createNewOrganizationLoading.value = false
    }
  })
}

const refetchOrganizationsSearch = async (): Promise<void> => {
  if (searchOrganizationValue.value !== '') {
    await refetchOrganizationsSearchResult()
  }
}

const onFinishedEditing = (): void => {
  searchOrganizationValue.value = ''
  const selectedUsers = props.projectMembers
    .filter(u => selectedProjectMembers.value.includes(u.email) || primaryContact.value.email === u.email)
    .map(user => {
      return {
        ranking: primaryContact.value.userId === user.id ? 0 : 1,
        userId: user.id
      }
    })
  emit('emit-finished-editing',
    selectedOrganizationIds.value,
    selectedUsers
  )
}

</script>
