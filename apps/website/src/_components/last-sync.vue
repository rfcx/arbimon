<template>
  <p class="text-center opacity-50">
    Last generated/synced at: {{ latestUpdateDate }}
  </p>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue'

import useDateFormat from '../_services/hooks/useDateformat'

const props = withDefaults(defineProps<{syncUpdated: Date | string}>(), {
  syncUpdated: () => 'December 28, 2021 03:00PM (UTC)'
})

const { formateDate } = useDateFormat()
const latestUpdateDate = computed(() => formateDate(props.syncUpdated))
</script>
