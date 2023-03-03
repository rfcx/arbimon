<template>
  <router-view
    v-if="store.selectedProject"
  />
  <div
    v-else
    class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8"
  >
    <invalid-project-component />
  </div>
</template>
<script src="./project-root.ts" lang="ts"></script>
