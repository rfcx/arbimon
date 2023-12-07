<template>
  <el-date-picker
    v-model="dateValue"
    class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
    type="date"
    :disabled="isDisabled"
    placeholder="Choose date"
    format="MM/DD/YYYY"
    :disabled-date="props.dateDisabled === undefined ? disabledForStartDate : disabledForEndDate"
    @change="dateChange"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

const dateValue = ref<Date>()
const emit = defineEmits<{(e: 'emitSelectDate', value: string | null): void}>()

const props = defineProps<{
  initialDate?: Date,
  dateDisabled?: Date,
  isDisabled?: boolean
}>()

const disabledForStartDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const disabledForEndDate = (time: Date) => {
  if (props.dateDisabled === undefined) return

  let lastDate = Date.now()
  if (props.dateDisabled !== null) {
    lastDate = new Date(props.dateDisabled).getTime()
  }
  return time.getTime() < lastDate
}

watchEffect(() => {
  dateValue.value = props.initialDate ? dayjs(props.initialDate).startOf('day').toDate() : undefined
})

// Emit on change
const emitSelectDate = (date: Date): void => {
  const dateLocalIso = dayjs(date).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  emit('emitSelectDate', dateLocalIso)
}

const dateChange = () => {
  if (dateValue.value === null) {
    emit('emitSelectDate', null)
  }
}

watchEffect(() => {
  if (dateValue.value) {
    emitSelectDate(dateValue.value)
  }
})
</script>
