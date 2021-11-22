<template>
  <div v-if="store.selectedProject">
    <page-title
      :page-title="store.selectedProject.name"
      page-subtitle=""
    />

    <div class="mt-5 grid gap-10 md:grid-cols-5 lg:grid-cols-3">
      <div class="md:col-span-3 lg:col-span-2">
        <project-info />
      </div>
      <div class="md:col-span-2 lg:col-span-1 grid text-center">
        <overview-sitemap class="h-96" />
      </div>
    </div>
  </div>
</template>
<script src="./overview.ts" lang="ts"></script>
