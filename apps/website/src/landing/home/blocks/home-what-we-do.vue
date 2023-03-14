import { ROUTE_NAMES } from '~/router';

<template>
  <section class="bg-white dark:bg-steel-gray">
    <div class="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 lg:py-24 lg:px-6">
      <div class="mt-4 md:mt-0">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          What we do
        </h2>
        <p class="mb-6 text-gray-500 md:text-lg dark:text-gray-400">
          At Arbimon, our mission is to empower scientists and conservationists with innovative AI-powered tools and data-driven insights to better understand and protect the world's biodiversity.
        </p>
        <router-link
          :to="{ name: ROUTE_NAMES.landingFeatured }"
          class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
        >
          Our Featured Work
          <svg
            class="ml-2 -mr-1 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          /></svg>
        </router-link>
      </div>
      <img
        class="w-full dark:hidden"
        src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
        alt="dashboard image"
      >
      <img
        class="w-full hidden dark:block"
        src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
        alt="dashboard image"
      >
    </div>
  </section>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
</script>
