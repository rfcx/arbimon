<template>
  <div v-if="store.selectedProject">
    <!-- TODO: Update after have api -->
    <p class="text-center opacity-50">
      Last generated/synced at: November 18, 2021 16:03
    </p>
    <overview-metrics class="mt-5" />
    <overview-sitemap class="mt-5" />
    <page-title
      class="mt-5"
      :page-title="store.selectedProject.name"
      page-subtitle="Acoustic monitoring and occupancy maps for bird and anuran species across Puerto Rico: A baseline for SWAP and other agencies’ conservation and planning activities"
    />
    <project-info class="mt-5" />
  </div>
</template>
<script src="./overview.ts" lang="ts"></script>
