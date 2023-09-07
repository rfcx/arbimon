<template>
  <nav
    class="bg-gray-50 dark:bg-steel-gray-light"
  >
    <div class="max-w-screen-xl mx-auto px-2 sm:px-8 text-gray-900 dark:text-white">
      <h1 class="text-4xl pt-16 pb-1 font-bold">
        {{ store.selectedProject?.name }}
      </h1>
      <h2 class="text-lg text-light-900 pb-4">
        Project one-line summary
      </h2>
      <div class="pb-4">
        <a
          href="#citation"
          class="text-sm text-light-900 hover:underline hover:text-light-300"
        ><svg
          aria-hidden="true"
          focusable="false"
          class="h-4 mr-2 inline"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        ><path
          fill="currentColor"
          d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
        /></svg>Cite this project</a>
      </div>
    </div>
  </nav>
  <nav class="sticky top-0 z-40 bg-gray-50 dark:bg-steel-gray-light">
    <div class="max-w-screen-xl mx-auto px-2 sm:px-8">
      <div class="font-medium text-center text-gray-500 dark:text-gray-300">
        <ul class="flex flex-wrap -mb-px">
          <li
            v-for="(item, index) in items"
            :key="item.title"
            class="mr-2"
          >
            <router-link
              :to="item.route"
              :active-class="index > 0 ? 'text-primary border-primary dark:text-primary dark:border-primary hover:text-primary hover:border-primary dark:hover:text-primary' : ''"
              :exact-active-class="index === 0 ? 'text-primary border-primary dark:text-primary dark:border-primary hover:text-primary hover:border-primary dark:hover:text-primary' : ''"
              class="inline-block p-4 border-b-4 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-200"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div
    class="max-w-screen-xl mx-auto px-2 sm:px-8 py-8"
  >
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const store = useStore()

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
