<template>
  <nav
    class="bg-gray-50 dark:bg-steel-gray-light"
  >
    <div class="max-w-screen-xl mx-auto text-gray-900 dark:text-white">
      <h1 class="text-2xl py-12 font-bold">
        Puerto Rico Island Wide
      </h1>
    </div>
  </nav>
  <nav class="sticky top-0 bg-gray-50 dark:bg-steel-gray-light">
    <div class="max-w-screen-xl mx-auto">
      <div class="text-sm font-medium text-center text-gray-500 dark:text-gray-300">
        <ul class="flex flex-wrap -mb-px">
          <li
            v-for="item in items"
            :key="item.title"
            class="mr-2"
          >
            <router-link
              :to="item.route"
              exact-active-class="text-primary border-primary dark:text-primary dark:border-primary hover:text-primary hover:border-primary dark:hover:text-primary"
              class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-200"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div class="max-w-screen-xl mx-auto my-8">
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'

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
</script>
