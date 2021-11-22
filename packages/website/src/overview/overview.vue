<template>
  <div v-if="store.selectedProject">
    <page-title
      :page-title="store.selectedProject.name"
      page-subtitle="Acoustic monitoring and occupancy maps for bird and anuran species across Puerto Rico: A baseline for SWAP and other agencies’ conservation and planning activities"
    />
    <overview-sitemap class="mt-5" />
    <project-info class="mt-5" />
  </div>
</template>
<script src="./overview.ts" lang="ts"></script>
