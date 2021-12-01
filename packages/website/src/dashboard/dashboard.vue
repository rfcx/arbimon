<template>
  <div v-if="store.selectedProject">
    <p class="text-center opacity-50">
      <!-- TODO: Update after have api -->
      Last generated/synced at: November 18, 2021 16:03
    </p>
    <div class="grid gap-4 grid-cols-8">
      <!-- Left content -->
      <div class="col-span-6 mt-5">
        <dashboard-metrics
          v-if="metrics"
          :metrics="metrics"
        />
        <div class="grid gap-2 mt-5 lg:grid-cols-2">
          <dashboard-sitemap />
          <dashboard-line-chart />
        </div>
        <page-title
          class="mt-5"
          :page-title="store.selectedProject.name"
          :page-subtitle="projectDescription"
        />
        <dashboard-project-profile
          v-if="projectReadme"
          :information="projectReadme"
          class="mt-5"
        />
      </div>
      <!-- Right content -->
      <div class="col-span-2 mt-5">
        <dashboard-top-taxons
          v-if="richness"
          :total-species="metrics?.speciesCount"
          :richness="richness"
        />
        <dashboard-highlighted-species :species="highlighted" />
        <dashboard-endangered-species :species="endangered" />
      </div>
    </div>
  </div>
</template>
<script src="./dashboard.ts" lang="ts"></script>
