<template>
  <div class="flex flex-row items-center">
    <div class="relative">
      <button
        id="statusDropdown"
        data-dropdown-toggle="statusDropdownMenu"
        class="flex flex-row items-center justify-between bg-transparent border-1 border-frequency rounded-full text-insight px-5 py-2 w-41"
        type="button"
      >
        <span class="text-[12px]">Validation</span>
        <span v-if="isDropdownHidden() === true">
          <icon-fa-chevron-down
            class="w-2.5 h-2.5 fa-chevron-down text-insight"
          />
        </span>
        <span v-if="isDropdownHidden() === false">
          <icon-fa-chevron-up
            v-if="isDropdownHidden() === false"
            class="w-3 h-3 fa-chevron-up hidden text-insight"
          />
        </span>
      </button>
      <div
        id="statusDropdownMenu"
        class="z-10 hidden rounded-lg p-3 bg-echo w-41 flex flex-col gap-y-3"
      >
        <div class="text-insight flex justify-center text-[12px] whitespace-nowrap px-2">
          Validations status
        </div>
        <div class="border-b-1 border-util-gray-03" />
        <ul
          aria-labelledby="statusDropdown"
          class="flex flex-col gap-y-1"
        >
          <li
            v-for="status in detectionsResultFilterBySpeciesStore.validationStatusFilterOptions"
            :key="status.value"
            class="bg-echo px-2"
            @click="selectedStatus = status.value"
          >
            <div
              class="flex flex-row items-center border-1 rounded-md cursor-pointer text-[12px] h-6 bg-echo px-2"
              :class="{'border-frequency': selectedStatus === status.value, 'border-transparent': selectedStatus !== status.value}"
            >
              <icon-custom-fi-unvalidated
                v-if="status.value === 'unreviewed'"
                class="h-2 w-2 mr-2 mb-0.5"
              />
              <icon-custom-fi-present
                v-if="status.value === 'confirmed'"
                class="h-2 w-2 mr-2 mb-0.5"
              />
              <icon-custom-fi-not-present
                v-if="status.value === 'rejected'"
                class="h-2 w-2 mr-2 mb-0.5"
              />
              <icon-custom-fi-unknown
                v-if="status.value === 'uncertain'"
                class="h-2 w-2 mr-2 mb-0.5"
              />
              {{ status.label }}
            </div>
          </li>
        </ul>
        <button
          class="btn btn-primary p-1.5 text-[12px] whitespace-nowrap"
          @click="filterDetections(selectedStatus); closeMenu()"
        >
          Apply filter
        </button>
      </div>
    </div>
    <el-popover
      placement="bottom"
      :width="200"
      trigger="click"
    >
      <template #reference>
        <span
          class="flex items-center text-sm text-subtle <lg:hidden"
          label="Threshold"
          role="button"
        >
          Threshold >= {{ detectionsResultFilterBySpeciesStore.formattedThreshold }}
          <icon-custom-el-angle-down class="text-xxs ml-1" />
        </span>
      </template>
      <el-slider
        v-model="detectionsResultFilterBySpeciesStore.filter.threshold"
        :format-tooltip="detectionsResultFilterBySpeciesStore.formatThreshold"
      />
    </el-popover>

    <div
      class="job-result-filter-start-end-range ml-4 <lg:hidden"
      label="start-end-range"
    >
      <el-select
        v-model="detectionsResultFilterBySpeciesStore.filter.range"
        placeholder="Start/end range"
      >
        <el-option
          v-for="range in detectionsResultFilterBySpeciesStore.startEndRangeFilterOptions"
          :key="range.value"
          :label="range.label"
          :value="range.value"
        />
      </el-select>
    </div>

    <div
      class="job-result-filter-sites ml-4 <lg:hidden"
      label="sites"
    >
      <el-select
        v-model="detectionsResultFilterBySpeciesStore.filter.siteIds"
        multiple
        collapse-tags
        placeholder="Sites"
      >
        <el-option
          v-for="status in detectionsResultFilterBySpeciesStore.sitesFilterOptions"
          :key="status.value"
          :label="status.label"
          :value="status.value"
        />
      </el-select>
    </div>

    <div
      class="job-result-filter-sort-by ml-4 <lg:hidden"
      label="sort-by"
    >
      <el-select
        v-model="detectionsResultFilterBySpeciesStore.filter.sortBy"
        placeholder="Sort by"
      >
        <el-option
          v-for="status in detectionsResultFilterBySpeciesStore.sortByFilterOptions"
          :key="status.value"
          :label="status.label"
          :value="status.value"
        />
      </el-select>
    </div>

    <div class="display-controls ml-4">
      <button
        class="btn btn-icon lg:hidden"
        label="Filter"
        @click="displayFilterModal = true"
      >
        <icon-fa-filter class="text-xs" />
      </button>
    </div>
  </div>
  <JobResultFilterBySpeciesModal
    v-if="displayFilterModal"
    @emit-close="displayFilterModal = false"
  />
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { onMounted, ref } from 'vue'

import { type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import JobResultFilterBySpeciesModal from './job-result-filter-by-species-modal.vue'

const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const displayFilterModal = ref(false)
const selectedStatus = ref<ReviewStatus | 'all'>('all')

let dropdown: Dropdown
const statusDropdownMenu = ref<HTMLElement | null>(null)

const closeMenu = (): void => {
  dropdown.hide()
}

const filterDetections = (status: ReviewStatus | 'all') => {
  detectionsResultFilterBySpeciesStore.filter.validationStatus = status
}

const isDropdownHidden = (): boolean => {
  return !!(statusDropdownMenu.value && statusDropdownMenu.value.classList.contains('hidden'))
}

onMounted(() => {
  initDropdowns()
  statusDropdownMenu.value = document.getElementById('statusDropdownMenu')
  dropdown = new Dropdown(
    document.getElementById('statusDropdownMenu'),
    document.getElementById('statusDropdown')
  )
})
</script>

<style lang="scss">
// this style is to mimic the el-dropdown element.
// affects both the modal and the filter here.
.job-result-filter-validation-status, .job-result-filter-taxon-class, .job-result-filter-sites, .job-result-filter-sort-by, .job-result-filter-start-end-range {
  div.el-input__wrapper {
    background-color: transparent;
    box-shadow: none;
  }

  div.el-select {
    div.el-input__wrapper:hover {
      box-shadow: none;
    }

    div.el-input.is-focus {
      div.el-input__wrapper {
        box-shadow: none !important;
      }
    }

    div.el-input {
      div.el-input__wrapper.is-focus {
        box-shadow: none !important;
      }
    }
  }

  input.el-input__inner {
    @apply text-subtle;
  }
}
</style>
