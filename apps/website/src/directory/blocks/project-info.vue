<template>
  <div class="flex flex-col inset-1/4 left-100 w-98 bg-moss transition-transform -translate-x-full rounded-lg">
    <div class="rounded-t-lg bg-moss p-2">
      <div class="flex flex-row justify-between items-center">
        <span
          v-if="project?.countries.length === 0"
          class="text-sm text-spoonbill font-medium flex-1"
        >
          No site
        </span>
        <div class="flex flex-1 flex-row items-center">
          <span
            v-if="project?.countries.length !== 0"
            class="text-spoonbill font-medium text-xs ml-2"
          >{{ countrie }}</span>
          <div
            v-if="countrieFlag"
            class="align-baseline flex"
          >
            <country-flag
              :country="countrieFlag"
              size="normal"
              class="flex ml-2"
            />
          </div>
          <icon-custom-fi-globe
            v-else
            class="flex m-2"
          />
        </div>
        <icon-fa-close
          class="text-fog m-auto self-end w-4 h-3.5"
          @click="emit('emitCloseProjectInfo')"
        />
      </div>
    </div>
    <div class="overflow-scroll">
      <img
        :src="project?.imageUrl"
        class="w-full h-full object-cover bg-pitch object-center h-52"
      >
      <div class="p-4 border-b border-util-gray-01">
        <span class="text-lg font-medium">{{ project?.name }}</span>
        <div
          class="flex font-medium text-sm flex-row border-gray-300 mt-3 space-x-4 items-center"
        >
          <span>
            Project dates:
          </span>
          <span class="uppercase">
            {{ formatDateRange(new Date()) }}
          </span>
          <icon-custom-arrow-right-white class="self-start" />
          <span
            class="uppercase"
          >
            {{ formatDateRange(null) }}
          </span>
        </div>
        <router-link
          :to="`/p/${project?.slug}`"
          class="text-frequency"
        >
          <button
            class="btn btn-primary w-full mt-10"
            :disabled="project?.isMock"
            :class="{'opacity-50 cursor-not-allowed': project?.isMock}"
          >
            View Insights
          </button>
        </router-link>
      </div>
      <div class="p-4">
        <numeric-metric
          tooltip-id="deployment-sites"
          tooltip-text="Number of sites with recorders deployed."
          title="Project sites:"
          :value="120"
          icon-name="ft-map-pin-lg"
          class="flex-1"
        />
        <numeric-metric
          tooltip-id="threatened-species-over-all-species"
          title="Threatened/total species:"
          tooltip-text="Threatened, Vulnerable, Endangered, & Critically Endangered species over total species found."
          :value="64"
          :total-value="project?.noOfSpecies"
          icon-name="ft-actual-bird"
          class="flex-1"
        />
        <numeric-metric
          tooltip-id="total-detections"
          title="Total detections:"
          tooltip-text="Total number of species calls detected."
          :value="1000"
          icon-name="ft-search-lg"
          class="flex-1"
        />
        <numeric-metric
          tooltip-id="total-recordings"
          :tooltip-text="`Total ${project?.noOfRecordings} of recordings captured`"
          title="Total recordings"
          :value="project?.noOfRecordings"
          icon-name="ft-mic-lg"
          class="flex-1"
        />
        <span
          v-if="project?.isMock"
          class="text-sm text-gray-300 px-2"
        >Only fake data. This project is not on dev environment. </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { useProjectDirectoryStore } from '~/store'
import NumericMetric from '../components/numeric-metric.vue'
import { type ProjectProfileWithMetrics } from '../data/types'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits<{(e: 'emitCloseProjectInfo'): void }>()

const pdStore = useProjectDirectoryStore()
const project = computed<ProjectProfileWithMetrics | undefined>(() => {
  const project = pdStore.getProjectWithMetricsById(props.projectId)
  if (!project) { // TODO: fetch from api if there is no metrics in store
    const projectLight = pdStore.getProjectLightById(props.projectId)
    if (projectLight === undefined) return undefined
    return {
      ...projectLight,
      summary: 'This is a test project!',
      objectives: ['bio-baseline'],
      noOfSpecies: 0,
      noOfRecordings: 0,
      countries: [],
      isHighlighted: false,
      isMock: true,
      imageUrl: ''
    }
  }
  return project
})

const countrie = computed(() => {
  if (project.value?.countries == null) return ''
  if (project.value?.countries.length > 1) {
    return 'Multiple countries'
  } else {
    return project.value?.countries[0]
  }
})

const countrieFlag = computed(() => {
  if (project.value?.countries == null) return ''
  if (project.value?.countries.length > 1) {
    return ''
  } else {
    return project.value?.countries[0]
  }
})

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'present'
  else return dayjs(date).format('MM/DD/YYYY')
}

</script>
<style lang="scss">
.normal-flag {
  margin: 1px !important
}
</style>
