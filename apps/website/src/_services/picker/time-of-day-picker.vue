<template>
  <el-radio-group
    v-model="selectedHours"
    @change="onHoursChange"
  >
    <el-radio-button
      v-for="[key, { label }] in Object.entries(hours)"
      :key="'time-' + key"
      :label="key"
    >
      {{ label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hours = {
  all: { label: 'All', value: null },
  diurnal: { label: 'Diurnal', value: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
  nocturnal: { label: 'Nocturnal', value: [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] }
}

const emit = defineEmits<{(e: 'emitSelectTime', value: number[] | null): void}>()

const selectedHours = ref('all')

const onHoursChange = (key: string | number | boolean) => {
  if (typeof key !== 'string' || !(key in hours)) return
  emit('emitSelectTime', hours[key as keyof typeof hours].value)
}
</script>
