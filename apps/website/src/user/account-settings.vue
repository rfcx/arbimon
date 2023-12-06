<template>
  <landing-navbar />
  <section class="pt-16 bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-10 border-b-1 border-white/80">
      <h1 class="tracking-tight font-medium text-gray-900 dark:text-white">
        Account settings
      </h1>
      <span v-if="isLoadingProfileData">Loading</span>
    </div>
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-10 border-b-1 border-white/80">
      <div class="flex items-start gap-4 flex-col md:flex-row">
        <img
          :src="profilePhoto"
          alt="Profile"
          class="w-32 h-32 aspect-square object-cover rounded-full mr-4"
        >
        <div>
          <h2>
            Change profile photo
          </h2>
          <h4 class="mt-3">
            JPG and PNG files less than 5 MB are supported.
          </h4>
          <input
            id="fileUpload"
            type="file"
            accept="image/jpeg, image/png"
            hidden
            @change="uploadPhoto"
          >
          <button
            class="btn btn-secondary group mt-5"
            type="button"
            @click="selectPhoto"
          >
            Upload photo <icon-custom-cloud-upload class="ml-2 group-hover:stroke-pitch inline-flex" />
          </button>
        </div>
      </div>
    </div>
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-10">
      <p class="text-insight text-base font-medium font-sans">
        First name*
      </p>
      <input
        id="firstName"
        v-model="firstName"
        name="firstName"
        type="text"
        class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
        required
      >
      <p class="mt-5 text-insight text-base font-medium font-sans">
        Last name*
      </p>
      <input
        id="lastName"
        v-model="lastName"
        name="lastName"
        type="text"
        class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
        required
      >
      <p class="mt-5 opacity-70 text-insight text-base font-medium font-sans">
        Email address
      </p>
      <input
        id="email"
        v-model="email"
        name="email"
        type="text"
        class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
        disabled
      >
      <p class="mt-5 text-insight text-base font-medium font-sans">
        Affiliated organization
      </p>
      <div class="flex items-center mt-2">
        <button
          v-if="dropdownStatus === 'idle'"
          @click="openOrganizationSearch()"
        >
          <icon-custom-ft-search-lg
            class="text-white w-5 h-5"
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
      <button
        class="w-full btn btn-primary inline items-center group mt-7"
        type="button"
        @click="saveAccountSetting"
      >
        Save
        <icon-fas-spinner
          v-if="isUpdatingProfilePhoto || isUpdatingUserProfile"
          class="animate-spin w-4 h-4 ml-2 inline"
        />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import type { DropdownOptions } from 'flowbite'
import { Dropdown } from 'flowbite'
import { type Ref, computed, inject, nextTick, onMounted, ref, watch } from 'vue'

import { type OrganizationType, type OrganizationTypes, ORGANIZATION_TYPE, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import image from '@/_assets/cta/frog-hero.webp'
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import OrganizationSearchResultCard from '../insights/overview/components/dashboard-project-summary/components/dashboard-project-stakeholders/organization-search-result-card.vue'
import { useGetSearchOrganizationsResult } from '../insights/overview/composables/use-get-search-organizations-result'
import { useGetOrganizationsList } from './composables/use-get-organizations'
import { usePatchProfileImage } from './composables/use-patch-profile-photo'
import { useGetProfileData, usePatchUserProfile } from './composables/use-patch-user-profile'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const uploadedPhotoUrl = ref('')
const uploadedFile = ref()
const uploadedPhotoData: Ref<Record<string, string>> = ref({
  name: '',
  type: ''
})
const dropdownStatus = ref<'idle' | 'search' | 'create-org'>('idle')
const organizationSearchInput = ref<HTMLDivElement | null>(null)
const organizationSearchResultContainer = ref<HTMLDivElement | null>(null)
const organizationSearchResultNotFoundContainer = ref<HTMLDivElement | null>(null)
const addedOrganizations = ref<Array<OrganizationTypes['light']>>([])
const searchOrganizationValue = ref('')
const createNewOrganizationFormContainer = ref<HTMLDivElement | null>(null)
const newOrganizationType = ref<OrganizationType>('non-profit-organization')
const newOrganizationUrl = ref<string>('')

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance

const { isPending: isUpdatingProfilePhoto, mutate: mutatePatchProfilePhoto } = usePatchProfileImage(apiClientBio)
const { isPending: isUpdatingUserProfile, mutate: mutatePatchUserProfile } = usePatchUserProfile(apiClientBio)
const { isLoading: isLoadingProfileData, data: profileData } = useGetProfileData(apiClientBio)
const { data: organizationsList } = useGetOrganizationsList(apiClientBio)
const { data: organizationsSearchResult, refetch: refetchOrganizationsSearchResult, isFetching: isSearchOrganizationFetching } = useGetSearchOrganizationsResult(apiClientBio, searchOrganizationValue)

const selectedOrganizationIds = ref(organizationsList.value?.organizations.map(o => o.id) ?? [])

onMounted(() => {
  firstName.value = store.user?.given_name ?? store.user?.user_metadata?.given_name ?? store.user?.nickname ?? ''
  lastName.value = store.user?.family_name ?? store.user?.user_metadata?.family_name ?? ''
  email.value = store.user?.email ?? ''
})

watch(profileData, () => {
  firstName.value = profileData.value?.firstName ?? store.user?.given_name ?? store.user?.user_metadata?.given_name ?? store.user?.nickname ?? ''
  lastName.value = profileData.value?.lastName ?? store.user?.family_name ?? store.user?.user_metadata?.family_name ?? ''
})

const profilePhoto = computed(() => {
  return uploadedPhotoUrl.value ? uploadedPhotoUrl.value : store.user?.picture ? store.user?.picture : image
})

const orgsSearchResult = computed(() => {
  return organizationsSearchResult.value?.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  }) ?? []
})

const displayedOrganizations = computed(() => {
  const organizations = organizationsList.value?.organizations.concat(addedOrganizations.value) ?? []
  return organizations.map(o => {
    return {
      ...o,
      description: ORGANIZATION_TYPE_NAME[o.type]
    }
  })
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

const refetchOrganizationsSearch = async (): Promise<void> => {
  if (searchOrganizationValue.value !== '') {
    await refetchOrganizationsSearchResult()
  }
}

const onAddNewOrganizationFromSearch = (id: number): void => {
  console.info('onAddNewOrganizationFromSearch', id)
  // Return when the org already exists
  if (displayedOrganizations.value.findIndex(o => o.id === id) > -1) {
    dropdownStatus.value = 'idle'
    return
  }

  // Add to the list when it's new org
  const newOrg = organizationsSearchResult.value?.find((o) => o.id === id)
  console.info('newOrg', newOrg)
  if (newOrg == null) {
    dropdownStatus.value = 'idle'
    return
  }

  selectedOrganizationIds.value.push(newOrg.id)
  addedOrganizations.value.push(newOrg)
  dropdownStatus.value = 'idle'
  console.info('selectedOrganizationIds, addedOrganizations', selectedOrganizationIds, addedOrganizations)
}

const openCreateNewOrganizationForm = async (): Promise<void> => {
  dropdownStatus.value = 'create-org'
  new Dropdown(createNewOrganizationFormContainer.value, organizationSearchInput.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 }).show()
}

const createNewOrganization = (): void => {
//   mutateNewOrganization({ name: searchOrganizationValue.value, type: newOrganizationType.value, url: newOrganizationUrl.value }, {
//     onSuccess: (newOrganization) => {
//       addedOrganizations.value.push(newOrganization)
//       selectedOrganizationIds.value.push(newOrganization.id)
//       dropdownStatus.value = 'idle'
//     },
//     onError: () => {
//       // TODO: Show user some respect and show them error
//       dropdownStatus.value = 'idle'
//     }
//   })
}

const selectPhoto = async (): Promise<void> => {
  document.getElementById('fileUpload')?.click()
}

const uploadPhoto = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const file: File = (target.files as FileList)[0]
  uploadedPhotoData.value.name = file.name
  uploadedPhotoData.value.type = file.type
  // the browser has NO ACCESS to the file path for security reasons
  const readerUrl = new FileReader()
  const readerBuffer = new FileReader()
  readerUrl.addEventListener('load', e => {
    uploadedPhotoUrl.value = e.target?.result as string
  })
  readerBuffer.addEventListener('load', e => {
    uploadedFile.value = e.target?.result
  })
  readerUrl.readAsDataURL(file)
  readerBuffer.readAsArrayBuffer(file)
}

const saveAccountSetting = async (): Promise<void> => {
  await saveUserProfile()
  if (uploadedPhotoUrl.value) await saveProfilePhoto()
}

const saveUserProfile = async (): Promise<void> => {
  // TODO :: Change the organizationIdAffiliated value
  mutatePatchUserProfile({ firstName: firstName.value, lastName: lastName.value, organizationIdAffiliated: undefined }, {
    onSuccess: async () => { }
  })
}

const saveProfilePhoto = async (): Promise<void> => {
  const imageFileAsBlobType = new File([new Blob([uploadedFile.value as BlobPart])], uploadedPhotoData.value.name, {
    type: uploadedPhotoData.value.type
  })
  const form = new FormData()
  form.append('image', imageFileAsBlobType, uploadedPhotoData.value.name)
  console.info(form.getAll('image'))
  mutatePatchProfilePhoto(form, {
    onSuccess: async () => { }
  })
}

</script>
