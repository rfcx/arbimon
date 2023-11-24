<template>
  <landing-navbar />
  <section class="pt-16 bg-white dark:bg-echo">
    <div class="py-8 mx-auto max-w-screen-xl <lg:mx-8 lg:py-24">
      <div class="mt-6 flex flex-row">
        <h2 class="text-gray-900 dark:text-insight">
          My Projects
        </h2>
        <router-link
          :to="{ name: ROUTE_NAMES.createProject }"
          class=" flex-row ml-6"
        >
          <a class="btn btn-primary">
            Create a new project +
          </a>
        </router-link>
      </div>
      <div
        class="grid grid-cols-2 gap-4 py-8 lg:gap-6 lg:py-16 lg:grid-cols-3"
      >
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

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

const store = useStore()

const myProjects = computed(() => store.projects.filter(p => p.isMyProject))
// const myProjectsInfo = computed(() => store.myProjects)
</script>
