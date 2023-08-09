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
      <hr class="border-box-grey-light mt-2">
      <div class="text-md font-weight-bold mt-2">
        Threshold
        <el-slider
          v-model="detectionsResultFilterStore.filter.threshold"
          :format-tooltip="detectionsResultFilterStore.formatThreshold"
          size="small"
        />
      </div>

      <div class="job-result-filter-validation-status mt-2">
        <div class="text-md font-weight-bold">
          Validation status
        </div>
        <el-select
          v-model="detectionsResultFilterStore.filter.validationStatus"
          class="mt-2"
        >
          <el-option
            v-for="status in detectionsResultFilterStore.validationStatusFilterOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>

      <div class="job-result-filter-taxon-class mt-2">
        <div class="text-md font-weight-bold">
          Class
        </div>
        <el-select
          v-model="detectionsResultFilterStore.filter.classification"
          class="mt-2"
        >
          <el-option
            v-for="status in detectionsResultFilterStore.classFilterOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>

      <div class="job-result-filter-sites mt-2">
        <div class="text-md font-weight-bold">
          Sites
        </div>
        <el-select
          v-model="detectionsResultFilterStore.filter.siteIds"
          class="mt-2"
          multiple
          collapse-tags
        >
          <el-option
            v-for="status in detectionsResultFilterStore.sitesFilterOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>

      <div class="job-result-filter-sort-by mt-2">
        <div class="text-md font-weight-bold">
          Sort by
        </div>
        <el-select
          v-model="detectionsResultFilterStore.filter.sortBy"
          class="mt-2"
        >
          <el-option
            v-for="status in detectionsResultFilterStore.sortByFilterOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>

      <div class="text-right mt-4">
        <button
          class="btn btn-secondary mr-2"
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
import { useDetectionsResultFilterStore } from '~/store'

const detectionsResultFilterStore = useDetectionsResultFilterStore()
const emit = defineEmits(['emitClose'])

const confirmFilterConfig = () => {
  emit('emitClose')
}
</script>
