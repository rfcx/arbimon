<template>
  <div class="page-container">
    <navbar-component />
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <div v-if="projectData.isLoading" />
      <div
        v-else-if="store.selectedProject"
        class="page_content"
      >
        <router-view />
        <div class="mt-5 py-2 grid sm:grid-cols-2 text-xs text-subtle border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50">
          <last-sync
            v-if="lastUpdatedAt.isData"
            class="text-center sm:text-left"
            :sync-updated="lastUpdatedAt.data"
            :project-slug="store.selectedProject?.slug"
          />
          <app-version class="text-center mt-2 sm:(mt-0 text-right)" />
        </div>
      </div>
      <invalid-project-component v-else />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useProjectData } from '~/api/project-service/use-project-data'
import { mapLoadable } from '~/loadable/map-loadable'
import { useStore } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import NavbarComponent from '../components/navbar/nav-bar.vue'

const store = useStore()
const projectData = useProjectData()

// TODO: Enable stricter TS type-checking for array indexing (& remove explicit return type)
const lastUpdatedAt = mapLoadable(projectData, (data): Date | null => data.updatedList[0]?.updatedAt ?? null)
</script>
