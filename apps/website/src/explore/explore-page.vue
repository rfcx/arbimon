<template>
  <section class="bg-white dark:bg-mirage-gray">
    <div
      v-if="showcaseProjects.length > 0"
      class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-4"
    >
      <ProjectCard
        v-for="project in showcaseProjects"
        :key="project.id"
        :project="project"
      />
    </div>
    <div v-else>
      None
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

const store = useStore()

const showcaseProjects = computed(() => store.projects.filter(p => p.isShowcaseProject))
</script>
