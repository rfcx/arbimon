<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-30 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h6 class="font-eyebrow text-sm uppercase text-spoonbill mb-6">
          Arbimon step-by-step
        </h6>
        <h1 class="mb-6 text-gray-900 dark:text-white">
          How Arbimon works
        </h1>
        <p class="text-gray-500 sm:text-xl dark:text-insight">
          From start to finish of your research, Arbimon can support the collection and analysis of your data.
        </p>
      </div>
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
        <StepCard
          v-for="step in data"
          :key="step.id"
          :title="'Step ' + step.id + ': ' + step.title"
          :description="step.description"
          :icon-url="step.iconUrl"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import activityIcon from '@/_assets/how-it-works/fi_activity.svg'
import inspectIcon from '@/_assets/how-it-works/fi_inspect.svg'
import chartIcon from '@/_assets/how-it-works/fi_pie-chart.svg'
import searchIcon from '@/_assets/how-it-works/fi_search.svg'
import treeIcon from '@/_assets/how-it-works/fi_tree.svg'
import uploadIcon from '@/_assets/how-it-works/fi_upload-cloud.svg'
import StepCard from '../components/step-card.vue'

const data = [
  {
    id: 1,
    title: 'Define',
    description: 'Define the fundamental research and conservation questions to be addressed: Where? Why? What? How?',
    iconUrl: searchIcon
  },
  {
    id: 2,
    title: 'Collect',
    description: 'Conduct fieldwork to collect data by deploying acoustic recorders based on study goals and sampling design.',
    iconUrl: treeIcon
  },
  {
    id: 3,
    title: 'Upload',
    description: 'Upload an unlimited volume of audio recordings to Arbimon for free storage, file management, and ecoacoustic analysis.',
    iconUrl: uploadIcon
  },
  {
    id: 4,
    title: 'Inspect',
    description: 'View spectrograms to annotate target acoustic signals, create call templates, and build training datasets for ecoacoustic analyses.',
    iconUrl: inspectIcon
  },
  {
    id: 5,
    title: 'Analyze',
    description: 'Analyze recordings by combining state-of-the-art AI tools, ecoacoustic analyses, and environmental variables to generate ecological insights.',
    iconUrl: activityIcon
  },
  {
    id: 6,
    title: 'Share',
    description: 'Generate and publish figures and visualizations that highlight actionable results from your acoustic analyses, bringing transparency to your biodiversity reporting.',
    iconUrl: chartIcon
  }
]

</script>
