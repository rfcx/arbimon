<template>
  <div
    class="px-4 bg-gray-50 dark:bg-pitch"
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
          :profile="profile"
        />
        <hero-brief-overview
          :default-text="dashboardStore.projectSummary ?? ''"
        />
        <div
          v-if="isProjectMember && !isViewingAsGuest"
          class="flex gap-4 py-4 md:justify-between order-first"
        >
          <router-link
            :to="{ name: ROUTE_NAMES.projectSettings }"
            class="flex flex-row items-center justify-start order-last md:order-first"
          >
            <button
              class="btn btn-secondary group disabled:cursor-not-allowed"
              :disabled="projectUserPermissionsStore.isGuest"
            >
              <span>Edit</span> <span class="hidden lg:inline-flex">project settings</span> <icon-custom-ic-edit class="inline-flex ml-2 group-hover:stroke-pitch" />
            </button>
          </router-link>
          <div class="justify-self-end flex flex-row gap-x-4 items-center">
            <span
              v-show="!isGetInsightsPublishStatusLoading"
              class="text-insight text-sm font-medium font-display leading-none"
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
                class="btn btn-secondary disabled:cursor-not-allowed"
                :disabled="projectUserPermissionsStore.isGuest"
                @click="hideInsight"
              >
                Hide Insight
              </button>
            </template>
            <template v-else>
              <button
                class="btn btn-primary disabled:cursor-not-allowed"
                :disabled="projectUserPermissionsStore.currentUserRoleOfCurrentProject === 'Guest'"
                @click="shareInsight"
              >
                Share Insight <span class="hidden lg:inline-flex">on Arbimon</span>
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
      v-model="startShareInsightsNavigation"
      @emit-share-insights-successful="refetchInsightsPublishStatus"
      @emit-hide-insights-successful="refetchInsightsPublishStatus"
    />
    <insight-not-ready-card
      v-show="false"
      v-if="!metrics?.totalDetections && !isLoading"
    />
  </div>
  <nav
    class="sticky top-0 px-4 bg-gray-50 dark:bg-pitch border-b-1 border-fog z-40"
    :class="{
      'pl-18': isProjectMember,
      'md:px-10': !isProjectMember,
      'default-scroll-start': route.name !== items[0].route.name
    }"
  >
    <div class="max-w-screen-xl mx-auto">
      <div class="text-center text-gray-500 dark:text-insight">
        <ul class="flex flex-wrap -mb-px">
          <li
            v-for="(item, index) in items"
            :key="item.title"
            class="mr-3"
          >
            <router-link
              :to="getRouterLink(item.route.name)"
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
  <footer-bar v-if="!isProjectMember || isViewingAsGuest" />
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FooterBar from '@/_layout/components/landing-footer.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useProjectUserPermissionsStore, useStore } from '~/store'
import { useGetProjectSettings } from '../projects/_composables/use-project-profile'
import { useGetInsightsPublishStatus } from './_composables/use-get-insights-publish-status'
import { useGetProjectLocation } from './_composables/use-project-location'
import InsightNotReadyCard from './components/insight-not-ready-card.vue'
import ProjectNav from './components/project-nav.vue'
import ShareInsight from './components/share-insights/share-insights.vue'
import type { InsightsPublishStatus } from './components/share-insights/types'
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
const projectUserPermissionsStore = useProjectUserPermissionsStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
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

const getRouterLink = (routeName: string): {name: string, query?: Record<string, number>} => {
  const r = { name: routeName }
  return isViewingAsGuest.value ? { ...r, query: { guest: 1 } } : r
}

watch(() => profile.value, () => {
  if (!profile.value) return
  dashboardStore.updateProjectSummary(profile.value.summary)
})

// Insights publish status
const { isLoading: isGetInsightsPublishStatusLoading, data: insightsPublishStatus, refetch: insightsPublishStatusRefetch } = useGetInsightsPublishStatus(apiClientBio, selectedProjectId)

const refetchInsightsPublishStatus = async (): Promise<void> => {
  await insightsPublishStatusRefetch()
}

const startShareInsightsNavigation = ref<InsightsPublishStatus>('idle')

const shareInsight = (): void => {
  startShareInsightsNavigation.value = 'share-insights-information'
}

const hideInsight = (): void => {
  startShareInsightsNavigation.value = 'hide-insights-confirmation'
}

</script>
