<template>
  <el-row class="mb-4 flex flex-row items-center">
    <el-button
      v-for="time in timeRanges"
      :key="'time-' + time.value"
      class="btn text-sm"
      round
      @click="onTimeClick(time.value)"
    >
      {{ time.label }}
    </el-button>
  </el-row>
</template>

<script setup lang="ts">
const timeRanges = [
  { value: 'all', label: 'All', time: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] },
  { value: 'diurnal', label: 'Diurnal', time: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { value: 'nocturnal', label: 'Nocturnal', time: [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] }
]

const emit = defineEmits<{(e: 'emitSelectTime', value: number[]): void}>()

const onTimeClick = (time: string) => {
  const emitRange = timeRanges.find(item => item.value === time)
  if (emitRange) emit('emitSelectTime', emitRange?.time)
}
</script>
