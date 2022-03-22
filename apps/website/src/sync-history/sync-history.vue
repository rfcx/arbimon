<template>
  <page-title
    page-title="Sync History"
    page-subtitle="TODO: Subtitle"
  />
  <div class="lists-updated mt-5">
    <ul
      v-for="update of allUpdate"
      :key="update.id"
      class="mb-4"
    >
      <li>{{ formatFullDate(update.updatedAt) }}</li>
      <li>Species: +{{ update.summaryObject.species }}</li>
      <li>Sites: +{{ update.summaryObject.sites }}</li>
    </ul>
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
