<template>
  <el-select
    v-model="selectedFilter"
    filterable
    class="species-input bg-steel-grey rounded my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <el-option
      v-for="option in props.filterOptions"
      :key="'cj-filter-' + option.value"
      :value="option.value"
      class="my-0.5"
      :label="option.label"
    />
  </el-select>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

import type { JobFilterItem } from '../../types'

const props = defineProps<{
  filterOptions: JobFilterItem[]
}>()

const emit = defineEmits<{(e: 'emitSelect', value: string): void}>()

const selectedFilter = ref('all')

watch(selectedFilter, () => {
  const value = selectedFilter.value
  emit('emitSelect', value)
})

</script>
<style lang="scss" scoped>
:deep(.select-trigger) {
  width: 300px;
}
</style>
