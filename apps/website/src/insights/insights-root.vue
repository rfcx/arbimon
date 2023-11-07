<template>
  <div
    class="bg-gray-50 dark:bg-hero-cta-frog-bg bg-cover border-b-1 border-fog"
  >
    <div class="pl-18">
      <div class="max-w-screen-xl mx-auto px-8 md:px-10 pt-20 pb-10 text-gray-900 dark:text-insight">
        <div class="flex flex-col">
          <h1 class="text-frequency font-header pt-8 pb-6">
            {{ profile?.name ?? selectedProject?.name }}
          </h1>
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
              {{ projectObjectives }}
            </div>
          </div>
          <hero-brief-overview
            :can-edit="false"
            :default-text="dashboardStore.projectSummary ?? ''"
          />
          <div
            v-if="isProjectMember"
            class="flex gap-4 lg:justify-between order-first"
          >
            <router-link
              :to="{ name: ROUTE_NAMES.projectSettings }"
              class="flex flex-row items-center justify-start mb-4"
            >
              <button class="btn btn-secondary group">
                Edit <icon-custom-ic-edit class="inline-flex ml-2 group-hover:stroke-pitch" />
              </button>
            </router-link>
            <div class="justify-self-end">
              <button class="btn text-sm font-medium">
                This page is visible to project members only
              </button>
              <button class="btn btn-primary">
                Share Insights on Arbimon
              </button>
            </div>
          </div>
        </div>
      </div>
      <insight-not-ready-card v-if="!metrics?.totalDetections && !isLoading" />
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
  </div>
  <div class="pl-18">
    <div
      class="max-w-screen-xl mx-auto px-6 md:px-10 py-10"
    >
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, watch } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { apiClientBioKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useStore } from '~/store'
import { useGetProjectSettings } from '../projects/_composables/use-project-profile'
import { objectiveTypes } from '../projects/types'
import { useGetProjectLocation } from './_composables/use-project-location'
import InsightNotReadyCard from './components/insight-not-ready-card.vue'
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
    title: 'Richness',
    route: {
      name: ROUTE_NAMES.speciesRichness
    }
  },
  {
    title: 'Activity',
    route: {
      name: ROUTE_NAMES.activityOverview
    }
  },
  {
    title: 'Spotlight',
    route: {
      name: ROUTE_NAMES.activityPatterns
    }
  }
]

const store = useStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const selectedProject = computed(() => store.selectedProject)
const selectedProjectId = computed(() => store.selectedProject?.id)
const isProjectMember = computed(() => store.selectedProject?.isMyProject ?? false)

// Flag and country
const { isLoading: isLoadingProjectLocation, data: projectLocation } = useGetProjectLocation(apiClientBio, selectedProjectId)

const projectFlag = computed(() => {
  if (projectLocation.value === undefined) return ''
  if (projectLocation.value.code === null) return ''
  return projectLocation.value.code.length > 1 ? '' : projectLocation.value.code[0]
})

const projectCountry = computed(() => {
  if (projectLocation.value === undefined) return ''
  if (projectLocation.value.country === null) return ''
  return projectLocation.value.country.join(', ')
})

// Project settings & metrics

const { data: profile } = useGetProjectSettings(apiClientBio, selectedProjectId)
const { isLoading, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)

const projectObjectives = computed(() => {
  const objectives = dashboardStore.projectObjectives ?? profile?.value?.objectives ?? []
  if (objectives.length === 0) return ''
  const objectiveDescs = objectives?.map((obj) => {
    const objectiveType = objectiveTypes.find((o) => o.slug === obj)
    return objectiveType?.description ?? obj
  })
  return objectiveDescs?.join(', ')
})

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'no data'
  else return dayjs(date).format('MMM YYYY')
}

watch(() => profile.value, () => {
  if (!profile.value) return
  dashboardStore.updateProjectSummary(profile.value.summary)
})

</script>
