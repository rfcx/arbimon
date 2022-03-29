<template>
  <page-title
    page-title="Sync History"
  />
  <div class="lists-updated mt-5">
    <div
      v-for="update of allUpdate"
      :key="update.id"
      class="updated-list mb-4"
    >
      <ul v-if="update.createdAt !== update.updatedAt">
        <li>{{ formatFullDate(update.updatedAt) }}</li>
        <li class="mt-2 ml-4">
          no new changes
        </li>
      </ul>
      <ul v-else>
        <li class="">
          {{ formatFullDate(update.createdAt) }}
        </li>
        <li class="mt-2 ml-4">
          <ul class="list-inside list-circle text-sm">
            <li>+{{ update.summaryObject.sites }} sites</li>
            <li>+{{ update.summaryObject.species }} species</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'
import { useStore } from '../_services/store'

type DataSourceSummary = Record<'species' | 'sites', number>

const store = useStore()
const { formatFullDate } = useDateFormat()

const allUpdate = computed(() => store.projectFilters?.updatedList.map(({ summaryText, ...list }) => ({ ...list, summaryObject: (JSON.parse(summaryText) as DataSourceSummary) })))
</script>

<style lang="scss"></style>
