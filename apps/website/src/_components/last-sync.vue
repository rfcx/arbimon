<template>
  <p class="text-center opacity-50">
    Last generated based on validated analysis data from Arbimon at: {{ latestUpdateDate }}
  </p>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue'

import useDateFormat from '../_services/hooks/useDateFormat'

const props = withDefaults(defineProps<{syncUpdated: Date | string}>(), {
  syncUpdated: () => 'December 28, 2021 03:00PM (UTC)'
})

const { formatFullDate } = useDateFormat()
const latestUpdateDate = computed(() => formatFullDate(props.syncUpdated))
</script>
