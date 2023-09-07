<template>
  <project-navbar />
  <section class="pt-16 bg-white dark:bg-echo">
    <div class="py-8 mx-auto max-w-screen-md <lg:mx-8 lg:py-24">
      <h2 class="text-gray-900 dark:text-insight">
        My Projects
      </h2>
      <div
        class="grid grid-cols-2 gap-4 py-8 lg:gap-6 lg:py-16 lg:grid-cols-3"
      >
        <router-link
          :to="{ name: ROUTE_NAMES.createProject }"
          class="flex flex-col place-content-center p-6 bg-insight border border-dashed rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-02 dark:hover:bg-util-gray-02"
        >
          <icon-fa-plus class="my-1 mx-auto text-lg text-gray-700 dark:text-insight" />
          <div class="text-center text-xl tracking-tight font-medium text-gray-700 dark:text-insight">
            Create a new project
          </div>
        </router-link>
        <ProjectCard
          v-for="project in myProjects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import ProjectNavbar from '@/_layout/components/project-navbar/project-navbar.vue'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

const store = useStore()

const myProjects = computed(() => store.projects.filter(p => p.isMyProject))
</script>
