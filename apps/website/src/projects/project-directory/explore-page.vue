<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      :data="projects.sort((a, b) => a ? -1 : 1)"
      class="absolute z-40 h-100vh"
      @emit-selected-project="onEmitSelectedProject"
    />
    <project-info
      v-if="selectedProject != null"
      class="absolute z-40 h-50vh my-auto"
      :project="selectedProject"
    />
    <map-view
      :data="mapData"
      class="relative left-0 fixed z-30 w-full"
      :selected-project-id="selectedProject?.id"
      @emit-selected-project="onEmitSelectedProject"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import type { MapProjectData } from '~/maps/types'
import { useStore } from '~/store'
import MapView from './blocks/map-view.vue'
import ProjectInfo from './blocks/project-info.vue'
import ProjectList from './blocks/projects-list.vue'
import { avgCoordinate, rawDirectoryProjectsData } from './data/rawDirectoryProjectsData'
import { type ProjectProfileWithMetrics } from './data/types'

const selectedProject = ref<ProjectProfileWithMetrics | null>(null)

const store = useStore()
const projects = computed(() => {
  const realProjects = store.projects
  const mockProjects = rawDirectoryProjectsData
  const realWithProfileMetrics: ProjectProfileWithMetrics[] = realProjects.map(project => {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      avgLatitude: avgCoordinate(project.latitudeNorth, project.latitudeSouth),
      avgLongitude: avgCoordinate(project.longitudeEast, project.longitudeWest),
      summary: 'Real project summary',
      objectives: ['bio-baseline'],
      noOfSpecies: 0,
      noOfRecordings: 0,
      countries: [],
      isHighlighted: true,
      isMock: false
     }
  })
  const mockWithoutDuplicateProjectIds = mockProjects.filter(mockProject => !realProjects.find(realProject => realProject.id === mockProject.id))
  return [...realWithProfileMetrics, ...mockWithoutDuplicateProjectIds].sort((a) => a.isHighlighted ? 1 : -1)
})

const mapData = computed((): MapProjectData[] => {
  return projects.value.map(project => {
    return {
      projectId: project.id,
      projectSlug: project.slug,
      projectName: project.name,
      latitude: project.avgLatitude,
      longitude: project.avgLongitude
    }
  })
})

const onEmitSelectedProject = (locationProjectId: number) => {
  selectedProject.value = projects.value.find(project => project.id === locationProjectId) ?? null
}

</script>
