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
          Threshold >= {{ detectionsResultFilterStore.formattedThreshold }}
          <icon-custom-el-angle-down class="text-xxs ml-1" />
        </span>
      </template>
      <el-slider
        v-model="detectionsResultFilterStore.filter.threshold"
        :format-tooltip="detectionsResultFilterStore.formatThreshold"
      />
    </el-popover>

    <div
      class="job-result-filter-validation-status ml-4 <lg:hidden"
      label="validation-status"
    >
      <el-select
        v-model="detectionsResultFilterStore.resultFilter.validationStatus"
        placeholder="Validation status"
      >
        <el-option
          v-for="status in detectionsResultFilterStore.validationStatusFilterOptions"
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
        v-model="detectionsResultFilterStore.resultFilter.classification"
        placeholder="Class"
      >
        <el-option
          v-for="status in detectionsResultFilterStore.classFilterOptions"
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
        v-model="detectionsResultFilterStore.resultFilter.siteIds"
        multiple
        collapse-tags
        placeholder="Sites"
      >
        <el-option
          v-for="status in detectionsResultFilterStore.sitesFilterOptions"
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
        v-model="detectionsResultFilterStore.resultFilter.sortBy"
        placeholder="Sort by"
      >
        <el-option
          v-for="status in detectionsResultFilterStore.sortByFilterOptions"
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
import type { AxiosInstance } from 'axios'
import type { ComputedRef } from 'vue'
import { computed, inject, ref, watch } from 'vue'

import type { ClassifierParams } from '@rfcx-bio/common/api-bio/classifiers/classifier'

import { useClassifier } from '@/detect/_composables/use-classifier'
import { apiClientBioKey } from '@/globals'
import { useDetectionsResultFilterStore } from '~/store'
import FilterModal from './job-result-filter-modal.vue'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const props = defineProps<{ classifierId?: number }>()

const detectionsResultFilterStore = useDetectionsResultFilterStore()

const classifierId: ComputedRef<ClassifierParams> = computed(() => {
  return {
    classifierId: props.classifierId == null ? '-1' : props.classifierId.toString()
  }
})

const enabled = computed<boolean>(() => {
  return classifierId.value.classifierId !== '-1'
})

const { data } = useClassifier(apiClientBio, classifierId, { fields: ['outputs'] }, enabled)

watch(data, (newData) => {
  if (newData == null) {
    return
  }

  detectionsResultFilterStore.updateclassifierOutputList(newData.outputs)
})

const displayFilterModal = ref(false)
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
