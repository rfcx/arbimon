<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      :data="mockProjects.sort((a, b) => a ? -1 : 1)"
      class="absolute z-40 h-100vh"
    />
    <project-info
      v-if="selectedProject != null"
      class="absolute z-40 h-50vh my-auto"
      :project="selectedProject"
    />
    <map-view
      :data="mockMapData"
      class="relative left-0 fixed z-30 w-full"
      @emit-selected-project="onEmitSelectedProject"
    />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import type { MapProjectData } from '~/maps/types'
import MapView from './blocks/map-view.vue'
import ProjectInfo from './blocks/project-info.vue'
import ProjectList from './blocks/projects-list.vue'
import { rawDirectoryProjectsData } from './data/rawDirectoryProjectsData'
import { type ProjectProfileWithMetrics } from './data/types'

const selectedProject = ref<ProjectProfileWithMetrics | null>(null)

const mockProjects = rawDirectoryProjectsData
const mockMapData: MapProjectData[] = mockProjects.map(project => {
  const avgCoordinate = (x: number, y: number) => {
    if (x === y) return x
    return (x + y) / 2
  }
  return {
    projectId: project.id,
    projectSlug: project.slug,
    projectName: project.name,
    latitude: avgCoordinate(project.latitudeNorth, project.latitudeSouth),
    longitude: avgCoordinate(project.longitudeEast, project.longitudeWest)
  }
})

const onEmitSelectedProject = (locationProjectId: number) => {
  selectedProject.value = mockProjects.find(project => project.id === locationProjectId) ?? null
}

</script>
