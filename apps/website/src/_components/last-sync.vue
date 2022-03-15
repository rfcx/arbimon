<template>
  <p class="text-center opacity-50">
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
