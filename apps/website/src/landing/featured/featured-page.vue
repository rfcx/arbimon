<template>
  <section class="bg-white dark:bg-mirage-gray">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Featured Work
        </h2>
        <p class="text-gray-500 sm:text-xl dark:text-gray-400">
          See how Arbimon have been applied in real-world scenarios to advance wildlife conservation and research efforts around the globe.
        </p>
      </div>
      <div class="grid grid-cols-3 grid-flow-row gap-5">
        <router-link
          class="row-span-2"
          :to="{ name: ROUTE_NAMES.landingFeaturedDetail, params: { slug: 'reforestation' } }"
        >
          <card
            title="Reforestation"
            subtitle="National Park of Malaysia"
            background-image="https://images.unsplash.com/photo-1574068468668-a05a11f871da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80"
          />
        </router-link>
        <div class="col-span-2">
          <card
            class="h-86"
            title="Establish Biodiversity Baseline"
            subtitle="Charles Darwin Foundation"
            background-image="https://images.unsplash.com/photo-1542202229-7d93c33f5d07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
          />
        </div>
        <div class="col-span-2">
          <card
            class="h-86"
            title="Endangered Species Monitoring"
            subtitle="WWF"
            background-image="https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
          />
        </div>
        <div class="col-span-2">
          <card
            class="h-72"
            title="Wildlife Corridor Development"
            subtitle="WeForest"
            background-image="https://images.unsplash.com/photo-1567178395999-eaeb304311b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"
          />
        </div>
        <div class="row-span-2">
          <card
            title="Verification Standard"
            subtitle="XYZ Corporation"
            background-image="https://images.unsplash.com/photo-1522598312049-70ccda16fe43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
          />
        </div>
        <div class="col-span-2">
          <card
            class="h-72"
            title="Climate Change Impact"
            subtitle="Brazil National Park"
            background-image="https://images.unsplash.com/photo-1533004597346-abf021591221?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1828&q=80"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { ROUTE_NAMES } from '~/router'
import Card from './components/featured-card.vue'
</script>
