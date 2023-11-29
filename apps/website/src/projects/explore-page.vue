<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list class="absolute z-40 h-[calc(100vh_-_15rem)]" />
    <map-view class="relative left-0 fixed z-30 w-full" />
  </section>
</template>
<script setup lang="ts">
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import MapView from './project-directory/blocks/map-view.vue'
import ProjectList from './project-directory/blocks/projects-list.vue'
</script>
