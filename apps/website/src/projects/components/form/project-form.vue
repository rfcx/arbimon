<template>
  <div class="mt-6">
    <div class="flex flex-row">
      <label
        for="name"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project Name*</label>
      <icon-i-info
        tooltip-id="project-name"
        :tooltip-text="PLACEHOLDER_TEXT"
      />
    </div>
    <input
      id="name"
      v-model="name"
      name="name"
      type="text"
      :disabled="isDisabled"
      class="w-full border border-util-gray-03 rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
      placeholder="Brown bears in Eastern Finland"
      required
    >
  </div>
  <ProjectDateRangeForm
    :initial-date-start="dateStart !== null ? new Date(dateStart) : undefined"
    :initial-date-end="dateEnd !== null ? new Date(dateEnd) : undefined"
    :on-going="onGoing"
    :is-disabled="isDisabled"
    @emit-select-date-range="onSelectDateRange"
  />
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import type { ProjectDefault } from '../../types'
import IconIInfo from '../icon-i-info.vue'
import ProjectDateRangeForm from './project-date-range-form.vue'

const props = withDefaults(defineProps<{
  existingName?: string
  dateStart?: Date | null
  dateEnd?: Date | null
  isDisabled?: boolean
}>(), {
  existingName: '',
  dateStart: null,
  dateEnd: null,
  isDisabled: false
})

const emit = defineEmits<{(e: 'emitUpdateValue', value: ProjectDefault): void}>()
const PLACEHOLDER_TEXT = 'Enter a unique name for your project.'

const name = ref('')
const startDate = ref<string | null>('')
const endDate = ref<string | null>('')
const onGoing = ref<boolean>(false)

const value: ComputedRef<ProjectDefault> = computed(() => {
  return {
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value,
    onGoing: onGoing.value
  }
})

const dateLocalIso = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD') + 'T00:00:00.000Z'
}

onMounted(() => {
  if (props.existingName) {
    name.value = props.existingName
  }
  if (props.dateStart) {
    startDate.value = dateLocalIso(props.dateStart)
  }
  if (props.dateEnd) {
    endDate.value = dateLocalIso(props.dateEnd)
  }
  if (endDate.value?.length === 0 && startDate.value?.length !== 0) {
    onGoing.value = true
  }
})

watch(() => props.dateStart, (newValue, oldValue) => {
  if (!newValue || newValue?.toDateString() === oldValue?.toDateString()) return
  startDate.value = props.dateStart ? dateLocalIso(props.dateStart) : ''
  onGoing.value = !props.dateEnd
})

watch(() => props.dateEnd, (dateEndValue) => {
  if (!dateEndValue) return
  endDate.value = props.dateEnd ? dateLocalIso(props.dateEnd) : ''
})

watch(name, () => {
  emit('emitUpdateValue', value.value)
})

const onSelectDateRange = (v: { dateStartLocalIso: string, dateEndLocalIso: string, onGoing: boolean }) => {
  startDate.value = v.dateStartLocalIso
  endDate.value = v.dateEndLocalIso
  onGoing.value = v.onGoing
  emit('emitUpdateValue', value.value)
}

</script>

<style lang="scss">
[type='checkbox']:checked{
  color: #adff2c !important;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e") !important
}

.el-input.is-disabled .el-input__wrapper {
  background-color: transparent;
  opacity: 0.4;
}

.el-input__wrapper {
  border-radius: 5px;
}

.el-date-editor.el-input {
  height: var(--el-component-size-large);
  width: 100%;

  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #6B7280;
    opacity: 1; /* Firefox */
  }
  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: #6B7280;
  }
  ::-ms-input-placeholder { /* Microsoft Edge */
    color: #6B7280;
  }
}

.el-input {
  .el-input__wrapper {
    background-color: transparent;
    height: var(--el-component-size-large);
  }
}

.el-icon {
  color: #6B7280;
}

input#project-settings-on-going-project-checkbox:disabled + label {
  @apply pointer-events-none opacity-75;
}

</style>
