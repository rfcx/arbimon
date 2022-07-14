<template>
  <el-row class="mb-4">
    <el-button
      v-for="item in hours"
      :key="'time-' + item.label"
      :label="item.label"
      :color="item.label === selectedTime.selectedTimeType ? '#45485D' : '#232436'"
      round
      bg
      class="capitalize"
      @click="selectTimeType(item)"
    >
      {{ item.label }}
    </el-button>
  </el-row>
  <el-input
    v-model="selectedTime.selectedHourRange"
    size="large"
    placeholder="e.g. 0-5, 7-11, 14, 15"
    @focus="clearTimeInput"
    @input="selectTimeInput"
  />
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'

interface TimeLabel {
  label: string
  value: string
}

const hours: { [key: string]: TimeLabel } = {
  all: { label: 'all day', value: '0-23' },
  diurnal: { label: 'diurnal', value: '6-17' },
  nocturnal: { label: 'nocturnal', value: '0-5,18-23' },
  custom: { label: 'custom', value: '' }
}

const emit = defineEmits<{(e: 'emitSelectTime', value: string): void}>()

const selectedTime = reactive({
  selectedTimeType: hours.all.label,
  selectedHourRange: hours.all.value
})

onMounted(() => {
  emit('emitSelectTime', selectedTime.selectedHourRange)
})

const selectTimeType = (item: TimeLabel) => {
  selectedTime.selectedTimeType = item.label
  selectedTime.selectedHourRange = item.value
  emit('emitSelectTime', selectedTime.selectedHourRange)
}

const selectTimeInput = () => {
  emit('emitSelectTime', selectedTime.selectedHourRange.replaceAll(' ', ''))
}

const clearTimeInput = () => {
  selectedTime.selectedTimeType = hours.custom.label
  selectedTime.selectedHourRange = hours.custom.value
  emit('emitSelectTime', selectedTime.selectedHourRange)
}
</script>
