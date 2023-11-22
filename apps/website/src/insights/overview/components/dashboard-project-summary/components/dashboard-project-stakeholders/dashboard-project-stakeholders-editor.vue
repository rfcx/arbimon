<template>
  <div>
    <!-- <h3 class="text-white text-xl font-medium font-sans leading-7 mb-3"> -->
    <!--   Project's primary contact -->
    <!-- </h3> -->
    <!---->
    <!-- <div -->
    <!--   v-if="primaryContact == null" -->
    <!--   class="flex items-center justify-center-max-w-sm" -->
    <!-- > -->
    <!--   <h3>No user selected</h3> -->
    <!-- </div> -->
    <!---->
    <!-- <div -->
    <!--   v-else -->
    <!--   class="relative flex items-center justify-between border border-frequency bg-pitch rounded-lg px-6 py-4 max-w-sm -z-10" -->
    <!-- > -->
    <!--   <icon-custom-fi-check-circle class="text-frequency bg-pitch w-6 h-6 absolute -translate-y-1/2 translate-x-1/2 left-auto -top-3 -right-3" /> -->
    <!--   <div class="flex items-center justify-start"> -->
    <!--     <img -->
    <!--       class="w-12 h-12 rounded-full shadow" -->
    <!--       :src="primaryContact?.image" -->
    <!--       alt="user profile image" -->
    <!--     > -->
    <!--     <div class="ml-3"> -->
    <!--       <h3 class="text-danger text-xs font-medium font-eyebrow uppercase"> -->
    <!--         Primary contact -->
    <!--       </h3> -->
    <!--       <h3 class="text-base font-normal font-sans"> -->
    <!--         {{ primaryContact?.name }} -->
    <!--       </h3> -->
    <!--       <a -->
    <!--         :href="`mailto:${primaryContact?.email}`" -->
    <!--         class="text-util-gray-01 text-sm font-normal leading-tight hover:underline hover:cursor-pointer" -->
    <!--       > -->
    <!--         {{ primaryContact?.email }} -->
    <!--       </a> -->
    <!--     </div> -->
    <!--   </div> -->
    <!-- </div> -->
    <!-- <div class="flex justify-start items-center mt-10 mb-3"> -->
    <!--   <h3 class="text-white text-xl font-medium font-sans leading-7 mr-8"> -->
    <!--     Project members -->
    <!--   </h3> -->
    <!--   <label -->
    <!--     for="dashboard-project-stakeholders-editor-select-all-users-checkbox" -->
    <!--     class="text-white text-sm font-normal font-sans leading-tight mr-2" -->
    <!--   > -->
    <!--     Select all -->
    <!--   </label> -->
    <!--   <input -->
    <!--     id="dashboard-project-stakeholders-editor-select-all-users-checkbox" -->
    <!--     type="checkbox" -->
    <!--     class="w-4 h-4 rounded checked:text-frequency border-0 outline-none" -->
    <!--     @click="selectAllUsers" -->
    <!--   > -->
    <!-- </div> -->
    <!-- <router-link -->
    <!--   class="text-frequency text-sm font-medium font-display leading-none" -->
    <!--   :to="{ name: ROUTE_NAMES.projectSettings }" -->
    <!-- > -->
    <!--   <icon-custom-fi-external-link class="w-4 h-4 inline-flex" /> Manage project members -->
    <!-- </router-link> -->
    <!-- <div -->
    <!--   class="grid gap-3 mt-3 mb-11" -->
    <!--   style="grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))" -->
    <!-- > -->
    <!--   <SelectedOrganizationCard -->
    <!--     v-for="u in users" -->
    <!--     :id="u.id" -->
    <!--     :key="`${u.id}${u.name}`" -->
    <!--     v-model="selectedUsers" -->
    <!--     :name="u.name" -->
    <!--     :image="u.image" -->
    <!--   /> -->
    <!-- </div> -->

    <div class="flex justify-start items-center">
      <h3 class="text-white text-xl font-medium font-sans my-2">
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
          <div class="relative">
            <input
              ref="organizationSearchInput"
              v-model="searchOrganizationValue"
              class="px-3 py-2 w-[20.0rem] text-sm text-insight bg-echo outline-none focus:outline-none rounded-t-lg font-sans"
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
        v-for="o in orgsList"
        :id="o.id"
        :key="`${o.id}-${o.name}-current`"
        v-model="selectedOrganizations"
        :name="o.name"
        :description="o.description"
        :image="o.image"
      />

      <!-- <OrganizationSearchResultCard -->
      <!--   v-for="s in orgsSearchResult" -->
      <!--   :id="s.id" -->
      <!--   :key="`${s.id}-${s.name}-search`" -->
      <!--   :name="s.name" -->
      <!--   :description="s.description" -->
      <!--   :image="s.image" -->
      <!--   @emit-add-to-selected-organization="onAddNewOrganizationFromSearch" -->
      <!-- /> -->
    </div>

    <div class="flex w-full justify-end">
      <button
        class="btn btn-secondary"
        @click="onFinishedEditing"
      >
        Save and view insights
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
import { useGetSearchOrganizationsResult } from '../../../../composables/use-get-search-organizations-result'
import OrganizationSearchResultCard from './organization-search-result-card.vue'
import SelectedOrganizationCard from './selected-organization-card.vue'

const props = defineProps<{ organizations: Array<OrganizationTypes['light']>}>()
const emit = defineEmits<{(event: 'emit-finished-editing', orgIds: number[]): void}>()

// const selectedUsers = ref([1])

const isOrganizationSearchInputOpen = ref(false)
const organizationSearchInput = ref<HTMLDivElement | null>(null)
const organizationSearchResultContainer = ref<HTMLDivElement | null>(null)
const editableOrganizations = ref([...props.organizations])
const selectedOrganizations = ref(props.organizations.map(o => o.id))
const searchOrganizationValue = ref('')

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { data: organizationsSearchResult, refetch: refetchOrganizationsSearchResult, isFetching: isSearchOrganizationFetching } = useGetSearchOrganizationsResult(apiClientBio, searchOrganizationValue)

const openOrganizationSearch = async () => {
  isOrganizationSearchInputOpen.value = true
  await nextTick()
  organizationSearchInput.value?.focus()
  const dropdownOptions: DropdownOptions = { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }
  new Dropdown(organizationSearchResultContainer.value, organizationSearchInput.value, dropdownOptions).show()
}

const organizationSearchInputChanged = async () => {
  refetchOrganizationsSearch()
}

const onBlur = () => {
  // INFO: I don't know why the timeout works, guess it's a race condition between the onBlur and the emit from the search component.
  // If you remove this timeout. The dropdown will close and turn to button before the `onAddNewOrganizationFromSearch` function gets called.
  setTimeout(() => {
    isOrganizationSearchInputOpen.value = false
  }, 100)
}

const onAddNewOrganizationFromSearch = (id: number): void => {
  // Return when the org already exists
  if (selectedOrganizations.value.findIndex(o => o === id) > -1) {
    return
  }

  // if the ID already existed (pressing the same org for the second time), check whether there is an element in there already so we don't add it twice.
  // in this case we just add the ID to the selected list.
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

// const users = ref([
//   {
//     id: 1,
//     name: 'Oscar Piastri',
//     image: 'https://picsum.photos/id/339/200/200'
//   },
//   {
//     id: 2,
//     name: 'Lando Norris',
//     image: 'https://picsum.photos/id/350/200/200'
//   },
//   {
//     id: 3,
//     name: 'Max Verstappen',
//     image: 'https://picsum.photos/id/324/200/200'
//   },
//   {
//     id: 4,
//     name: 'Lewis Hamilton',
//     image: 'https://picsum.photos/id/448/200/200'
//   }
// ])

const onFinishedEditing = (): void => {
  searchOrganizationValue.value = ''
  emit('emit-finished-editing', selectedOrganizations.value)
}

const refetchOrganizationsSearch = (): void => {
  if (searchOrganizationValue.value !== '') {
    refetchOrganizationsSearchResult.value()
  }
}

// const selectAllUsers = (): void => {
//   selectedUsers.value = users.value.map(u => u.id)
// }

// const primaryContact = ref<{ id: number, name: string, email: string, image: string } | null>({ id: 122, name: 'Logan Sargeant', email: 'kingsargeant1122@gmail.com', image: 'https://picsum.photos/id/233/200/200' })
</script>
