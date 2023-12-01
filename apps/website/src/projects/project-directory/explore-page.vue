<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      :data="mockProjects.sort((a, b) => a ? -1 : 1)"
      class="absolute z-40 h-[calc(100vh_-_15rem)]"
    />
    <map-view
      :data="mockMapData"
      class="relative left-0 fixed z-30 w-full"
    />
  </section>
</template>
<script setup lang="ts">
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import type { MapSiteDataLight } from '~/maps/types'
import MapView from './blocks/map-view.vue'
import ProjectList from './blocks/projects-list.vue'
import { rawDirectoryProjectsData } from './data/rawDirectoryProjectsData'

const mockProjects = rawDirectoryProjectsData
const mockMapData: MapSiteDataLight[] = mockProjects.map(project => {
  const avgCoordinate = (x: number, y: number) => {
    if (x === y) return x
    return (x + y) / 2
  }
  return {
    siteName: project.name,
    latitude: avgCoordinate(project.latitudeNorth, project.latitudeSouth),
    longitude: avgCoordinate(project.longitudeEast, project.longitudeWest)
  }
})

</script>
