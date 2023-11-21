<template>
  <div>
    <label
      for="name"
      class="block mb-2 font-medium text-gray-900 dark:text-insight"
    >Project Name*</label>
    <input
      id="name"
      v-model="name"
      name="name"
      type="text"
      class="w-full border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
      placeholder="Brown bears in Eastern Finland"
      :disabled="!allowNameChanges"
      required
    >
  </div>
  <div
    id="dateRangePicker"
    date-rangepicker
    class="flex mt-6 items-center gap-4"
  >
    <div class="flex-1">
      <label
        for="start"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project start date</label>
      <div class="relative flex-1">
        <ChooseDatePicker
          :initial-date="startDate ? new Date(startDate) : undefined"
          @emit-select-date="onSelectStartDate"
        />
      </div>
    </div>
    <span class="mx-4">-</span>
    <div class="flex-1">
      <label
        for="end-date"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project end date</label>
      <div
        class="relative flex-1"
        :class="{'not-allowed': onGoing}"
      >
        <ChooseDatePicker
          :initial-date="endDate ? new Date(endDate) : undefined"
          :disabled="onGoing"
          @emit-select-date="onSelectEndDate"
        />
      </div>
    </div>
  </div>
  <div class="items-center mt-4">
    <input
      type="checkbox"
      class="w-5 h-5 border mb-1 border-gray-300 rounded dark:bg-echo focus:border-white-600 focus:ring-frequency dark:border-white-600 dark:focus:ring-frequency dark:ring-offset-gray-800"
      :checked="onGoing"
      @click="onGoingClick()"
    >
    <label class="font-light text-gray-500 dark:text-gray-300 ml-2">This is an on-going project</label>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import type { ProjectDefault } from '../../types'
import ChooseDatePicker from './choose-date-picker.vue'

const props = withDefaults(defineProps<{
  existingName?: string
  allowNameChanges?: boolean
  dateStart?: Date | null
  dateEnd?: Date | null
}>(), {
  existingName: '',
  allowNameChanges: true,
  dateStart: null,
  dateEnd: null
})

const emit = defineEmits<{(e: 'emitUpdateValue', value: ProjectDefault): void}>()

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

const onSelectStartDate = (dateStartLocalIso: string | null) => {
  startDate.value = dateStartLocalIso
  emit('emitUpdateValue', value.value)
}

const onSelectEndDate = (dateEndLocalIso: string | null) => {
  endDate.value = dateEndLocalIso
  emit('emitUpdateValue', value.value)
}

onMounted(() => {
  if (props.existingName) {
    name.value = props.existingName
  }
  if (props.dateStart) {
    const start = dayjs(props.dateStart).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    startDate.value = start
  }
  if (props.dateEnd) {
    const end = dayjs(props.dateEnd).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    endDate.value = end
  }
  if (endDate.value?.length === 0 && startDate.value?.length !== 0) {
    onGoing.value = true
  }
})

watch(name, () => {
  emit('emitUpdateValue', value.value)
})

const onGoingClick = () => {
  onGoing.value = !onGoing.value
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
  border: 0px;
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

</style>
