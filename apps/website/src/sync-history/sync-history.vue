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
      <!-- Last sync -->
      <ul v-if="syncs[0].createdAt !== syncs[0].updatedAt">
        <li>{{ formatDateFull(syncs[0].updatedAt) }}</li>
        <li class="mt-2 ml-4">
          no new changes
        </li>
      </ul>

      <!-- Previous syncs -->
      <div
        v-for="sync of syncs"
        :key="sync.id"
        class="updated-list mb-4"
      >
        <ul>
          <li>
            {{ formatDateFull(sync.createdAt) }}
          </li>
          <li class="mt-2 ml-4">
            <ul class="list-inside list-circle text-sm">
              <li
                v-for="entry in Object.entries(sync.summaryObject)"
                :key="entry[0]"
              >
                +{{ entry[1] }} {{ entry[0] }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useSyncHistory } from '@/sync-history/use-sync-history'
import useDateFormat from '../_services/hooks/use-date-format'

// Data
const { isLoading, isError, data } = useSyncHistory()
const syncs = computed(() => data?.value?.syncs?.map(({ summaryText, ...list }) => ({ ...list, summaryObject: (JSON.parse(summaryText) as Record<string, number>) })) ?? [])

// Formatters
const { formatDateFull } = useDateFormat()
</script>

<style lang="scss"></style>
