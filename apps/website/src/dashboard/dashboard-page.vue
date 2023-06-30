<template>
  <div v-if="store.selectedProject">
    <!-- <draft-banner
      current-mode="Draft"
      :sync-updated="store.projectFilters?.latestSync?.updatedAt ?? null"
      :project-slug="store.selectedProject?.slug"
    /> -->
    <div class="dashboard-wrapper">
      <div class="dashboard-metric">
        <Suspense>
          <template #default>
            <DashboardMetrics />
          </template>
          <template #fallback>
            <div class="metric_wrapper">
              <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24">
                <p class="font-bold text-4xl <sm:text-2xl">
                  &nbsp;
                </p>
                <p>&nbsp;</p>
              </div>
              <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
              <div class="loading-shimmer rounded-xl p-4 min-w-32 inline-block <sm:min-w-24" />
            </div>
          </template>
        </Suspense>
      </div>
      <Suspense>
        <template #default>
          <DashboardSpecies />
        </template>
        <template #fallback>
          <div class="dashboard-species">
            <div class="dashboard-richness">
              <dashboard-sidebar-title
                title="Species highlights"
              />
              <div class="mt-2 h-20" />
            </div>
            <div class="threatened-species">
              <dashboard-sidebar-title
                title="Threatened species"
                :route="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug } }"
                class="mt-5 sm:mt-0 lg:mt-5"
              />
              <div class="mt-2 h-20" />
            </div>
          </div>
        </template>
      </Suspense>
      <div class="dashboard-graphic">
        <div class="graphic-tabs">
          <p
            v-for="tab in tabs"
            :key="'dashboard-data-display-' + tab.value"
            class="text-lg capitalize py-2 px-4 cursor-pointer"
            :class="tab.value === selectedTab ? 'border-b-4 border-brand-primary' : 'border-b-1 border-steel-grey'"
            @click="selectedTab = tab.value"
          >
            {{ tab.label }}
          </p>
        </div>
        <div class="dashboard-graphic-content inline-grid w-full gap-2 mt-2 xl:grid-cols-2">
          <Suspense>
            <template #default>
              <DashboardMap :selected-tab="selectedTab" />
            </template>
            <template #fallback>
              <div
                class="loading-shimmer"
                :style="{ height: '360px' }"
              />
            </template>
          </Suspense>
          <Suspense>
            <template #default>
              <DashboardLineChart :selected-tab="selectedTab" />
            </template>
            <template #fallback>
              <div class="loading-shimmer h-full min-h-32" />
            </template>
          </Suspense>
        </div>
      </div>
      <div class="dashboard-content">
        <Suspense>
          <template #default>
            <DashboardContent />
          </template>
          <template #fallback>
            <div>
              <page-title
                :page-title="store?.selectedProject?.name ?? ''"
              />
              <span class="inline-block min-h-[1em] w-5/12 loading-shimmer" />
              <span class="inline-block min-h-[1em] w-9/12 loading-shimmer" />
              <span class="inline-block min-h-[1em] w-4/12 loading-shimmer" />
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue'

import PageTitle from '@/_components/page-title.vue'
import { routeNamesKey, storeKey } from '@/globals'
import type { RouteNames } from '~/router'
import type { BiodiversityStore } from '~/store'
import DashboardContent from './components/dashboard-content/dashboard-content.vue'
import DashboardLineChart from './components/dashboard-line-chart/dashboard-line-chart.vue'
import DashboardMap from './components/dashboard-map/dashboard-map.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import dashboardSidebarTitle from './components/dashboard-sidebar-title/dashboard-sidebar-title.vue'
import DashboardSpecies from './components/dashboard-species/dashboard-species.vue'
import { tabs } from './types/tabs'

const store = inject(storeKey) as BiodiversityStore
const selectedTab = ref(tabs[0].value)
const ROUTE_NAMES = inject(routeNamesKey) as RouteNames
</script>
<style lang="scss">
@import './dashboard-page.scss';
</style>
