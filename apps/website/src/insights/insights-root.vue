<template>
  <div
    class="px-4 bg-gray-50 dark:bg-pitch"
    :class="{
      'pl-18': store.userIsProjectMember,
      'md:px-10': !store.userIsProjectMember
    }"
  >
    <div class="max-w-screen-xl mx-auto pt-6 pb-10 text-gray-900 dark:text-insight">
      <div class="flex flex-col">
        <h1 class="text-frequency font-header pt-4 pb-4">
          {{ profile?.name ?? selectedProject?.name }}
        </h1>
        <hero-project-info
          :is-loading-profile="isLoadingProfile"
          :project-objectives="dashboardStore.projectObjectives ?? profile?.objectives ?? []"
          :profile="profile"
        />
        <hero-brief-overview
          :default-text="dashboardStore.projectSummary ?? ''"
        />
        <div
          v-if="showShareInsights"
          class="flex gap-4 py-4 md:justify-between order-first"
        >
          <router-link
            v-if="store.userIsProjectMember"
            :to="{ name: ROUTE_NAMES.projectSettings }"
            class="flex flex-row items-center justify-start order-last md:order-first"
          >
            <button class="btn btn-secondary group">
              <span>Edit</span> <span class="hidden lg:inline-flex">project settings</span> <icon-custom-ic-edit class="inline-flex ml-2 group-hover:stroke-pitch" />
            </button>
          </router-link>
          <div class="justify-self-end flex flex-row gap-x-4 items-center">
            <span
              v-show="!isLoadingProfile"
              class="text-insight text-sm font-medium font-display leading-none"
            >
              <template v-if="profile?.isPublished != null && profile?.isPublished === true">
                <icon-custom-fi-eye class="inline-flex text-frequency mr-2" /> This page is now live on Arbimon's Projects
              </template>
              <template v-else>
                <icon-custom-fi-eye-off class="inline-flex text-insight mr-2" /> This page is visible to project member only
              </template>
            </span>
            <button
              v-if="store.userIsAdminProjectMember"
              class="btn btn-primary disabled:cursor-not-allowed disabled:btn-disabled disabled:hover:btn-disabled"
              :data-tooltip-target="metrics?.totalSites === 0 || disableShareInsights ? `shareInsightsTooltipId` : null"
              data-tooltip-placement="bottom"
              :disabled="disableShareInsights"
              @click="openShareInsightsInfoPopup"
            >
              Share Insights <span class="hidden lg:inline-flex">on Arbimon</span>
            </button>
            <div
              v-if="metrics?.totalSites === 0 || disableShareInsights"
              id="shareInsightsTooltipId"
              role="tooltip"
              class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
            >
              {{ metrics?.totalSites === 0 ? enablePublicSharingText : disablePublicSharingText }}
              <div
                class="tooltip-arrow"
                data-popper-arrow
              />
            </div>
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
  </div>
  <nav
    class="sticky top-0 px-4 bg-gray-50 dark:bg-pitch border-b-1 border-fog z-40"
    :class="{
      'pl-18': store.userIsProjectMember,
      'md:px-10': !store.userIsProjectMember,
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
      'pl-18': store.userIsProjectMember,
      'md:px-10': !store.userIsProjectMember
    }"
  >
    <div
      v-if="!isErrorMetrics"
      class="max-w-screen-xl mx-auto py-10"
    >
      <router-view />
    </div>
    <div
      v-else
      class="flex items-center justify-center h-full mt-10 mx-auto py-10"
    >
      <span class="text-center">
        It seems the section didn’t load as expected. <br>
        Please refresh your browser to give it another go.
      </span>
    </div>
  </div>
  <footer-bar v-if="!store.userIsProjectMember || isViewingAsGuest" />
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FooterBar from '@/_layout/components/landing-footer.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useStore } from '~/store'
import { useGetProjectInfo } from '../projects/_composables/use-project-profile'
import ProjectNav from './components/project-nav.vue'
import ShareInsight from './components/share-insights/share-insights.vue'
import type { InsightsPublishStatus } from './components/share-insights/types'
import HeroBriefOverview from './insights-hero/hero-brief-overview.vue'
import HeroProjectInfo from './insights-hero/hero-project-info.vue'
import { useGetDashboardMetrics } from './overview/composables/use-get-dashboard-metrics'

const items = [
  {
    title: 'Highlights',
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
const apiClientBio = inject(apiClientKey) as AxiosInstance

const selectedProject = computed(() => store.project)
const selectedProjectId = computed(() => store.project?.id)
const isViewingAsGuest = computed(() => route.query.guest === '1' || store.userIsExternalGuest)

const startShareInsightsNavigation = ref<InsightsPublishStatus>('idle')

const { isLoading: isLoadingProfile, data: profile, refetch: profileRefetch } = useGetProjectInfo(apiClientBio, selectedProjectId, ['readme', 'keyResults', 'resources', 'methods', 'countryCodes'], computed(() => true))
const { isLoading: isLoadingMetrics, isError: isErrorMetrics, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)

// eslint-disable-next-line regex/invalid
const enablePublicSharingText = ref('Create a project site to enable public sharing of insights')
const disablePublicSharingText = ref('Contact your project administrator for permission to share')

const showShareInsights = computed<boolean>(() => store.userIsFullProjectMember && !isViewingAsGuest.value)

const disableShareInsights = computed<boolean>(() => {
  return isLoadingMetrics.value || isErrorMetrics.value || metrics.value?.totalSites === 0 || !store.userIsAdminProjectMember
})

watch(() => profile.value, () => {
  if (!profile.value) return
  dashboardStore.updateProjectSummary(profile.value.summary)
})

const getRouterLink = (routeName: string): {name: string, query?: Record<string, number>} => {
  const r = { name: routeName }
  return isViewingAsGuest.value ? { ...r, query: { guest: 1 } } : r
}

const refetchInsightsPublishStatus = async (): Promise<void> => {
  await profileRefetch()
}

const openShareInsightsInfoPopup = (): void => {
  if (profile.value?.isPublished != null && profile.value?.isPublished === true && store.userIsAdminProjectMember) {
    startShareInsightsNavigation.value = 'share-insights-successful'
  } else {
    startShareInsightsNavigation.value = 'share-insights-information'
  }
}

</script>
