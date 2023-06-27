<template>
  <section class="bg-white dark:bg-echo">
    <div class="w-full h-64 lg:h-84 bg-hero-featured-works bg-cover bg-no-repeat bg-right border-b border-b-frequency">
      <div class="max-w-screen-md p-8 md:p-20">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-frequency">
          Featured Work
        </h2>
        <p class="text-gray-500 dark:text-insight">
          See how Arbimon have been applied in real-world scenarios to advance wildlife conservation and research efforts around the globe.
        </p>
      </div>
    </div>
    <div class="max-w-screen-2xl py-8 px-2 lg:pt-24 lg:px-20 flex flex-col md:flex-row">
      <aside class="basis-1/4 sticky h-screen top-4">
        <ul>
          <li
            v-for="item in projects"
            :key="item.id"
            class="p-2"
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
import { useRoute } from 'vue-router'

import Card from './components/featured-card.vue'
import { projects } from './data'

const currenRoute = useRoute()

</script>
