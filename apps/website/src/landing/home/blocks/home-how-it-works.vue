<template>
  <section class="bg-white dark:bg-steel-gray">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          How it works
        </h2>
      </div>
      <div class="flex flex-row">
        <div class="basis-5/12 pr-16">
          <p class="mb-16 text-gray-600 sm:text-xl dark:text-gray-200">
            Get started as easy as 1, 2, 3
          </p>
          <h2 class="mb-4 text-2xl tracking-tight font-bold text-gray-900 dark:text-white">
            {{ activeData.title }}
          </h2>
          <p class="mb-8 text-gray-900 dark:text-white">
            {{ activeData.description }}
          </p>
          <ol class="mb-16 flex items-center w-full">
            <li
              class="flex w-full items-center after:content-DEFAULT after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-gray-700"
              :class="{ 'active': active === 0, 'visited': active > 0 }"
            >
              <button
                class="flex items-center justify-center w-10 h-10 text-xl text-gray-500 dark:text-gray-100 border border-gray-500 dark:border-gray-400 rounded-full lg:h-12 lg:w-12 flex-shrink-0"
                @click="active = 0"
              >
                1
              </button>
            </li>
            <li
              class="flex w-full items-center after:content-DEFAULT after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-gray-700"
              :class="{ 'active': active === 1, 'visited': active > 1 }"
            >
              <button
                class="flex items-center justify-center w-10 h-10 text-xl text-gray-500 dark:text-gray-100 border border-gray-500 dark:border-gray-400 rounded-full lg:h-12 lg:w-12 flex-shrink-0"
                @click="active = 1"
              >
                2
              </button>
            </li>
            <li
              class="flex items-center w-full"
              :class="{ 'active': active === 2 }"
            >
              <button
                class="flex items-center justify-center w-10 h-10 text-xl text-gray-500 dark:text-gray-100 border border-gray-500 dark:border-gray-400 rounded-full lg:h-12 lg:w-12 flex-shrink-0"
                @click="active = 2"
              >
                3
              </button>
            </li>
          </ol>
          <router-link
            :to="{ name: ROUTE_NAMES.landingHowItWorks }"
            class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
          >
            Learn more
            <svg
              class="ml-2 -mr-1 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg>
          </router-link>
        </div>
        <div class="basis-7/12">
          <img
            :src="activeData.imageSrc"
            class="w-full"
          >
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

import uploadImage from '@/_assets/landing/home-how-upload.png'
import { ROUTE_NAMES } from '~/router'

const config = [
  {
    title: 'Upload audio',
    description: 'Use your preferred method to capture audio recordings of wildlife activity and upload them to Arbimon for further analysis.',
    imageSrc: uploadImage
  },
  {
    title: 'Perform analysis',
    description: 'Efficiently identify species in your audio with Arbimon\'s AI capabilities',
    imageSrc: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg'
  },
  {
    title: 'Gain insights',
    description: 'Explore the analysis results via maps and graphs, export the results for your research',
    imageSrc: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg'
  }
]

const active = ref<0 | 1 | 2>(1)
const activeData = computed(() => config[active.value])
</script>
<style scoped>
.active > button {
  @apply bg-gray-800 dark:bg-gray-100 !text-white !dark:text-gray-900 !border-0;
}
.visited {
  @apply dark:after:border-gray-500;
}
.visited > button {
  @apply bg-gray-600 dark:bg-gray-500 !text-white !dark:text-gray-900 !border-0;
}

</style>
