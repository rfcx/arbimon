<template>
  <div class="fixed right-4 bottom-0 mx-auto flex">
    <div
      id="toast-undo"
      class="flex items-center space-x-4 p-5 w-144 min-w-full justify-between text-white bg-steel-grey rounded-md shadow"
      role="alert"
    >
      <div class="text-base flex items-center">
        <button
          @click="close()"
        >
          <icon-fa-close class="cursor-pointer h-8 inline mr-2" />
        </button>
        {{ props.detectionCount }} selected
      </div>
      <div class="flex items-center ml-auto ml-0 text-sm">
        <div class="text-opacity-50">
          Mark as
        </div>
        <el-select
          v-model="selectedFilter"
          filterable
          class="el-select bg-steel-grey rounded-xl pl-2 border-box-grey focus:(border-box-grey ring-0 outline-none) min-w-40"
          size="large"
        >
          <el-option
            v-for="option in props.filterOptions"
            :key="'cj-filter-' + option.value"
            :value="option.value"
            class="my-1 flex items-center text-sm"
            :label="option.label"
          >
            <validation-status
              :value="option.value"
              :hide-unvalidated="false"
            />
            {{ option.label }}
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

import { DetectionValidationStatus } from './types'
import ValidationStatus from './validation-status.vue'

const props = defineProps<{
  detectionCount: number | null,
  filterOptions: DetectionValidationStatus[]
}>()

const emit = defineEmits<{(e: 'emitValidation', validation: string): void,
  (e: 'emitClose'): void
}>()
const selectedFilter = ref('unvalidated')

watch(selectedFilter, () => {
  const value = selectedFilter.value
  emit('emitValidation', value)
})

const close = () => {
  emit('emitClose')
}

</script>
<style lang="scss">
.el-select {
  .el-input__inner {
    font-size: 0.875rem;
  }
}
</style>
