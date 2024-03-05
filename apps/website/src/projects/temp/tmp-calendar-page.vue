<template>
  <div class="flex flex-col items-base gap-4 px-20 mt-20">
    <div class="mt-4">
      <span>1️⃣ New date picker: {{ format(dateStart) }} - {{ format(dateEnd) }}</span>
      <ProjectDateRangeForm
        :initial-date-start="new Date(dateStart) ?? undefined"
        :initial-date-end="new Date(dateEnd) ?? undefined"
        :is-disabled="false"
        :enable-disabled-date="true"
        @emit-select-date-range="onSelectDateRange"
      />
    </div>
    <div class="mt-4">
      <span>2️⃣ New date picker: {{ format(dateStart2) }} - {{ format(dateEnd2) }}</span>
      <ProjectDateRangeForm
        :initial-date-start="new Date(dateStart2) ?? undefined"
        :initial-date-end="new Date(dateEnd2) ?? undefined"
        :is-disabled="false"
        :enable-disabled-date="false"
        @emit-select-date-range="onSelectDateRange2"
      />
    </div>
    <div>
      <span class="py-2">3️⃣ Simple date picker: {{ format(simpleDate) }}</span>
      <el-date-picker
        v-model="simpleDate"
        class="w-full mt-4 border text-fog border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
        type="date"
        placeholder="Choose date"
        format="MM/DD/YYYY"
      />
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import type { DateRange } from '~/picker/date-range-picker-interface'
import ProjectDateRangeForm from '../components/form/project-date-range-form.vue'

const simpleDate = ref<string>('')

// one with disabled dates
const dateStart = ref<string>('')
const dateEnd = ref<string>('')

const onSelectDateRange = (value: DateRange & { onGoing: boolean }) => {
  console.info('onSelectDateRange', value)
  dateStart.value = value.dateStartLocalIso
  dateEnd.value = value.dateEndLocalIso
}

// one without disabled dates
const dateStart2 = ref<string>('')
const dateEnd2 = ref<string>('')

const onSelectDateRange2 = (value: DateRange & { onGoing: boolean }) => {
  console.info('onSelectDateRange', value)
  dateStart2.value = value.dateStartLocalIso
  dateEnd2.value = value.dateEndLocalIso
}

const format = (date: string) => {
  return date ? new Date(date).toLocaleDateString() : '⎽'
}

</script>
