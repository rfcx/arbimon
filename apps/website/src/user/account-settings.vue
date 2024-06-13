<template>
  <landing-navbar />
  <section class="pt-16 mb-16 bg-white dark:bg-pitch">
    <div
      v-if="isErrorProfileData"
      class="flex rounded-lg bg-moss py-3 px-4 mx-auto max-w-screen-md dark:bg-moss items-center justify-center h-screen text-center"
    >
      <span>
        It seems the page didn’t load as expected.<br>
        Please refresh your browser to give it another go.
      </span>
    </div>
    <div
      v-else
      class="block rounded-lg bg-moss py-3 px-4 mx-auto max-w-screen-md dark:bg-moss h-auto"
    >
      <div class="py-2 px-4 mx-auto max-w-screen-md border-b-1 border-white/80">
        <h2 class="tracking-tight font-medium text-gray-900 dark:text-white">
          Account settings
        </h2>
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
            <h3>
              Change profile photo
            </h3>
            <h5 class="mt-3">
              JPG and PNG files less than 5 MB are supported.
            </h5>
            <input
              id="fileUpload"
              type="file"
              accept="image/jpeg, image/png"
              hidden
              @change="uploadPhoto"
            >
            <button
              class="btn btn-secondary group mt-5 disabled:btn-disabled disabled:hover:btn-disabled disabled:opacity-75 disabled:cursor-not-allowed"
              type="button"
              :disabled="!isAuth0Account"
              @click="selectPhoto"
            >
              Upload photo <icon-custom-cloud-upload class="ml-2 group-hover:stroke-pitch inline-flex" />
            </button>
            <div
              v-if="isLargeFile"
              class="mt-3"
            >
              <p class="text-flamingo text-sm">
                <span
                  class="text-sm font-medium"
                  role="alert"
                >
                  Upload Error: File Too Large.
                </span>
                The image must be smaller than 5MB. <br>
                Please choose a file that meets this size requirement to continue.
              </p>
            </div>
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
          :disabled="!isAuth0Account"
          class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
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
          :disabled="!isAuth0Account"
          class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
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
          class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
          disabled
        >
        <p class="mt-5 text-insight text-base font-medium font-sans">
          Affiliated organization
        </p>
        <div class="relative w-full">
          <input
            ref="organizationSearchInput"
            v-model="searchOrganizationValue"
            class="w-full mt-2 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
            :class="{ 'rounded-b-lg': orgsSearchResult?.length === 0 || dropdownStatus !== 'search' }"
            type="text"
            placeholder="Type to search organizations"
            @input="organizationSearchInputChanged"
            @blur="onBlur"
            @click="openOrganizationSearch()"
          >
          <div
            ref="organizationSearchLoading"
            role="status"
            class="absolute z-index-10 top-3 right-3"
            :class="{ hidden: !isSearchOrganizationFetching }"
          >
            <icon-custom-ic-loading class="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-frequency" />
            <span class="sr-only">Loading...</span>
          </div>
          <div
            class="absolute z-index-10 top-6 right-3 cursor-pointer"
            :class="{ hidden: isSearchOrganizationFetching }"
            @click="openOrganizationSearch()"
          >
            <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
          </div>
        </div>

        <div
          ref="createNewOrganizationFormContainer"
          class="z-10 hidden w-[20.0rem] text-insight bg-moss border-cloud border-1 rounded-lg shadow"
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
          class="z-10 hidden w-[20.0rem] text-insight bg-echo border-cloud border rounded-lg shadow flex flex-row justify-between p-3"
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
          class="z-10 w-[20.0rem] hidden px-0 mx-auto max-w-screen-md text-insight bg-echo border-cloud border-b-0 border-l border-r rounded-b-lg divide-y divide-gray-100 shadow overflow-y-scroll"
          :class="{'border-b-1 rounded-t-lg border-t-1': searchOrganizationValue && !organizationsSearchResult, 'border-b-1 border-t-1 rounded-t-lg max-h-66': orgsSearchResult?.length}"
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
        <button
          class="w-full btn btn-primary inline items-center group mt-7"
          type="button"
          @click="saveAccountSetting"
        >
          Save changes
          <icon-custom-ic-loading
            v-if="isUpdatingProfilePhoto || isUpdatingUserProfile"
            class="animate-spin w-4 h-4 ml-2 inline"
          />
        </button>
        <SaveStatusText
          v-if="showStatus"
          class="flex"
          :success="isSuccess"
          :error-message="errorMessage"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import type { DropdownOptions } from 'flowbite'
import { Dropdown } from 'flowbite'
import { type Ref, computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { type OrganizationType, type OrganizationTypes, ORGANIZATION_TYPE, ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import image from '@/_assets/cta/frog-hero.webp'
import SaveStatusText from '@/_components/save-status-text.vue'
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import OrganizationSearchResultCard from '../insights/overview/components/dashboard-project-summary/components/dashboard-project-stakeholders/organization-search-result-card.vue'
import { useCreateOrganization } from '../insights/overview/composables/use-create-organization'
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
const searchDropdown = ref() as Ref<Dropdown>
const notFoundDropdown = ref() as Ref<Dropdown>
const createNewOrganizationForm = ref() as Ref<Dropdown>
const dropdownStatus = ref<'idle' | 'search' | 'create-org'>('idle')
const organizationSearchInput = ref<HTMLDivElement | null>(null)
const organizationSearchResultContainer = ref<HTMLDivElement | null>(null)
const organizationSearchResultNotFoundContainer = ref<HTMLDivElement | null>(null)
const addedOrganization = ref<OrganizationTypes['light']>()
const searchOrganizationValue = ref('')
const createNewOrganizationFormContainer = ref<HTMLDivElement | null>(null)
const newOrganizationType = ref<OrganizationType>('non-profit-organization')
const newOrganizationUrl = ref<string>('')
const dropdownOptions: DropdownOptions = { placement: 'bottom-start', triggerType: 'none', offsetDistance: 1 }
const createNewOrganizationLoading = ref(false)

const store = useStore()
const router = useRouter()
const apiClientBio = inject(apiClientKey) as AxiosInstance

const { isLoading: isLoadingProfileData, data: profileData, isError: isErrorProfileData } = useGetProfileData(apiClientBio)
const { isPending: isUpdatingProfilePhoto, mutate: mutatePatchProfilePhoto } = usePatchProfileImage(apiClientBio)
const { isPending: isUpdatingUserProfile, mutate: mutatePatchUserProfile } = usePatchUserProfile(apiClientBio)
const { data: organizationsList } = useGetOrganizationsList(apiClientBio)
const { data: organizationsSearchResult, refetch: refetchOrganizationsSearchResult, isFetching: isSearchOrganizationFetching } = useGetSearchOrganizationsResult(apiClientBio, searchOrganizationValue)
const { mutate: mutateNewOrganization } = useCreateOrganization(apiClientBio)

const selectedOrganizationId = ref(profileData.value?.organizationIdAffiliated)

const showStatus = ref(false)
const isSuccess = ref(false)
const errorMessage = ref<string>()

onMounted(() => {
  firstName.value = store.user?.given_name ?? store.user?.user_metadata?.given_name ?? store.user?.nickname ?? ''
  lastName.value = store.user?.family_name ?? store.user?.user_metadata?.family_name ?? ''
  email.value = store.user?.email ?? ''
  searchOrganizationValue.value = displayedOrganization.value?.name ?? ''
  searchDropdown.value = new Dropdown(organizationSearchResultContainer.value, organizationSearchInput.value, dropdownOptions)
  notFoundDropdown.value = new Dropdown(organizationSearchResultNotFoundContainer.value, organizationSearchInput.value, dropdownOptions)
  createNewOrganizationForm.value = new Dropdown(createNewOrganizationFormContainer.value, organizationSearchInput.value, dropdownOptions)
})

watch(profileData, () => {
  firstName.value = profileData.value?.firstName ?? store.user?.given_name ?? store.user?.user_metadata?.given_name ?? store.user?.nickname ?? ''
  lastName.value = profileData.value?.lastName ?? store.user?.family_name ?? store.user?.user_metadata?.family_name ?? ''
  searchOrganizationValue.value = displayedOrganization.value?.name ?? ''
})

watch(organizationsList, async () => {
  searchOrganizationValue.value = displayedOrganization.value?.name ?? ''
  await refetchOrganizationsSearch()
})

const profilePhoto = computed(() => {
  return uploadedPhotoUrl.value ? uploadedPhotoUrl.value : store.user?.picture ? store.user?.picture : image
})

const isAuth0Account = computed(() => {
  return store.user?.auth0_user_id?.includes('auth0') === true
})

const orgsSearchResult = computed(() => {
  return searchOrganizationValue.value
  ? organizationsSearchResult.value?.map(o => {
      return {
        ...o,
        description: ORGANIZATION_TYPE_NAME[o.type]
      }
    })
  : organizationsList.value?.map(o => {
      return {
        ...o,
        description: ORGANIZATION_TYPE_NAME[o.type]
      }
    })
})

const displayedOrganization = computed(() => {
  if (addedOrganization.value) return { ...addedOrganization.value, description: ORGANIZATION_TYPE_NAME[addedOrganization.value.type] }
  else if (profileData.value?.organizationIdAffiliated !== null) return organizationsList.value?.find(o => o.id === profileData.value?.organizationIdAffiliated)
  else return undefined
})

const openOrganizationSearch = async () => {
  dropdownStatus.value = 'search'
  await nextTick()
  organizationSearchInput.value?.focus()
  searchDropdown.value.show()
}

const showNotFoundContainer = async (): Promise<void> => {
  notFoundDropdown.value.show()
}

const hideNotFoundContainer = async (): Promise<void> => {
  notFoundDropdown.value.hide()
}

const organizationSearchInputChanged = async () => {
  createNewOrganizationForm.value.hide()
  dropdownStatus.value = 'search'
  await refetchOrganizationsSearch()
  if (orgsSearchResult.value && orgsSearchResult.value.length === 0) {
    showNotFoundContainer()
  } else {
    showNotFoundContainer()
    hideNotFoundContainer()
    searchDropdown.value.show()
  }
}

const onBlur = () => {
  setTimeout(() => {
    if (dropdownStatus.value === 'create-org') {
      showNotFoundContainer()
      hideNotFoundContainer()
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

const onAddNewOrganizationFromSearch = async (id: number): Promise<void> => {
  searchDropdown.value.hide()

  // Add to the list when it's new org
  const newOrg = searchOrganizationValue.value ? organizationsSearchResult.value?.find((o) => o.id === id) : organizationsList.value?.find((o) => o.id === id)
  if (newOrg == null) return
  selectedOrganizationId.value = newOrg.id
  addedOrganization.value = newOrg
  searchOrganizationValue.value = newOrg.name
  await refetchOrganizationsSearch()
}

const openCreateNewOrganizationForm = async (): Promise<void> => {
  dropdownStatus.value = 'create-org'
  notFoundDropdown.value.hide()
  createNewOrganizationForm.value.show()
}

const hasFailed = ref(false)

const createNewOrganization = (): void => {
  createNewOrganizationLoading.value = true
  mutateNewOrganization({ name: searchOrganizationValue.value, type: newOrganizationType.value, url: newOrganizationUrl.value }, {
    onSuccess: (newOrganization) => {
      addedOrganization.value = newOrganization
      selectedOrganizationId.value = newOrganization.id
      dropdownStatus.value = 'idle'
      refetchOrganizationsSearch()
      createNewOrganizationLoading.value = false
      createNewOrganizationForm.value.hide()
    },
    onError: () => {
      hasFailed.value = true
      errorMessage.value = 'A Server Error Occurred. We encountered some issues while creating the organization. Could you please try again?'

      dropdownStatus.value = 'create-org'
      createNewOrganizationLoading.value = false
    }
  })
}

const selectPhoto = async (): Promise<void> => {
  document.getElementById('fileUpload')?.click()
}

const file = ref<File | null>(null)

const isLargeFile = computed(() => {
  return file.value ? file.value.size > 5 * 1024 * 1024 : false
})

const uploadPhoto = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const file: File = (target.files as FileList)[0]
  // upload files larger than 5MB
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
  if (!firstName.value) {
    displayTextAfterSaveWithSuccessStatus(false, 'Please enter your first name.')
    return
  }
  if (!lastName.value) {
    displayTextAfterSaveWithSuccessStatus(false, 'Please enter your last name.')
    return
  }
  try {
    await saveUserProfile()
    if (uploadedPhotoUrl.value) {
      await saveProfilePhoto()
    }
  } catch (error) {
    displayTextAfterSaveWithSuccessStatus(false, 'A Server Error Occurred. We encountered some issues while saving your changes. Could you please try again?')
  }
}

const displayTextAfterSaveWithSuccessStatus = (success: boolean, errorMsg?: string) => {
  showStatus.value = true
  isSuccess.value = success
  errorMessage.value = errorMsg
}

const saveUserProfile = async (): Promise<void> => {
  mutatePatchUserProfile({ firstName: firstName.value, lastName: lastName.value, organizationIdAffiliated: selectedOrganizationId.value }, {
    onSuccess: async () => {
      if (uploadedPhotoUrl.value === '') {
        displayTextAfterSaveWithSuccessStatus(true)
      }
    },
    onError: () => {
      displayTextAfterSaveWithSuccessStatus(false, 'Failed to save changes to account settings.')
    }
  })
}

const saveProfilePhoto = async (): Promise<void> => {
  const imageFileAsBlobType = new File([new Blob([uploadedFile.value as BlobPart])], uploadedPhotoData.value.name, {
    type: uploadedPhotoData.value.type
  })
  const form = new FormData()
  form.append('image', imageFileAsBlobType, uploadedPhotoData.value.name)
  mutatePatchProfilePhoto(form, {
    onSuccess: async () => {
      router.go(0)
      displayTextAfterSaveWithSuccessStatus(true)
    },
    onError: () => {
      displayTextAfterSaveWithSuccessStatus(false, 'The photo upload was failed to upload.')
    }
  })
}
</script>
