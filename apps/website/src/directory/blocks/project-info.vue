<template>
  <div class="flex flex-col left-100 w-98 bg-moss transition-transform -translate-x-full rounded-lg">
    <div class="rounded-t-lg bg-moss">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-1 flex-row items-center">
          <span
            class="text-spoonbill font-medium text-xs ml-4 my-3.5"
          >{{ getCountryLabel(project?.countries ?? [], 1) }}</span>
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
            v-if="project?.countries ? project?.countries.length > 1 : false"
            class="flex m-2 my-3"
          />
        </div>
        <svg
          class="w-4 h-3.5 m-auto self-end mr-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          @click="emit('emitCloseProjectInfo')"
        >
          <path d="M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z" />
        </svg>
      </div>
    </div>
    <div class="overflow-scroll">
      <img
        v-if="project?.imageUrl"
        :src="project?.imageUrl"
        class="w-full object-contain bg-util-gray-02 h-52"
      >
      <div
        v-else
        class="w-full h-52 object-contain bg-util-gray-02 flex justify-center items-center"
      />
      <div class="p-4 border-b border-util-gray-01">
        <span class="text-lg font-medium">{{ project?.name }}</span>
        <div
          v-if="profile?.dateStart"
          class="flex font-medium text-sm flex-row border-gray-300 mt-3 space-x-2 items-center"
        >
          <span>
            Project dates:
          </span>
          <span>
            {{ formatDateRange(profile?.dateStart) }}
          </span>
          <icon-custom-arrow-right-white class="self-start" />
          <span>
            {{ formatDateRange(profile?.dateEnd) }}
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
            View project insights
          </button>
        </router-link>
      </div>
      <div class="p-4">
        <numeric-metric
          tooltip-id="deployment-sites"
          tooltip-text="Number of sites with recorders deployed."
          title="Project sites:"
          :value="profile?.metrics?.totalSites ?? 0"
          icon-name="ft-map-pin-lg"
          class="flex-1"
        />
        <numeric-metric
          tooltip-id="threatened-species-over-all-species"
          title="Threatened / total species:"
          tooltip-text="Threatened, Vulnerable, Endangered, & Critically Endangered species over total species found."
          :value="profile?.metrics?.threatenedSpecies ?? 0"
          :total-value="profile?.metrics?.totalSpecies ?? 0"
          icon-name="ft-actual-bird"
          class="flex-1"
        />
        <numeric-metric
          tooltip-id="total-detections"
          title="Total detections:"
          tooltip-text="Total number of species calls detected."
          :value="profile?.metrics?.totalDetections ?? 0"
          icon-name="ft-search-lg"
          class="flex-1"
        />
        <numeric-metric
          tooltip-id="total-recordings"
          :tooltip-text="`Total ${totalRecordingsUnit} of recordings captured`"
          :title="`Total recordings (${totalRecordingsUnit}):`"
          :value="totalRecordingsValue"
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
import { type AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, watch } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { getCountryLabel } from '@/_services/country'
import { apiClientKey } from '@/globals'
import { useGetProjectInfo } from '@/projects/_composables/use-project-profile'
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

const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => props.projectId)
const { data: profile, refetch: profileRefetch } = useGetProjectInfo(apiClientBio, selectedProjectId, ['metrics'])

watch(() => props.projectId, () => {
  profileRefetch()
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
  if (!dayjs(date).isValid()) return 'Present'
  else return dayjs(date).format('MM/DD/YYYY')
}

// form the total recordings value (minutes or hours)
const totalRecordingsMin = computed(() => profile.value?.metrics?.totalRecordings ?? 0)
const MAXIMUM_MINUTE = 3 * 60 // 3 hours
const totalRecordingsUnit = computed(() => totalRecordingsMin.value < MAXIMUM_MINUTE ? 'minutes' : 'hours')
const totalRecordingsValue = computed(() => {
  return totalRecordingsMin.value < MAXIMUM_MINUTE ? totalRecordingsMin.value : totalRecordingsMin.value / 60
})

</script>
<style lang="scss">
.normal-flag {
  margin: 1px !important
}
</style>
