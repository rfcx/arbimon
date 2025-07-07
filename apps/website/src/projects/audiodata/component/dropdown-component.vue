<template>
  <div
    id="itemInput"
    ref="itemInput"
    class="dropdown relative"
  >
    <div
      class="flex flex-row justify-between items-center border-1 border-util-gray-03 gap-x-2 bg-moss rounded mt-6 p-3 focus:bg-util-gray-04 focus:ring-0 focus:outline-none h-10"
      data-dropdown-toggle="resultDropdown"
      @click="onClickInput"
    >
      <span>{{ projectSelected }}</span>
      <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-util-gray-02 " />
    </div>
    <div
      id="resultDropdown"
      class="absolute hidden w-full z-40 bg-white rounded-md shadow dark:bg-gray-700 mt-2"
    >
      <ul
        class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md"
      >
        <li
          v-if="props.itmes.length === 0"
          class="rounded-lg p-4 text-center text-sm"
        >
          No data
        </li>
        <li
          v-for="option in props.itmes"
          v-else
          :key="'cj-filter-' + option.value"
          class="px-4 py-2 cursor-pointer hover:(bg-util-gray-03 rounded)"
          :class="{ 'text-frequency font-medium': option.value === selectedFilter }"
          @click="selectFilter(option.value)"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import type { Ref } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

export interface DropdownItem {
  value: string
  label: string
}

const props = defineProps<{
  itmes: DropdownItem[], selected?: DropdownItem
}>()

const emit = defineEmits<{(e: 'emitSelect', value: string): void}>()

const selectedFilter = ref('')
const dropdown = ref() as Ref<Dropdown>

onMounted(() => {
  initDropdowns()
  dropdown.value = new Dropdown(
    document.getElementById('resultDropdown'),
    document.getElementById('itemInput'),
    { placement: 'bottom-start', triggerType: 'none', offsetDistance: 1 }
  )
  selectedFilter.value = props.selected?.value ?? ''
})

const selectFilter = (value: string) => {
  selectedFilter.value = value
  emit('emitSelect', value)
  dropdown.value.hide()
}

const onClickInput = (): void => {
  dropdown.value.show()
}

const projectSelected = computed(() => {
  return props.itmes.find(idx => idx.value === selectedFilter.value ?? '')?.label
})

watch(() => props.selected, (newValue) => {
  selectedFilter.value = newValue?.value ?? ''
})

</script>
