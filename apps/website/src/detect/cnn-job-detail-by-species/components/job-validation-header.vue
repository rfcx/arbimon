<template>
  <div>
    <div class="pt-5 mx-auto">
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
          <JobValidationFilters
            @emit-filter-changed="onEmitFilterChanged"
          />
          <div class="flex flex-row gap-2 max-w-36 self-start mt-2.5 items-center">
            <span>Results:</span>
            <StatusNumber
              :is-loading="isLoadingFilter"
              :value="filteredResult ?? -1"
            />
            <span> / </span>
            <StatusNumber
              :is-loading="isLoading"
              :value="detectionsCount ?? -1"
            />
          </div>
        </div>
        <div class="flex flex-row items-center gap-x-3 self-start mt-1">
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
  </div>
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { onMounted, ref } from 'vue'

import JobValidationFilters from './job-validation-filters.vue'
import StatusNumber from './job-validation-status-number.vue'

const props = withDefaults(defineProps<{ speciesName: string | undefined, detectionsCount: number | undefined, filteredResult: number | undefined, pageSize: number, isLoading: boolean, isLoadingFilter: boolean }>(), {
  speciesName: undefined,
  detectionsCount: undefined,
  isLoading: false, // loading classification header & total detections of the selected species
  isLoadingFilter: false // loading filtered results
})

const emit = defineEmits<{(e: 'emitPageSize', value: number): void, (e: 'emitClose'): void, (e: 'emitFilterChanged', groupType: string | undefined, displayBestScores: number): void}>()

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

const onEmitFilterChanged = (groupType: string | undefined, displayBestScores: number) => {
  emit('emitFilterChanged', groupType, displayBestScores)
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
