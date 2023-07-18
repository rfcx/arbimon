<template>
  <section class="bg-white dark:bg-echo">
    <div class="w-full h-64 lg:h-84 bg-hero-featured-works bg-cover bg-no-repeat bg-right border-b border-b-frequency">
      <div class="flex flex-row max-w-screen-2xl mx-auto">
        <div class="max-w-screen-md p-8 md:p-20">
          <h1 class="mb-4 text-gray-900 dark:text-frequency">
            Featured Work
          </h1>
          <p class="text-gray-500 dark:text-insight">
            See how Arbimon have been applied in real-world scenarios to advance wildlife conservation and research efforts around the globe.
          </p>
        </div>
        <div class="hidden not-sr-only">
          .
        </div>
      </div>
    </div>
    <div class="max-w-screen-2xl mx-auto py-8 px-2 lg:pt-24 lg:px-20 flex flex-col md:flex-row">
      <aside class="w-full px-8 md:px-0 md:sticky md:h-screen md:top-4 md:basis-1/4">
        <button
          data-collapse-toggle="category-menu"
          type="button"
          class="w-full items-center py-4 dark:text-insight md:hidden dark:hover:ring-moss"
          aria-controls="category-menu"
          aria-expanded="false"
        >
          <div class="flex flex-row justify-between items-start">
            <span>Jump to</span>
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-insight"
            >
              <g id="fi:chevron-down">
                <path
                  id="Vector"
                  d="M6.91992 9L12.9199 15L18.9199 9"
                  stroke="#FFFEFC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </svg>
          </div>
        </button>
        <ul
          id="category-menu"
          class="hidden mb-4 md:block"
        >
          <li
            v-for="item in projects"
            :key="item.id"
            class="py-2 px-0 md:px-2"
          >
            <router-link
              :to="'#' + item.category.id"
              :class="currenRoute.hash === '#' + item.category.id ? 'text-frequency font-bold border-b-2 border-b-frequency' : 'text-gray-500 dark:text-insight'"
            >
              {{ item.category.name }}
            </router-link>
          </li>
        </ul>
      </aside>
      <div class="md:basis-3/4 flex flex-col flex-nowrap flex-grow items-stretch gap-8 overflow-y-auto px-8 lg:pb-64">
        <card
          v-for="item in projects"
          :id="item.category.id"
          :key="item.id"
          :title="item.title"
          :subtitle="item.descriptiveText"
          :location="item.location"
          :link="'/featured/' + item.category.id"
          :background-image="item.featuredImage"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { initCollapses } from 'flowbite'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import Card from './components/featured-card.vue'
import { projects } from './data'

const currenRoute = useRoute()

onMounted(() => {
  initCollapses()
})

</script>
