<template>
  <li
    class="px-6 py-4 flex flex-col md:flex-row gap-4 border-b cursor-pointer border-util-gray-02 hover:bg-echo selected:bg-pitch"
    :class="{'bg-pitch': isSelected}"
  >
    <div class="min-w-18 w-18 aspect-square h-18">
      <img
        v-if="project.imageUrl"
        :src="urlWrapper(project.imageUrl)"
        class="w-full h-full rounded bg-util-gray-03 object-cover"
      >
      <div
        v-else
        class="w-full h-full rounded bg-util-gray-03 flex justify-center items-center"
      />
    </div>
    <div class="flex flex-col gap-2 flex-grow overflow-hidden">
      <span class="font-medium">{{ project.name }}</span>
      <div
        v-if="shouldShowCountryAndObjective"
        class="text-xs min-w-0 flex-grow flex-1"
      >
        <span class="text-spoonbill">
          <text-tooltip
            :tooltip-id="`${props.project.id}-country`"
            :text-shorten="getCountryLabel(props.project.countries, 1)"
            :text-full="getCountryLabel(props.project.countries, props.project.countries.length)"
          />
        </span>
        <span
          v-if="project.countries.length > 0 && project.objectives.length > 0"
          class="text-util-gray-01 inline-flex mx-1"
        > | </span>
        <text-tooltip
          :tooltip-id="`${props.project.id}-objective`"
          :text-shorten="objectiveAll"
          :text-full="objectiveAll"
          :extra-class="`inline-flex whitespace-nowrap min-w-0`"
        />
      </div>
      <span class="text-xs text-clip">{{ project.summary }}</span>
      <div class="flex flex-row gap-2">
        <span class="bg-util-gray-03 px-1 rounded font-medium text-xs">{{ metricValue(project.noOfRecordings) }} {{ project.noOfRecordings > 1 ? 'minutes' : 'minute' }} recorded</span>
        <span class="bg-util-gray-03 px-1 rounded font-medium text-xs">{{ metricValue(project.noOfSpecies) }} species</span>
      </div>
    </div>
  </li>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { metricValue } from '@rfcx-bio/utils/number'

import { getCountryLabel } from '@/_services/country'
import { urlWrapper } from '@/_services/images/url-wrapper'
import TextTooltip from '../../projects/components/text-tooltip.vue'
import { masterObjectiveTypes } from '../../projects/types'
import type { ProjectProfileWithMetrics } from '../data/types'

const props = defineProps<{ project: ProjectProfileWithMetrics, isSelected: boolean }>()

// countries and objectives
const shouldShowCountryAndObjective = computed(() => {
  return props.project.countries.length > 0 || props.project.objectives.length > 0
})

const objectiveAll = computed(() => {
  const objectives = props.project.objectives.map((objective) => {
    return Object.values(masterObjectiveTypes).find((type) => type.slug === objective)?.shorten ?? masterObjectiveTypes.Others.shorten
  })

  return [...new Set(objectives)].join(', ')
})

</script>
