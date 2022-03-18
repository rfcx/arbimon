<template>
  <p
    v-if="props.syncUpdated === null"
    class="text-xs text-left py-2 mt-5 border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50"
  >
    This project has been queued for detection data synchronization
  </p>
  <p
    v-else
    class="text-xs text-left py-2 mt-5 border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50"
  >
    Last generated based on validated analysis data from Arbimon at: {{ formatFullDate(props.syncUpdated) }} &#8226;
    <router-link
      :to="syncHistoryRoute"
      class="text-subtle inline hover:(underline text-white cursor-pointer)"
    >
      Sync-History
    </router-link>
  </p>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'

const props = defineProps<{syncUpdated: Date | string | null, projectSlug: string}>()

const { formatFullDate } = useDateFormat()

const syncHistoryRoute = computed(() => ({ name: 'sync_history', params: { projectSlug: props.projectSlug } }))

</script>
