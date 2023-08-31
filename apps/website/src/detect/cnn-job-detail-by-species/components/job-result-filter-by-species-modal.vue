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
          v-model="detectionsResultFilterBySpeciesStore.filter.threshold"
          :format-tooltip="detectionsResultFilterBySpeciesStore.formatThreshold"
          size="small"
        />
      </div>

      <div class="job-result-filter-validation-status mt-2">
        <div class="text-md font-weight-bold">
          Validation status
        </div>
        <el-select
          v-model="detectionsResultFilterBySpeciesStore.filter.validationStatus"
          class="mt-2"
        >
          <el-option
            v-for="status in detectionsResultFilterBySpeciesStore.validationStatusFilterOptions"
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
          v-model="detectionsResultFilterBySpeciesStore.filter.siteIds"
          class="mt-2"
          multiple
          collapse-tags
        >
          <el-option
            v-for="status in detectionsResultFilterBySpeciesStore.sitesFilterOptions"
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
          v-model="detectionsResultFilterBySpeciesStore.filter.sortBy"
          class="mt-2"
        >
          <el-option
            v-for="status in detectionsResultFilterBySpeciesStore.sortByFilterOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
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
import { useDetectionsResultFilterBySpeciesStore } from '~/store'

const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const emit = defineEmits(['emitClose'])

const confirmFilterConfig = () => {
  emit('emitClose')
}
</script>
