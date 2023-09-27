<template>
  <div
    class="bg-gray-50 dark:bg-hero-cta-frog-bg bg-cover border-b-1 border-fog"
  >
    <div class="max-w-screen-xl mx-auto px-8 md:px-10 pt-20 pb-10 text-gray-900 dark:text-insight flex flex-col md:flex-row justify-between">
      <div class="">
        <h1 class="pb-4 text-frequency font-header">
          {{ store.selectedProject?.name }}
        </h1>
        <hero-brief-overview
          :can-edit="store.selectedProject?.isMyProject ?? false"
          :default-text="dashboardStore.projectSummary ?? ''"
        />
        <div>
          Puerto Rico 🇵🇷
        </div>
      </div>
      <div class="justify-self-end order-first md:order-last">
        <span class="text-xxs text-fog">// TODO: menu</span>
      </div>
    </div>
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
import { inject, watch } from 'vue'

import { apiClientBioKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useStore } from '~/store'
import { useGetProjectProfile } from './_composables/use-project-profile'
import HeroBriefOverview from './insights-hero/hero-brief-overview/hero-brief-overview.vue'

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

const { data: profile } = useGetProjectProfile(apiClientBio, 1)

watch(() => profile.value, () => {
  if (!profile.value) return
  dashboardStore.updateProjectSummary(profile.value.summary)
  dashboardStore.updateProjectReadme(profile.value.readme)
})

</script>
