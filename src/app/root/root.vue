<template>
  <div class="page-container">
    <!-- ================= dynamic navbar ============== -->
    <!-- URGENT 44 - Move navbar to App.vue -->
    <navbar-component />
    <!-- ================== page content =============== -->
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <router-view v-if="selectedProject" />
      <invalid-project-component v-else />
    </div>
  </div>
</template>
<script src="./root.ts" lang="ts"></script>
