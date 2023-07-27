<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-10 px-6 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h1 class="mb-6 text-gray-900 dark:text-insight">
          Types of analyses available on Arbimon
        </h1>
        <p class="text-gray-500 dark:text-insight">
          We offer a range of analyses to fit a wide variety of research needs.
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-4">
        <analyse-card
          v-for="analyse in data"
          :key="analyse.id"
          :title="analyse.title"
          :description="analyse.description"
          :icon-url="analyse.iconUrl"
          :tag="analyse.tag"
          class="w-full md:w-5/12"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import aedIcon from '@/_assets/how-it-works/AED+C.svg'
import pmIcon from '@/_assets/how-it-works/PM.svg'
import rfmIcon from '@/_assets/how-it-works/RFM.svg'
import ssIcon from '@/_assets/how-it-works/Soundscapes.svg'
import AnalyseCard from '../components/analyse-card.vue'

const data = [
  {
    id: 1,
    title: 'Pattern Matching (PM)',
    description: 'Our Pattern matching tool is a simple sound detection tool that only requires a single example of the target sound to get started.',
    tag: 'Supervised',
    iconUrl: pmIcon
  },
  {
    id: 2,
    title: 'Soundscape Analyses',
    description: 'Our soundscape analytical approaches allow holistic comparisons of entire eco-acoustic communities across time and space.',
    tag: '',
    iconUrl: ssIcon
  },
  {
    id: 3,
    title: 'AI Detection Models',
    description: 'Our deep-learning audio recognition models are trained to automate the detection of known species in raw soundscape recordings.',
    tag: 'Supervised',
    iconUrl: rfmIcon
  },
  {
    id: 4,
    title: 'Automated Event Detection & Clustering',
    description: 'Our Audio Event Detection (AED) and clustering analyses aim to automatically detect and categorize sounds in large audio datasets.',
    tag: 'Unsupervised',
    iconUrl: aedIcon
  },
  {
    id: 5,
    title: 'Ecological Analyses',
    description: 'We use ecological models that combine audio detections with environmental variables to estimate ecological trends and patterns from species to community levels.',
    tag: '',
    iconUrl: ''
  }
]
</script>
