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
    class="flex mt-7 items-center gap-4"
  >
    <div class="flex-1">
      <label
        for="start"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Project start date</label>
      <div class="relative flex-1">
        <el-date-picker
          v-model="startDate"
          class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
          type="date"
          placeholder="Choose date"
          format="MM/DD/YYYY"
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
        :class="{'not-allowed': isSelected}"
      >
        <el-date-picker
          v-model="endDate"
          class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
          type="date"
          placeholder="Choose date"
          format="MM/DD/YYYY"
          :disabled="isSelected"
        />
      </div>
    </div>
  </div>
  <div class="items-center mt-4">
    <input
      type="checkbox"
      class="w-5 h-5 border mb-1 border-gray-300 rounded dark:bg-echo focus:border-white-600 focus:ring-frequency dark:border-white-600 dark:focus:ring-frequency dark:ring-offset-gray-800"
      :checked="isSelected"
      @click="toggleDetection()"
    >
    <label class="font-light text-gray-500 dark:text-gray-300 ml-2">This is an on-going project</label>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import type { ProjectDefault } from '../../types'

const props = withDefaults(defineProps<{
  existingName?: string
  allowNameChanges?: boolean
}>(), {
  existingName: '',
  allowNameChanges: true
})

const emit = defineEmits<{(e: 'emitUpdateValue', value: ProjectDefault): void}>()

const name = ref('')
const startDate = ref('')
const endDate = ref('')
const isSelected = ref<boolean>(false)

const value: ComputedRef<ProjectDefault> = computed(() => {
  return {
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value
  }
})

onMounted(() => {
  if (props.existingName) {
    name.value = props.existingName
  }
})

watch(name, () => {
  emit('emitUpdateValue', value.value)
})

watch(startDate, () => {
  emit('emitUpdateValue', value.value)
})

watch(endDate, () => {
  emit('emitUpdateValue', value.value)
})

const toggleDetection = () => {
  isSelected.value = !isSelected.value
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
