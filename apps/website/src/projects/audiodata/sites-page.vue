<template>
  <section class="py-10 bg-white dark:bg-pitch pl-18">
    <div class="flex items-center">
      <h1 class="text-gray-900 dark:text-insight ml-8">
        Sites
      </h1>
      <button
        class="btn btn-primary btn-medium group ml-2"
        @click="createSite()"
      >
        <span>Create</span>
      </button>
      <button
        class="btn btn-secondary btn-medium group ml-2"
        @click="importSite()"
      >
        <span>Bulk Import Sites</span>
      </button>
    </div>
    <div class="grid grid-cols-12 gap-4 mt-8 mx-8">
      <div class="col-span-12 md:col-span-8 w-full overflow-x-auto">
        <div>
          <button
            class="btn btn-secondary btn-medium group"
            @click="editSite()"
          >
            <span>Edit Site</span>
          </button>
          <button class="btn btn-secondary btn-medium group ml-2">
            <span>Delete</span>
          </button>
          <button
            class="btn btn-secondary btn-medium group ml-2"
            @click="exportSites()"
          >
            <span>Export Sites</span>
          </button>
        </div>
        <div
          v-show="!isLoadingSiteCount"
          class="mt-4"
        >
          <span class="text-left reclist-total">
            {{ sitesCount() }} {{ sitesCount() > 1 ? "sites" : "site" }}
          </span>
        </div>
      </div>
      <div>
        MAP
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

import { type SiteParams } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useSites } from './api/use-sites'

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

// API
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const siteParams = computed<SiteParams>(() => {
  return {
    count: true,
    deployment: true,
    logs: true
  }
})
const { isLoading: isLoadingSiteCount, data: sites } = useSites(apiClientArbimon, selectedProjectSlug, siteParams)

// Show on UI
const sitesCount = () => {
  return sites.value?.length ?? 0
}

// function
// const deleteSelectedSite = () => { console.info('deleteSelectedSite') }
// const deleteAllEmptySites = () => { console.info('DeleteAllEmptySites') }
const exportSites = () => { console.info('exportSites') }
const editSite = () => { console.info('editSite') }
const importSite = () => { console.info('importSite') }
const createSite = () => { console.info('createSite') }
</script>
