<template>
  <div
    class="bg-gray-50 dark:bg-hero-cta-frog-bg bg-cover border-b-1 border-fog"
  >
    <div class="max-w-screen-xl mx-auto px-8 md:px-10 pt-20 pb-10 text-gray-900 dark:text-insight flex flex-col md:flex-row justify-between">
      <div class="">
        <h1 class="pb-4 text-frequency font-header">
          {{ selectedProject?.name }}
        </h1>
        <hero-brief-overview
          :can-edit="store.selectedProject?.isMyProject ?? false"
          :default-text="dashboardStore.projectSummary ?? ''"
        />
        <div class="mt-4 flex flex-row items-center justify-start">
          <div
            class="flex flex-row items-center font-display text-sm mr-2 border-r-2 border-gray-300 h-5"
          >
            <icon-fas-spinner
              v-if="isLoadingProjectStreams"
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
              class="mr-2 align-baseline"
            >
              <country-flag
                :country="projectFlag"
                size="small"
              />
            </div>
            <icon-custom-fi-globe
              v-else
              class="self-start mr-2"
            />
          </div>
          <div
            class="font-display text-sm flex flex-row items-center justify-between mr-2 border-r-2 border-gray-300 h-5"
          >
            <span
              class="text-insight text-sm mx-3"
            >
              Project dates:
            </span>
            <span
              class="text-insight uppercase mx-3"
            >
              {{ formatDateRange(metrics?.minDate) }}
            </span>
            <icon-custom-arrow-right-white class="self-start" />
            <span
              class="text-insight uppercase mx-3 my-2"
            >
              {{ formatDateRange(metrics?.maxDate) }}
            </span>
          </div>
        </div>
      </div>
      <div class="justify-self-end order-first md:order-last">
        <span class="text-xxs text-fog">// TODO: menu</span>
      </div>
    </div>
    <cta-card v-if="!metrics?.totalDetections && !isLoading" />
    <nav class="sticky top-0 z-40">
      <div class="max-w-screen-xl mx-auto px-8">
        <div class="text-center text-gray-500 dark:text-insight">
          <ul class="flex flex-wrap -mb-px">
            <li
              v-for="(item, index) in items"
              :key="item.title"
              class="mr-3"
            >
              <router-link
                :to="item.route"
                :active-class="index > 0 ? 'text-insight border-frequency dark:text-frequency dark:border-frequency hover:text-insight hover:border-frequency dark:hover:text-insight' : ''"
                :exact-active-class="index === 0 ? 'text-insight border-frequency dark:text-frequency dark:border-frequency hover:text-insight hover:border-frequency dark:hover:text-insight' : ''"
                class="inline-block pt-3 px-3 pb-1.5 border-b-3 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-200"
              >
                {{ item.title }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
  <div
    class="max-w-screen-xl mx-auto px-6 md:px-10 py-10"
  >
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, watch } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { apiClientBioKey, apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useStore } from '~/store'
import { useGetStreamAll } from './_composables/use-project-location'
import { useGetProjectProfile } from './_composables/use-project-profile'
import HeroBriefOverview from './insights-hero/hero-brief-overview/hero-brief-overview.vue'
import { useGetDashboardMetrics } from './overview/composables/use-get-dashboard-metrics'

const items = [
  {
    title: 'Overview',
    route: {
      name: ROUTE_NAMES.overview
    }
  },
  {
    title: 'Species Richness',
    route: {
      name: ROUTE_NAMES.speciesRichness
    }
  },
  {
    title: 'Activity Overview',
    route: {
      name: ROUTE_NAMES.activityOverview
    }
  },
  {
    title: 'Species Spotlight',
    route: {
      name: ROUTE_NAMES.activityPatterns
    }
  }
]

const store = useStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const selectedProject = computed(() => store.selectedProject)
const selectedProjectIdCore = computed(() => store.selectedProject?.idCore)
const { isLoading: isLoadingProjectStreams, data: streams } = useGetStreamAll(apiClientCore, selectedProjectIdCore)

const getUniqArray = (array: string[]): string[] => {
  return array.flat().filter((value, index, self) => self.findIndex(name => name === value) === index).filter(n => n !== null)
}

const projectFlag = computed(() => {
  if (isLoadingProjectStreams.value || streams.value == null) {
    return ''
  }
  const codes = streams.value.map(stream => stream.country_code)
  const uniqCodes = getUniqArray(codes)
  return uniqCodes.length > 1 ? '' : codes[0] as string
})

const projectCountry = computed(() => {
  if (isLoadingProjectStreams.value || streams.value == null) {
    return ''
  }
  const countries = streams.value.map(stream => stream.country_name)
  return getUniqArray(countries).join(', ')
})

const { data: profile } = useGetProjectProfile(apiClientBio, 1)

const selectedProjectId = computed(() => store.selectedProject?.id)
const { isLoading, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'no data'
  else return dayjs(date).format('MMM YYYY')
}

watch(() => profile.value, () => {
  if (!profile.value) return
  dashboardStore.updateProjectSummary(profile.value.summary)
  dashboardStore.updateProjectReadme(profile.value.readme)
})

</script>
