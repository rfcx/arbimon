<template>
  <div class="mt-6">
    <div class="flex flex-row">
      <label
        for="name"
        class="block mb-2 font-medium text-gray-900 dark:text-secondary"
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
      class="w-full text-secondary border border-util-gray-03 rounded-md dark:(bg-pitch text-fog placeholder:text-placeholder) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
      placeholder="Brown bears in Eastern Finland"
      required
    >
  </div>
  <DaterangePicker
    :initial-date-start="dateStart !== null ? dateStart : undefined"
    :initial-date-end="dateEnd !== null ? dateEnd : undefined"
    :input-label-start="'Project start date'"
    :input-label-end="'Project end date'"
    :on-going="onGoing"
    :is-disabled="isDisabled"
    @emit-select-date-range="onSelectDateRange"
  />
  <div class="items-center mt-4">
    <input
      id="project-settings-on-going-project-checkbox"
      type="checkbox"
      class="w-5 h-5 border-2 mb-1 rounded dark:bg-echo focus:ring-frequency border-white dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
      :disabled="isDisabled"
      :checked="onGoing"
      @click="onSelectOnGoing()"
    >
    <label
      class="font-light ml-2 cursor-pointer text-secondary"
      @click="onSelectOnGoing()"
    >This is an on-going project</label>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import { type DateRange } from '@/_components/date-range-picker/date-range-picker'
import DaterangePicker from '@/_components/date-range-picker/date-range-picker.vue'
import type { ProjectDefault } from '../../types'
import IconIInfo from '../icon-i-info.vue'

const props = withDefaults(defineProps<{
  existingName?: string
  dateStart?: string | null
  dateEnd?: string | null
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

onMounted(() => {
  if (props.existingName) {
    name.value = props.existingName
  }
  if (props.dateStart) {
    startDate.value = props.dateStart
  }
  if (props.dateEnd) {
    endDate.value = props.dateEnd
  }
  if (endDate.value?.length === 0 && startDate.value?.length !== 0) {
    onGoing.value = true
  }
})

watch(() => props.dateStart, (newValue, oldValue) => {
  if (!newValue || newValue === oldValue) return
  startDate.value = props.dateStart ? props.dateStart : ''
  onGoing.value = !props.dateEnd
})

watch(() => props.dateEnd, (dateEndValue) => {
  if (!dateEndValue) return
  endDate.value = props.dateEnd ? props.dateEnd : ''
})

watch(name, () => {
  emit('emitUpdateValue', value.value)
})

const onSelectDateRange = ({ dateStartLocalIso, dateEndLocalIso }: DateRange) => {
  startDate.value = dateStartLocalIso
  endDate.value = dateEndLocalIso
  emit('emitUpdateValue', value.value)
}

const onSelectOnGoing = () => {
  onGoing.value = !onGoing.value
  if (onGoing.value) { endDate.value = '' }
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
