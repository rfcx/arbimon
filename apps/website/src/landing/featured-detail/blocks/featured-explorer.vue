<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto xl:gap-16 sm:py-16 lg:px-6">
      <h2 class="text-2xl my-8 text-center">
        Explore our featured projects
      </h2>
      <div class="grid grid-row gap-1 text-gray-500 dark:text-insight md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div
          v-for="project in props.projects"
          :key="project.id"
          class="flex justify-center items-center w-full h-32 relative"
        >
          <router-link
            :to="'/featured/' + project.category.id"
            class="flex justify-center items-center w-full h-full rounded-lg bg-moss"
          >
            <img
              :src="project.featuredImage"
              class="object-cover object-center w-full h-full rounded-lg"
              :class="isSelctedProject(project.category.id) ? 'opacity-100' : 'opacity-50'"
            >
            <p
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-display rounded-full px-4 py-2"
              :class="isSelctedProject(project.category.id) ? 'text-frequency font-bold bg-pitch' : 'text-gray-500 dark:text-insight'"
            >
              {{ project.category.name }}
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { useRoute } from 'vue-router'

import { type ProjectDetail } from '../../featured/data/types'

const currenRoute = useRoute()

const props = defineProps<{
  readonly projects: ProjectDetail[] | []
}>()

const isSelctedProject = (slug: string) => {
  return currenRoute.params.slug === slug
}

</script>
