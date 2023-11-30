<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      :data="mockProjects"
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
const mockMapData: MapSiteDataLight[] = mockProjects.map(project => ({
  siteName: project.name,
  latitude: project.latitudeNorth + project.latitudeSouth / 2,
  longitude: project.longitudeWest + project.longitudeEast / 2
}))
</script>
