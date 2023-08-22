<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-30 mx-auto xl:gap-16 lg:pb-60">
      <h2 class="text-center mb-20 spx-4 lg:px-6">
        Explore our featured projects
      </h2>
      <div class="grid grid-row gap-1 text-gray-500 dark:text-insight md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div
          v-for="project in props.projects"
          :key="project.id"
          class="flex justify-center items-center w-full h-45 relative"
        >
          <router-link
            :to="'/featured/' + project.category.id"
            class="flex justify-center items-center w-full h-full rounded-lg bg-moss border-1"
            :class="isSelctedProject(project.category.id) ? 'border-frequency' : 'border-pitch/[.6]'"
          >
            <img
              :src="project.featuredImage"
              class="object-cover object-center w-full h-full rounded-lg"
              :class="isSelctedProject(project.category.id) ? 'opacity-100' : 'opacity-50'"
            >
            <p
              class="min-w-2/3 max-w-5/6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-header rounded-full p-4 text-center break-normal"
              :class="isSelctedProject(project.category.id) ? 'text-frequency bg-pitch' : 'text-gray-500 dark:text-insight'"
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
