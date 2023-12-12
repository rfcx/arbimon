<template>
  <li
    class="px-6 py-4 flex flex-col md:flex-row gap-4 border-b cursor-pointer border-util-gray-01 hover:bg-echo selected:bg-pitch"
    :class="{'bg-pitch': isSelected}"
  >
    <div class="w-18 aspect-square h-18">
      <img
        :src="project.imageUrl"
        class="w-full h-full rounded bg-util-gray-02"
      >
    </div>
    <div class="flex flex-col gap-2 flex-grow overflow-hidden">
      <span class="font-medium">{{ project.name }}</span>
      <div
        v-if="shouldShowCountryAndObjective"
        class="text-xs whitespace-nowrap min-w-0 flex-grow flex-1"
      >
        <span class="text-spoonbill inline-flex">{{ countryCode }}</span>
        <span class="text-gray-300 inline-flex mx-1"> | </span>
        <text-tooltip
          :tooltip-id="project.name"
          :tooltip-text="objectiveAll"
        />
      </div>
      <span class="text-xs text-clip md:text-sm">{{ project.summary }}</span>
      <div class="flex flex-row gap-2">
        <span class="bg-util-gray-02 px-1 rounded font-medium text-xs">{{ project.noOfRecordings }} recordings</span>
        <span class="bg-util-gray-02 px-1 rounded font-medium text-xs">{{ project.noOfSpecies }} species</span>
      </div>
    </div>
  </li>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { masterOjectiveTypes, objectiveTypes } from '../../projects/types'
import type { ProjectProfileWithMetrics } from '../data/types'
import TextTooltip from '../../projects/components/text-tooltip.vue'

const props = defineProps<{ project: ProjectProfileWithMetrics, isSelected: boolean }>()

// countries and objectives
const shouldShowCountryAndObjective = computed(() => {
  return props.project.countries.length > 0 || props.project.objectives.length > 0
})

const objectiveAll = computed(() => {
  const objectives = props.project.objectives.map((objective) => {
    return objectiveTypes.find((type) => type.slug === objective)?.shorten ?? masterOjectiveTypes.Others.shorten
  })

  return [...new Set(objectives)].join(', ')
})

const countryCode = computed(() => {
  if (props.project.countries.length === 0) { return 'No site' }
  return props.project.countries.join(',')
})

</script>
