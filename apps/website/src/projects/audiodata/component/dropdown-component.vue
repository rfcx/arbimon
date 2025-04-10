<template>
  <div
    ref="dropdown"
    class="dropdown relative w-64"
  >
    <div
      class="bg-moss rounded my-6 focus:(border-echo ring-0 outline-none) min-w-64"
      @click="toggleDropdown"
    >
      <div class="flex flex-row justify-between items-center border-1 border-util-gray-03 gap-x-2 bg-moss rounded my-6 p-3 focus:bg-util-gray-04 focus:ring-0 focus:outline-none min-w-64 h-10">
        <span>{{ props.itmes.find(idx => idx.value === selectedFilter)?.label }}</span>
        <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-util-gray-02 " />
      </div>
    </div>
    <ul
      v-show="isOpen"
      class="dropdown-menu absolute bg-moss rounded mt-[-10px] py-1 w-full z-10"
    >
      <li
        v-for="option in props.itmes"
        :key="'cj-filter-' + option.value"
        class="px-4 py-2 cursor-pointer hover:(bg-util-gray-03 rounded)"
        :class="{ 'text-frequency font-medium': option.value === selectedFilter }"
        @click="selectFilter(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

export interface DropdownItem {
  value: string
  label: string
  checked: boolean
}

const props = defineProps<{
  itmes: DropdownItem[]
}>()

const emit = defineEmits<{(e: 'emitSelect', value: string): void}>()

const selectedFilter = ref('')
const isOpen = ref(false)

onMounted(() => {
  console.info(props.itmes)

  // selectedFilter.value = props.itmes[0].value
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectFilter = (value: string) => {
  selectedFilter.value = value
  emit('emitSelect', value)
  isOpen.value = false
}

</script>
