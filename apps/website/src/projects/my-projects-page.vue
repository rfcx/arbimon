<template>
  <fixed-navbar />
  <section class="w-full pt-20 px-8 pb-6 bg-white dark:bg-mirage-gray">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md mb-8 lg:mb-12">
        <h2 class="text-2xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          My Projects
        </h2>
        <div
          v-if="myProjects.length > 0"
          class="grid grid-cols-2 gap-4 max-w-screen-xl py-8 mx-auto lg:gap-6 lg:py-16 lg:grid-cols-3"
        >
          <ProjectCard
            v-for="project in myProjects"
            :key="project.id"
            :project="project"
          />
        </div>
        <div v-else>
          None
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import FixedNavbar from '@/_layout/components/fixed-navbar/fixed-navbar.vue'
import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

const store = useStore()

const myProjects = computed(() => store.projects.filter(p => p.isMyProject))
</script>
