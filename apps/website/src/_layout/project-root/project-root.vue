<template>
  <div class="page-container">
    <!-- ================= dynamic navbar ============== -->
    <!-- URGENT 44 - Move navbar to App.vue -->
    <navbar-component />
    <!-- ================== page content =============== -->
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <div
        v-if="store.selectedProject"
        class="page_content"
      >
        <router-view />
        <div class="footer">
          <last-sync

            :sync-updated="store.projectFilters?.updatedList[0]?.updatedAt ?? null"
            :project-slug="store.selectedProject?.slug"
          />
        </div>
      </div>
      <invalid-project-component v-else />
    </div>
  </div>
</template>
<script src="./project-root.ts" lang="ts"></script>
