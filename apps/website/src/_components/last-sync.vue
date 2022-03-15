<template>
  <p class="text-left py-2 mt-4 border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50">
    Last generated based on validated analysis data from Arbimon at: {{ latestUpdateDate }}
  </p>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

import useDateFormat from '../_services/hooks/useDateFormat'

const props = defineProps<{syncUpdated: Date | string}>()

const { formatFullDate } = useDateFormat()
const latestUpdateDate = computed(() => formatFullDate(props.syncUpdated))
</script>
