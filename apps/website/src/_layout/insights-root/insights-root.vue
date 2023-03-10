<template>
  <nav class="bg-steel-gray">
    <div class="sm:(relative flex justify-between) items-center">
      <div
        class="flex-col sm:(flex-1 flex flex-row items-center) <sm:(border-t-box-gray border-t-1)"
      >
        <router-link
          v-for="(item, idx) in menuItems"
          :key="'insight-menu-' + idx"
          :to="item.destination"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </nav>
  <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
    <router-view />
    <div class="mt-5 py-2 grid sm:grid-cols-2 text-xs text-subtle border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50">
      <last-sync
        class="text-center sm:text-left"
        :sync-updated="store.projectFilters?.latestSync?.updatedAt ?? null"
        :project-slug="store.selectedProject?.slug"
      />
      <app-version class="text-center mt-2 sm:(mt-0 text-right)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const route = useRoute()
const store = useStore()

const menuItems = [
    {
      label: 'Richness',
      destination: { name: ROUTE_NAMES.speciesRichness, params: { projectSlug: route.params.projectSlug } }
    },
    {
      label: 'Activity',
      destination: { name: ROUTE_NAMES.activityOverview, params: { projectSlug: route.params.projectSlug } }
    },
    {
      label: 'Spotlight',
      destination: { name: ROUTE_NAMES.activityPatterns, params: { projectSlug: route.params.projectSlug } }
    }
  ]
</script>
