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
        class="w-full btn btn-primary group mt-7"
        type="button"
        @click="saveAccountSetting"
      >
        Save
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import image from '@/_assets/cta/frog-hero.webp'
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { useStore } from '~/store'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const uploadedPhoto = ref('')

const store = useStore()

onMounted(() => {
  firstName.value = store.user?.given_name ?? ''
  lastName.value = store.user?.family_name ?? ''
  email.value = store.user?.email ?? ''
})

const profilePhoto = computed(() => {
  return uploadedPhoto.value ? uploadedPhoto.value : store.user?.picture ? store.user?.picture : image
})

const selectPhoto = async (): Promise<void> => {
  document.getElementById('fileUpload').click()
}

const uploadPhoto = async (e): Promise<void> => {
  const file = e.target.files[0] // the browser has NO ACCESS to the file path for security reasons
  const reader = new FileReader()
  reader.addEventListener('load', e => {
    uploadedPhoto.value = e.target.result
  })
  reader.readAsDataURL(file)
}

const saveAccountSetting = async (): Promise<void> => {
  // TODO :: saveAccountSetting
}

</script>
