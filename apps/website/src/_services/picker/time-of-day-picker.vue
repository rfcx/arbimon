<template>
  <el-row class="mb-4 flex flex-row items-center">
    <el-button
      v-for="{ key, label, value } in timeRanges"
      :key="'time-' + key"
      class="btn text-sm"
      round
      @click="onTimeClick(value)"
    >
      {{ label }}
    </el-button>
  </el-row>
</template>

<script setup lang="ts">
const timeRanges = [
  { key: 'all', label: 'All', value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] },
  { key: 'diurnal', label: 'Diurnal', value: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { key: 'nocturnal', label: 'Nocturnal', value: [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] }
]

const emit = defineEmits<{(e: 'emitSelectTime', value: number[]): void}>()

const onTimeClick = (value: number[]) => { emit('emitSelectTime', value) }
</script>
