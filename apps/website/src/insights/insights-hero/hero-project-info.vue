<template>
  <div class="my-4 flex gap-2 font-display text-insight text-sm flex-wrap">
    <div
      class="flex flex-row items-center font-display text-sm mr-2 h-5"
    >
      <icon-fas-spinner
        v-if="isLoadingProjectLocation"
        class="animate-spin"
        aria-label="Loading"
      />
      <span
        class="text-insight text-sm mr-2"
      >
        {{ projectCountry }}
      </span>
      <div
        v-if="projectFlag"
        class="align-baseline"
      >
        <country-flag
          :country="projectFlag"
          size="small"
        />
      </div>
      <icon-custom-fi-globe
        v-else
      />
    </div>
    <div class="flex flex-row border-l-2 border-gray-300 px-2 space-x-4 items-center">
      <span>
        Project dates:
      </span>
      <span class="uppercase">
        {{ formatDateRange(metrics?.minDate) }}
      </span>
      <icon-custom-arrow-right-white class="self-start" />
      <span
        class="uppercase"
      >
        {{ formatDateRange(metrics?.maxDate) }}
      </span>
    </div>
    <div
      v-if="projectObjectives"
      class="border-l-2 border-gray-300 px-2"
    >
      <span>Objectives: </span>
      {{ projectObjectivesText }}
    </div>
  </div>
</template>

<script setup lang="ts">

import dayjs from 'dayjs'
import { computed } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { type DashboardMetricsResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'
import { type ProjectLocationResponse } from '@rfcx-bio/common/api-bio/project/project-location'

import { objectiveTypes } from '../../projects/types'

const props = defineProps<{
  projectLocation: ProjectLocationResponse | undefined,
  isLoadingProjectLocation: boolean,
  projectObjectives: string[],
  metrics: DashboardMetricsResponse | undefined
}>()

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'no data'
  else return dayjs(date).format('MMM YYYY')
}

const projectFlag = computed(() => {
  if (props.projectLocation === undefined) return ''
  if (props.projectLocation.code === null) return ''
  return props.projectLocation.code.length > 1 ? '' : props.projectLocation.code[0]
})

const projectCountry = computed(() => {
  if (props.projectLocation === undefined) return ''
  if (props.projectLocation.country === null) return ''
  return props.projectLocation.country.join(', ')
})

const projectObjectivesText = computed(() => {
  const objectives = props.projectObjectives
  if (objectives.length === 0) return ''
  const objectiveDescs = objectives?.map((obj) => {
    const objectiveType = objectiveTypes.find((o) => o.slug === obj)
    return objectiveType?.description ?? obj
  })
  return objectiveDescs?.join(', ')
})

</script>
