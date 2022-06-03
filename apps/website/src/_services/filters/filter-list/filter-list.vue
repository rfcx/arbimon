<template>
  <div class="overflow-x-auto scrollbar-hide">
    <h2 class="text-white">
      Click "Add comparison" below to compare between date ranges, sites, or taxonomies
    </h2>
    <div class="flex mt-5">
      <div v-if="projectData.isLoading" />
      <div v-else-if="projectData.isError" />
      <div v-else-if="projectData.isNoData" />
      <filter-list-data
        v-else
        :project-data="projectData.data"
        :can-filter-by-taxon="props.canFilterByTaxon"
        @emit-select="emitSelect"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { withDefaults } from 'vue'

import { useProjectData } from '~/api/project-service/use-project-data'
import { DetectionFilter } from '..'
import FilterListData from './filter-list-data.vue'

const projectData = useProjectData()

const props = withDefaults(
  defineProps<{ canFilterByTaxon: boolean }>(),
  { canFilterByTaxon: true }
)

const emits = defineEmits({
  emitSelect (filters: DetectionFilter[]) {
    return filters
  }
})

const emitSelect = (filters: DetectionFilter[]) => {
  emits('emitSelect', filters)
}
</script>
