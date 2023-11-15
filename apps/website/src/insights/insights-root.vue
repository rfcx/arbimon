<template>
  <div
    class="bg-gray-50 dark:bg-hero-cta-frog-bg bg-cover border-b-1 border-fog"
  >
    <div
      class="px-4"
      :class="{
        'pl-18': isProjectMember,
        'md:px-10': !isProjectMember
      }"
    >
      <div class="max-w-screen-xl mx-auto pt-6 pb-10 text-gray-900 dark:text-insight">
        <div class="flex flex-col">
          <h1 class="text-frequency font-header pt-4 pb-4">
            {{ profile?.name ?? selectedProject?.name }}
          </h1>
          <hero-project-info
            :project-location="projectLocation"
            :is-loading-project-location="isLoadingProjectLocation"
            :project-objectives="dashboardStore.projectObjectives ?? profile?.objectives ?? []"
            :metrics="metrics"
          />
          <hero-brief-overview
            :can-edit="false"
            :default-text="dashboardStore.projectSummary ?? ''"
          />
          <div
            v-if="isProjectMember && !isViewingAsGuest"
            class="flex gap-4 py-4 md:justify-between order-first"
          >
            <router-link
              :to="{ name: ROUTE_NAMES.projectSettings }"
              class="flex flex-row items-center justify-start"
            >
              <button class="btn btn-secondary group">
                Edit <icon-custom-ic-edit class="inline-flex ml-2 group-hover:stroke-pitch" />
              </button>
            </router-link>
            <div class="justify-self-end flex flex-row gap-x-6 items-center">
              <span
                v-show="!isGetInsightsPublishStatusLoading"
                class="text-insight text-sm font-medium font-display leading-none mx-2"
              >
                <template v-if="insightsPublishStatus != null && insightsPublishStatus.status === true">
                  <icon-custom-fi-eye class="inline-flex text-frequency mr-2" /> This page is now live on Arbimon's Directory
                </template>
                <template v-else>
                  <icon-custom-fi-eye-off class="inline-flex text-insight mr-2" /> This page is visible to project member only
                </template>
              </span>

              <template v-if="insightsPublishStatus != null && insightsPublishStatus.status === true">
                <button
                  class="btn btn-secondary"
                  @click="hideInsight"
                >
                  Hide Insight
                </button>
              </template>
              <template v-else>
                <button
                  class="btn btn-primary"
                  @click="shareInsight"
                >
                  Share Insight on Arbimon
                </button>
              </template>
            </div>
          </div>
          <div
            v-else
            class="order-first"
          >
            <ProjectNav />
          </div>
        </div>
      </div>
      <ShareInsight
        v-model="startShareInsightNavigation"
        @emit-share-insight-successful="refetchInsightPublishStatus"
        @emit-hide-insight-successful="refetchInsightPublishStatus"
      />
      <insight-not-ready-card
        v-show="false"
        v-if="!metrics?.totalDetections && !isLoading"
      />
      <nav class="sticky top-0">
        <div class="max-w-screen-xl mx-auto">
          <div class="text-center text-gray-500 dark:text-insight">
            <ul class="flex flex-wrap -mb-px">
              <li
                v-for="(item, index) in items"
                :key="item.title"
                class="mr-3"
              >
                <router-link
                  :to="{
                    ...item.route,
                    query: {
                      guest: isViewingAsGuest ? 1 : 0
                    }
                  }"
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
  <div
    class="px-4"
    :class="{
      'pl-18': isProjectMember,
      'md:px-10': !isProjectMember
    }"
  >
    <div
      class="max-w-screen-xl mx-auto py-10"
    >
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiClientBioKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useStore } from '~/store'
import { useGetProjectSettings } from '../projects/_composables/use-project-profile'
import { useGetInsightsPublishStatus } from './_composables/use-get-insights-publish-status'
import { useGetProjectLocation } from './_composables/use-project-location'
import InsightNotReadyCard from './components/insight-not-ready-card.vue'
import ProjectNav from './components/project-nav.vue'
import ShareInsight from './components/share-insight/share-insight.vue'
import HeroBriefOverview from './insights-hero/hero-brief-overview.vue'
import HeroProjectInfo from './insights-hero/hero-project-info.vue'
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
const route = useRoute()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const selectedProject = computed(() => store.selectedProject)
const selectedProjectId = computed(() => store.selectedProject?.id)
const isProjectMember = computed(() => store.selectedProject?.isMyProject ?? false)

// Flag and country
const { isLoading: isLoadingProjectLocation, data: projectLocation } = useGetProjectLocation(apiClientBio, selectedProjectId)

// Project settings & metrics
const { data: profile } = useGetProjectSettings(apiClientBio, selectedProjectId)
const { isLoading, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)

const isViewingAsGuest = computed(() => {
  return route.query.guest === '1'
})

watch(() => profile.value, () => {
  if (!profile.value) return
  dashboardStore.updateProjectSummary(profile.value.summary)
})

// Insights publish status
const { isLoading: isGetInsightsPublishStatusLoading, data: insightsPublishStatus, refetch: insightsPublishStatusRefetch } = useGetInsightsPublishStatus(apiClientBio, selectedProjectId)

const refetchInsightPublishStatus = (): void => {
  insightsPublishStatusRefetch.value()
}

const startShareInsightNavigation = ref<'start-show' | 'start-hide' | 'idle'>('idle')

const shareInsight = (): void => {
  startShareInsightNavigation.value = 'start-show'
}

const hideInsight = (): void => {
  startShareInsightNavigation.value = 'start-hide'
}

</script>
