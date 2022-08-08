<template>
  <page-title page-title="Sync History" />

  <div class="mt-5">
    <!-- STATE: Loading -->
    <div
      v-if="isLoading"
      class="flex"
    >
      <icon-fas-spinner class="animate-spin inline mr-1" /> Loading...
    </div>

    <!-- STATE: Error -->
    <div v-else-if="isError">
      Error: Failed to retrieve list of synchronizations
    </div>

    <!-- STATE: No data -->
    <div v-else-if="syncs.length === 0">
      This project has not been synchronized yet - please wait
    </div>

    <!-- STATE: Data -->
    <div
      v-else
      class="lists-updated"
    >
      <div
        v-for="sync in syncs"
        :key="'sync-history-' + sync.id"
        class="updated-list mb-4"
      >
        <ul>
          <li>
            {{ formatDateFull(sync.updatedAt) }}
          </li>
          <li class="mt-2 ml-4">
            <ul class="list-inside list-circle text-sm">
              <li>
                Data type: {{ sync.dataType }}
              </li>
              <li>
                delta: {{ sync.delta }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

import { apiClientBioKey } from '@/globals'
import { useSyncHistory } from '@/sync-history/use-sync-history'
import useDateFormat from '../_services/hooks/use-date-format'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

// Data
const { isLoading, isError, data } = useSyncHistory(apiClientBio)
const syncs = computed(() => {
  return data.value?.syncs ?? []
})

// Formatters
const { formatDateFull } = useDateFormat()
</script>

<style lang="scss"></style>
