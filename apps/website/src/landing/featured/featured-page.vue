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
            v-for="item in contents"
            :key="item.id"
            class="p-2"
          >
            <router-link
              :to="'#' + item.categoryId"
              :class="currenRoute.hash === '#' + item.categoryId ? 'text-frequency font-bold border-b-2 border-b-frequency' : 'text-gray-500 dark:text-insight'"
            >
              {{ item.categoryDisplay }}
            </router-link>
          </li>
        </ul>
      </aside>
      <div class="md:basis-3/4 flex flex-col flex-nowrap flex-grow items-stretch gap-8 overflow-y-auto px-8 lg:pb-64">
        <card
          v-for="item in contents"
          :id="item.categoryId"
          :key="item.id"
          :title="item.title"
          :subtitle="item.description"
          :location="item.location"
          :link="item.link"
          :background-image="item.imageUrl"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'

import Card from './components/featured-card.vue'

const currenRoute = useRoute()

const contents = [
  {
    id: 1,
    title: 'Establishing Biodiversity Baselines',
    location: 'Gombe Stream National Park, Tanzania',
    description: 'Developing baseline biodiversity metrics in partnership with the Jane Goodall Institute',
    imageUrl: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    categoryDisplay: 'Biodiversity Baselines',
    categoryId: 'biodiversity-baselines',
    link: '#'
  },
  {
    id: 2,
    title: 'Endangered Species Protection',
    location: 'Isabela Island, Galapagos',
    description: 'Monitoring the critically endangered mangrove finch',
    imageUrl: 'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    categoryDisplay: 'Endangered Species',
    categoryId: 'endangered-species',
    link: '#'
  },
  {
    id: 3,
    title: 'Reforestation & Restoration',
    location: 'Pontal do Paranapanema, Brazil',
    description: 'Assessment of restoration sites in supporting native fauna',
    imageUrl: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80',
    categoryDisplay: 'Restoration',
    categoryId: 'restoration',
    link: '#'
  },
  {
    id: 4,
    title: 'Climate Change Impact',
    location: 'Puerto Rico island-wide',
    description: 'Assessing animal communities’ responses to climate change',
    imageUrl: 'https://images.unsplash.com/photo-1533004597346-abf021591221?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1828&q=80',
    categoryDisplay: 'Climate Change Impact',
    categoryId: 'climate-change-impact',
    link: '#'
  },
  {
    id: 5,
    title: 'Sustainable Supply Chain Monitoring',
    location: 'Borneo, Malaysia',
    description: 'Species specific and soundscape approaches to map biodiversity levels across land use categories',
    imageUrl: '',
    categoryDisplay: 'Sustainable Supply Chain',
    categoryId: 'sustainable-supply-chain',
    link: '#'
  }
]
</script>
