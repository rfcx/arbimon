<template>
  <div
    ref="dropdown"
    class="dropdown relative w-[300px]"
  >
    <div
      class="species-input bg-steel-gray rounded my-6 focus:(border-box-gray ring-0 outline-none) min-w-64"
      @click="toggleDropdown"
    >
      <div class="flex flex-row justify-between items-center border-1 border-util-gray-03 gap-x-2 bg-steel-gray rounded my-6 p-3 focus:border-box-gray focus:ring-0 focus:outline-none min-w-64 h-[40px]">
        <span>{{ props.filterOptions.find(idx => idx.value === selectedFilter)?.label }}</span>
        <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-util-gray-02 " />
      </div>
    </div>
    <ul
      v-show="isOpen"
      class="dropdown-menu absolute bg-steel-gray rounded mt-[-10px] py-1 w-full z-10"
    >
      <li
        v-for="option in props.filterOptions"
        :key="'cj-filter-' + option.value"
        class="px-4 py-2 cursor-pointer"
        :class="{ 'text-frequency font-medium': option.value === selectedFilter }"
        @click="selectFilter(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import type { JobFilterItem } from '../../types'

const props = defineProps<{
  filterOptions: JobFilterItem[]
}>()

const emit = defineEmits<{(e: 'emitSelect', value: string): void}>()

const selectedFilter = ref('all')
const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectFilter = (value: string) => {
  selectedFilter.value = value
  emit('emitSelect', value)
  isOpen.value = false
}

</script>
