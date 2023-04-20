<template>
  <modal-popup
    title="Validation Filter"
    modal-body="sm:(my-8 align-middle)"
  >
    <div class="p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-white text-lg">
          Validation Filter
        </h1>
        <icon-fa-close
          class="text-xs cursor-pointer"
          @click="$emit('emitClose')"
        />
      </div>
      <hr class="border-box-gray-light mt-2">
      <div class="text-md font-weight-bold mt-2">
        Threshold
        <el-slider
          v-model="filterConfigs.threshold"
          :format-tooltip="formatThreshold"
          size="small"
        />
      </div>

      <div
        v-for="filter in mobJobResultFilters"
        :key="'job-result-filter-' + filter.label"
        :label="filter.label"
        class="mt-2"
      >
        <div class="text-md font-weight-bold">
          {{ filter.label }}
        </div>
        <el-select
          class="mt-2"
          trigger="click"
        >
          <el-option
            v-for="(item, idx) in filter.items"
            :key="'job-result-filter-item-' + filter.label + idx"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div class="text-right mt-4">
        <button
          class="btn mr-2"
          @click="$emit('emitClose')"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click="confirmFilterConfig"
        >
          Confirm
        </button>
      </div>
    </div>
  </modal-popup>
</template>
<script setup lang="ts">
import { reactive } from 'vue'

import type { ValidationFilterConfig } from './types'

const emit = defineEmits<{(e: 'emitClose'): void, (e: 'emitConfig', value: ValidationFilterConfig): void}>()
const filterConfigs = reactive({
  threshold: 50,
  validationStatus: '',
  taxonClass: '',
  siteIds: [],
  sortBy: ''
})

const confirmFilterConfig = () => {
  emit('emitConfig', filterConfigs)
  emit('emitClose')
}

const formatThreshold = (val: number) => {
  return val / 100
}

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

</script>
