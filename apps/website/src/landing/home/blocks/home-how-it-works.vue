<template>
  <section class="bg-white bg-gradient-to-b from-moss from-70% to-black to-30%">
    <div class="py-8 px-4 mx-auto max-w-screen-2xl lg:py-24 lg:px-6">
      <div class="text-center px-8">
        <h2 class="mb-2 text-2xl md:text-3xl lg:text-4xl tracking-tight font-medium text-gray-900 dark:text-white">
          How it works
        </h2>
        <p class="mb-6 text-gray-500 md:text-lg dark:text-gray-400 max-w-3xl mx-auto text-lg">
          Getting started is easy.
        </p>
      </div>
      <div class="flex flex-col items-center gap-y-8">
        <div>
          <img
            :src="activeData.imageSrc"
            class="w-full"
          >
        </div>
        <div class="pr-16 w-full p-4 text-center align-middle items-center">
          <ol
            role="tab"
            aria-label="steps to get started"
            class="flex flex-wrap -mb-px justify-center"
          >
            <li
              v-for="(item, index) in config"
              :key="index"
              class="inline-block p-4 border-b-2 hover:text-frequency hover:border-frequency"
              :class="{ 'text-frequency border-frequency border-b-2': active === index }"
              :aria-selected="active === index"
              :tabindex="index"
              @click="active = index"
            >
              <button>
                <span class="block text-2xl md:text-3xl lg:text-4xl font-display">
                  {{ index + 1 }}
                </span>
                <span>{{ item.title }}</span>
              </button>
            </li>
          </ol>
          <p class="p-8 text-gray-900 dark:text-insight">
            {{ activeData.description }}
          </p>
          <router-link
            :to="{ name: ROUTE_NAMES.landingHowItWorks }"
            class="inline-flex items-center justify-center btn btn-primary"
          >
            Learn more
          </router-link>
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

const active = ref<number>(1)
const activeData = computed(() => config[active.value])
</script>
