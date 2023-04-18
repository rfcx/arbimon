<template>
  <div class="flex flex-row items-center">
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
          Threshold >= {{ formatThreshold(filterConfigs.threshold) }}
          <icon-custom-el-angle-down class="text-xxs ml-1" />
        </span>
      </template>
      <el-slider
        v-model="filterConfigs.threshold"
        :format-tooltip="formatThreshold"
      />
    </el-popover>
    <div
      v-for="filter in mobJobResultFilters"
      :key="'job-result-filter-' + filter.label"
      :label="filter.label"
      class="ml-4 <lg:hidden"
    >
      <el-dropdown trigger="click">
        <span class="flex items-center text-sm text-subtle">
          {{ filter.label }}
          <icon-fa-chevron-down class="ml-2 text-xxs" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, idx) in filter.items"
              :key="'job-result-filter-item-' + filter.label + idx"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
  <filter-modal
    v-if="displayFilterModal"
    @emit-close="displayFilterModal = false"
    @emit-config="onFilterConfigChange"
  />
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'

import FilterModal from './job-result-filter-modal.vue'
import type { ValidationFilterConfig } from './types'

const displayFilterModal = ref(false)
// const displayType = ref<'list' | 'grid'>('list')
const filterConfigs = reactive<ValidationFilterConfig>({
  threshold: 50, // slider return in percentage
  validationStatus: '',
  taxonClass: '',
  siteIds: [],
  sortBy: ''
})

const mobJobResultFilters = [
  {
    label: 'Validation status',
    items: [
      {
        label: 'All',
        value: 3
      },
      {
        label: 'Unvalidated',
        value: 2
      },
      {
        label: 'Present',
        value: 1
      },
      {
        label: 'Not present',
        value: -1
      },
      {
        label: 'Unknown',
        value: 0
      }
    ]
  },
  {
    label: 'Class',
    items: [
      {
        label: 'Non-flying mammals',
        value: 'mammals'
      },
      {
        label: 'Birds',
        value: 'birds'
      }
    ]
  },
  {
    label: 'Site',
    items: [
      {
        label: 'PPP',
        value: 'ppp'
      }
    ]
  },
  {
    label: 'Sort by score',
    items: [
      {
        label: 'Low to high',
        value: 'low to high'
      },
      {
        label: 'High to low',
        value: 'high to low'
      }
    ]
  }
]

const formatThreshold = (val: number) => {
  return val / 100
}

const getFilterDetections = () => {
  // Call API
  //  params: { threshold: formatThreshold(threshold), ...filterConfigs }
}

const onFilterConfigChange = (config: ValidationFilterConfig) => {
  filterConfigs.threshold = config.threshold
  filterConfigs.validationStatus = config.validationStatus
  filterConfigs.taxonClass = config.taxonClass
  filterConfigs.siteIds = config.siteIds
  filterConfigs.sortBy = config.sortBy
  getFilterDetections()
}

</script>
