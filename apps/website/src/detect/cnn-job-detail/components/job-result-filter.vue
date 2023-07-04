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
          Threshold >= {{ cnnResultFilterStore.formattedThreshold }}
          <icon-custom-el-angle-down class="text-xxs ml-1" />
        </span>
      </template>
      <el-slider
        v-model="cnnResultFilterStore.filter.threshold"
        :format-tooltip="cnnResultFilterStore.formatThreshold"
      />
    </el-popover>

    <div
      class="job-result-filter-validation-status ml-4 <lg:hidden"
      label="validation-status"
    >
      <el-select
        v-model="cnnResultFilterStore.resultFilter.validationStatus"
        placeholder="Validation status"
      >
        <el-option
          v-for="status in cnnResultFilterStore.validationStatusFilterOptions"
          :key="status.value"
          :label="status.label"
          :value="status.value"
        />
      </el-select>
    </div>

    <div
      class="job-result-filter-taxon-class ml-4 <lg:hidden"
      label="taxon-class"
    >
      <el-select
        v-model="cnnResultFilterStore.resultFilter.taxonClass"
        placeholder="Class"
      >
        <el-option
          v-for="status in cnnResultFilterStore.classFilterOptions"
          :key="status.value"
          :label="status.label"
          :value="status.value"
        />
      </el-select>
    </div>

    <div
      class="job-result-filter-sites ml-4 <lg:hidden"
      label="sites"
    >
      <el-select
        v-model="cnnResultFilterStore.resultFilter.siteIds"
        multiple
        collapse-tags
        placeholder="Sites"
      >
        <el-option
          v-for="status in cnnResultFilterStore.sitesFilterOptions"
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
        v-model="cnnResultFilterStore.resultFilter.sortBy"
        placeholder="Sort by"
      >
        <el-option
          v-for="status in cnnResultFilterStore.sortByFilterOptions"
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
  <filter-modal
    v-if="displayFilterModal"
    @emit-close="displayFilterModal = false"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { useCnnResultFilterStore } from '~/store'
import FilterModal from './job-result-filter-modal.vue'

const cnnResultFilterStore = useCnnResultFilterStore()
const displayFilterModal = ref(false)

// const displayType = ref<'list' | 'grid'>('list')
</script>

<style lang="scss">
// this style is to mimic the el-dropdown element.
// affects both the modal and the filter here.
.job-result-filter-validation-status, .job-result-filter-taxon-class, .job-result-filter-sites, .job-result-filter-sort-by {
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
