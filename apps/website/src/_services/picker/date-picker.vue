<template>
  <el-date-picker
    id="date-range-input"
    type="daterange"
  />
</template>

<script setup lang="ts">
import { Dayjs } from 'dayjs'
import { onMounted } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

// Interface
const emit = defineEmits<{(e: 'dateRangeSelected', value: [Dayjs, Dayjs]): void}>()

// Mock emit
onMounted(() => emit('dateRangeSelected', [dayjs(), dayjs()]))
</script>
