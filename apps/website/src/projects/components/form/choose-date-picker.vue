<template>
  <el-date-picker
    v-model="dateValue"
    class="w-full border text-fog border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
    type="date"
    :disabled="isDisabled"
    placeholder="Choose date"
    format="MM/DD/YYYY"
    :disabled-date="disabledDate"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

const dateValue = ref<Date>()
const emit = defineEmits<{(e: 'emitSelectDate', value: string | null): void}>()

const props = defineProps<{
  initialDate?: Date,
  dateMin?: Date,
  dateMax?: Date,
  isDisabled?: boolean
}>()

const disabledDate = (time: Date) => {
  if (props.dateMin !== undefined) {
    return time.getTime() < props.dateMin.getTime()
  }
  if (props.dateMax !== undefined) {
    return time.getTime() > props.dateMax.getTime()
  }
  return time.getTime() > Date.now()
}

watch(() => props.initialDate, (newValue) => {
  dateValue.value = newValue ? dayjs(newValue).startOf('day').toDate() : undefined
})

watch(() => dateValue.value, (newValue) => {
  if (newValue === null || newValue === undefined) {
    emit('emitSelectDate', null)
  } else {
    const dateLocalIso = dayjs(newValue).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    emit('emitSelectDate', dateLocalIso)
  }
})

</script>
