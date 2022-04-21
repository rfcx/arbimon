<template>
  <div class="page-container">
    <!-- ================= dynamic navbar ============== -->
    <!-- URGENT 44 - Move navbar to App.vue -->
    <navbar-component />
    <!-- ================== page content =============== -->
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" />
      <div
        v-else-if="store.selectedProject"
        class="page_content"
      >
        <router-view />
        <div class="mt-5 py-2 grid sm:grid-cols-2 text-xs text-subtle border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50">
          <last-sync
            class="text-center sm:text-left"
            :sync-updated="lastUpdatedAt"
            :project-slug="store.selectedProject?.slug"
          />
          <app-version class="text-center mt-2 sm:(mt-0 text-right)" />
        </div>
      </div>
      <invalid-project-component v-else />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { useStore } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import NavbarComponent from '../components/navbar/nav-bar.vue'

const store = useStore()
const { isLoading, isError, data } = store.projectData
const lastUpdatedAt = computed(() => data?.value?.updatedList[0]?.updatedAt ?? null)

</script>
