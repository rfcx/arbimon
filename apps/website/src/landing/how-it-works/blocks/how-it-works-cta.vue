<template>
  <section class="bg-gray-800 dark:bg-pitch">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6 flex flex-row items-center">
      <div class="basis-2/3">
        <h3 class="mb-2 tracking-tight text-gray-700 dark:text-insight">
          Need assistance with part of the process?
        </h3>
        <p class="font-light text-gray-500 dark:text-insight">
          Find out how our team of scientists can support your next project
        </p>
      </div>
      <div class="basis-1/3 text-right">
        <router-link
          :to="{ name: ROUTE_NAMES.landingContact }"
          class="btn btn-primary"
        >
          Contact us
        </router-link>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
</script>
