<template>
  <div>
    <div class="pt-24 mx-auto">
      <div class="flex flex-row items-center">
        <h1>Validation</h1>
      </div>
      <div class="flex items-center font-sm space-x-1 md:space-x-2 rtl:space-x-reverse text-insight pt-6">
        <span class="font-display">Class:</span>
        <span class="italic">
          {{ speciesName || '' }}
        </span>
      </div>
      <div class="flex flex-wrap items-center justify-between text-insight pt-10 w-full gap-2 lg:flex-row ">
        <div class="flex flex-wrap gap-2 items-center gap-x-3 lg:flex-row ">
          <span class="text-2xl font-medium">Filters:</span>
          <JobValidationFilters
            @emit-min-confidence="toggleMinConfidence"
            @emit-filter-changed="emit('emitFilterChanged')"
          />
          <div class="w-36">
            <span>Results:</span>
            <span class="ml-1">{{ filteredResult }} / {{ detectionsCount }}</span>
          </div>
        </div>
        <div class="flex flex-row items-center gap-x-3">
          <span>Items per page:</span>
          <div>
            <button
              id="itemsPerPageBtn"
              data-dropdown-toggle="itemsPerPageHover"
              class="flex flex-row items-center justify-between gap-x-4 bg-transparent border-1 border-util-gray-01 rounded-md text-insight px-2 py-1 w-16"
              type="button"
            >
              <span>{{ selectedPageSize }}</span>
              <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-insight" />
            </button>
            <div
              id="itemsPerPageHover"
              class="z-10 hidden rounded-lg p-3 bg-moss w-36 flex flex-col gap-y-3"
            >
              <div class="text-insight flex justify-center whitespace-nowrap px-2">
                ROI per page
              </div>
              <div class="border-b-1 border-util-gray-03" />
              <ul
                aria-labelledby="itemsPerPageBtn"
                class="flex flex-col gap-y-1"
              >
                <li
                  v-for="size in pageSizeOptions"
                  :key="size.value"
                  class="bg-moss hover:text-util-gray-01"
                  @click="selectItemsPerPage(size.value)"
                >
                  <div
                    class="border-1 rounded-full cursor-pointer bg-moss"
                    :class="{'border-chirp': selectedPageSize === size.value, 'border-transparent': selectedPageSize !== size.value}"
                  >
                    <div
                      class="flex flex-row gap-x-3 items-center h-10 pl-5"
                    >
                      {{ size.label }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="isMinConfidenceOpen"
      class="flex flex-row items-center gap-x-2 pt-3"
    >
      <span class="text-sm">Minimum Confidence:</span>
      <input
        id="minConfidenceCnn"
        v-model.number="currentValue"
        type="number"
        min="0"
        max="1"
        class="w-12 text-center text-sm text-pitch bg-util-gray-01 rounded-md outline-none focus:(outline-none ring-util-gray-01) px-1 py-0.5 mr-1 input-hide-arrows"
        @change="onValueChange(currentValue)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import JobValidationFilters from './job-validation-filters.vue'

const props = withDefaults(defineProps<{ speciesName: string | undefined, detectionsCount: string | undefined, filteredResult: number | undefined, pageSize: number }>(), {
  speciesName: undefined,
  detectionsCount: undefined
})

const emit = defineEmits<{(e: 'emitPageSize', value: number): void, (e: 'emitClose'): void, (e: 'emitFilterChanged'): void}>()

const selectedPageSize = ref<number>(props.pageSize)
let itemsPerPageDropdown: Dropdown
const itemsPerPageHover = ref<HTMLElement | null>(null)

const pageSizeOptions = ref([
  {
    value: 25,
    label: 25
  },
  {
    value: 50,
    label: 50
  },
  {
    value: 100,
    label: 100
  }
])

const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()

const isMinConfidenceOpen = ref<boolean>(false)
 const currentValue = ref<number>(detectionsResultFilterBySpeciesStore.filter.minConfidence)

const toggleMinConfidence = (isSelected: boolean) => {
  isMinConfidenceOpen.value = isSelected
}

const onValueChange = (value: number) => {
  if (value < 0 || value > 1) {
    currentValue.value = detectionsResultFilterBySpeciesStore.filter.minConfidence
    return
  }
  detectionsResultFilterBySpeciesStore.filter.minConfidence = value
}

const selectItemsPerPage = (size: number): void => {
  selectedPageSize.value = size
  emit('emitPageSize', size)
  itemsPerPageDropdown.hide()
}

onMounted(() => {
  initDropdowns()
  itemsPerPageHover.value = document.getElementById('itemsPerPageHover')
  itemsPerPageDropdown = new Dropdown(
    document.getElementById('itemsPerPageHover'),
    document.getElementById('itemsPerPageBtn')
  )
})

watch(() => detectionsResultFilterBySpeciesStore.filter.minConfidence, (newValue) => {
  currentValue.value = newValue
})

</script>
<style lang="scss" scoped>
/* Chrome, Safari, Edge, Opera */
.input-hide-arrows::-webkit-outer-spin-button,
.input-hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-hide-arrows {
  /* Firefox */
  -moz-appearance: textfield;
}
</style>
