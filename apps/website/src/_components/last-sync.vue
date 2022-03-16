<template>
  <p class="text-xs text-left py-2 mt-5 border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50">
    {{ displayLastSynced }}
  </p>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'

const props = defineProps<{syncUpdated: Date | string | null}>()

const { formatFullDate } = useDateFormat()

const displayLastSynced = computed(() => {
  return props.syncUpdated === null
    ? 'This project has been queued for detection data synchronization'
    : `Last generated based on validated analysis data from Arbimon at: ${formatFullDate(props.syncUpdated)}`
})

</script>
