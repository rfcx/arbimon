<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto xl:gap-16 sm:py-16 lg:px-6">
      <h2 class="text-2xl mb-4 text-center">
        Explore our featured projects
      </h2>
      <div class="grid grid-row gap-1 text-gray-500 dark:text-insight md:grid-cols-5">
        <a
          v-for="project in props.projects"
          :key="project.id"
          :href="'/featured/' + project.category.id"
          class="flex justify-center items-center w-full h-32 xl:w-64 relative"
        >
          <img
            :src="project.featuredImage"
            class="object-cover object-center w-full h-full rounded-lg"
          >
          <p class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-display">{{ project.category.name }}</p>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { type ProjectDetail } from '../../featured/data/types'

const props = defineProps<{
  readonly projects: ProjectDetail[] | []
}>()

</script>
