<template>
  <section class="bg-white dark:bg-echo">
    <div class="w-full h-64 lg:h-84 bg-hero-featured-works bg-cover bg-no-repeat bg-right border-b border-b-frequency">
      <div class="grid lg:grid-cols-12 max-w-screen-xl mx-auto px-4">
        <div class="place-self-center lg:col-span-7 py-8 lg:py-24">
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
    <div class="grid md:grid-cols-12 max-w-screen-xl mx-auto py-8 lg:(pt-20)">
      <aside class="md:col-span-4 px-4 md:sticky md:h-screen md:top-4 mb-6">
        <button
          data-collapse-toggle="category-menu"
          type="button"
          class="w-full items-center py-2 border-b-1 border-insight dark:text-insight md:hidden dark:hover:ring-moss"
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
          class="hidden mb-4 mt-4 md:(block mt-0)"
        >
          <li
            v-for="item in projects"
            :key="item.id"
            class="mb-4"
          >
            <router-link
              :to="'#' + item.category.id"
              :class="currenRoute.hash === '#' + item.category.id ? 'text-frequency font-medium border-b-2 border-b-frequency' : 'text-gray-500 dark:text-insight'"
            >
              {{ item.category.name }}
            </router-link>
          </li>
        </ul>
      </aside>
      <div class="items-stretch gap-10 overflow-y-auto flex flex-col px-4 md:(pb-64 col-span-8)">
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
