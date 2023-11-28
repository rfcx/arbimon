<template>
  <div
    id="drawer-navigation"
    class="overflow-y-auto fixed top-16 left-0 w-98 h-screen overflow-y-auto transition-transform -translate-x-full bg-moss"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div class="h-full overflow-y">
      <p class="p-6 border-b border-frequency text-frequency">
        All projects
      </p>
      <ul>
        <project-list-item
          v-for="p in mockProjects"
          :key="p.id"
          :project="p"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectListItem from '../components/project-list-item.vue'
import { rawDirectoryProjectsData } from '../data/rawDirectoryProjectsData'

const mockProjects = rawDirectoryProjectsData

</script>
