<template>
  <div v-if="store.selectedProject">
    <!-- TODO: Update after have api -->
    <p class="text-center opacity-50">
      Last generated/synced at: November 18, 2021 16:03
    </p>
    <dashboard-metrics
      v-if="metrics"
      class="mt-5"
      :metrics="metrics"
    />
    <dashboard-sitemap class="mt-5" />
    <page-title
      class="mt-5"
      :page-title="store.selectedProject.name"
      :page-subtitle="profile?.description"
    />
    <dashboard-project-profile
      v-if="profile"
      :information="profile?.information"
      class="mt-5"
    />
  </div>
</template>
<script src="./dashboard.ts" lang="ts"></script>
