import useDateFormat from '~/hooks/use-date-format';
<template>
  <page-title
    page-title="Sync History"
    page-subtitle="TODO: Subtitle"
  />
  <div class="mt-5">
    <ul
      v-for="update of allUpdate"
      :key="update.id"
    >
      <li>{{ formatDate(update.updatedAt) }}</li>
      <li>{{ JSON.parse(update.summaryText) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'
import { useStore } from '../_services/store'

const store = useStore()
const { formatDate } = useDateFormat()

const allUpdate = computed(() => store.projectFilters?.updatedList)

</script>

<style lang="scss"></style>
