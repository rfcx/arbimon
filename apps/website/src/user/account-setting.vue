<template>
  <landing-navbar />
  <section class="pt-16 bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-10 border-b-1 border-white/80">
      <h1 class="tracking-tight font-medium text-gray-900 dark:text-white">
        Account Setting
      </h1>
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
      <button
        id="dropdownDefaultButton"
        class="w-full mt-2 h-10 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
        type="button"
      >
        Dropdown button
        <svg
          class="w-2.5 h-2.5 ms-3 inline-flex"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
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
import { type Ref, computed, inject, onMounted, ref } from 'vue'

import image from '@/_assets/cta/frog-hero.webp'
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { usePatchProfileImage } from './composables/use-patch-profile-photo'
import { usePatchUserProfile } from './composables/use-patch-user-profile'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const uploadedPhotoUrl = ref('')
const uploadedFile = ref()
const uploadedPhotoData: Ref<Record<string, string>> = ref({
  name: '',
  type: ''
})

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance

const { isPending: isUpdatingProfilePhoto, mutate: mutatePatchProfilePhoto } = usePatchProfileImage(apiClientBio)
const { isPending: isUpdatingUserProfile, mutate: mutatePatchUserProfile } = usePatchUserProfile(apiClientBio)

onMounted(() => {
  firstName.value = store.user?.given_name ?? store.user?.user_metadata?.given_name ?? store.user?.nickname ?? ''
  lastName.value = store.user?.family_name ?? store.user?.user_metadata?.family_name ?? ''
  email.value = store.user?.email ?? ''
})

const profilePhoto = computed(() => {
  return uploadedPhotoUrl.value ? uploadedPhotoUrl.value : store.user?.picture ? store.user?.picture : image
})

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

const apiIsAlready = false // TODO :: Remove when the data is Already

const saveAccountSetting = async (): Promise<void> => {
  if (apiIsAlready) await saveUserProfile()
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
