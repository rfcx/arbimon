<template>
  <section class="bg-gray-800 dark:bg-pitch">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6 flex flex-row items-center">
      <div class="basis-2/3">
        <h2 class="mb-2 text-gray-700 dark:text-insight">
          Ready to level up your research?
        </h2>
      </div>
      <div class="basis-1/3 text-right">
        <router-link
          :to="{ name: ROUTE_NAMES.myProjects }"
          class="btn btn-primary"
        >
          Get started
        </router-link>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
</script>
