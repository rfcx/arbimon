<template>
  <section class="bg-white bg-gradient-to-b from-moss from-70% to-black to-30%">
    <div class="py-8 px-4 mx-auto max-w-screen-2xl lg:py-24 lg:px-6 mt-20">
      <div class="text-center px-8">
        <h2 class="mb-2 text-2xl md:text-3xl lg:text-4xl tracking-tight font-medium text-gray-900 dark:text-white">
          How it works
        </h2>
        <p class="mb-6 text-gray-500 dark:text-insight max-w-3xl mx-auto">
          Getting started is easy.
        </p>
      </div>
      <div class="flex flex-col items-center gap-y-8">
        <div class="max-w-screen-lg mx-auto max-h-min">
          <img
            :src="activeData.imageSrc"
            class="w-full h-auto"
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

import detectSpeciesImage from '@/_assets/landing/how-it-works/detect-species.png'
import gainInsightsImage from '@/_assets/landing/how-it-works/gain-insights.png'
import uploadAudioImage from '@/_assets/landing/how-it-works/upload-audio.png'
import { ROUTE_NAMES } from '~/router'

const config = [
  {
    title: 'Upload audio',
    description: 'Upload recordings from any audio recording device and manage/organize your files with ease.',
    imageSrc: uploadAudioImage
  },
  {
    title: 'Detect species',
    description: 'Utilize Arbimon’s AI-powered detection algorithms, user-friendly tools, and no-code interface to analyze, visualize, and explore your data recordings.',
    imageSrc: detectSpeciesImage
  },
  {
    title: 'Automate biodiversity insights',
    description: 'Collaborate with your team by sharing your results and automatically generating custom visualizations that demonstrate the impact of your research project.',
    imageSrc: gainInsightsImage
  }
]

const active = ref<number>(1)
const activeData = computed(() => config[active.value])
</script>
