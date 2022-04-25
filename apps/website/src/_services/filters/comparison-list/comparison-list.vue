<template>
  <div class="overflow-x-auto scrollbar-hide">
    <h2 class="text-white">
      Click "Add comparison" below to compare between date ranges, sites, or taxonomies
    </h2>
    <div class="flex mt-5">
      <div v-if="isLoading" />
      <div v-else-if="isError" />
      <div v-else-if="isNoData" />
      <comparison-list-data
        v-else-if="projectData"
        :project-data="projectData"
        :can-filter-by-taxon="props.canFilterByTaxon"
        @emit-select="emitSelect"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineEmits, defineProps, withDefaults } from 'vue'

import { useStore } from '~/store'
import { ColoredFilter } from '..'
import ComparisonListData from './comparison-list-data.vue'

const store = useStore()
const props = withDefaults(
  defineProps<{ canFilterByTaxon: boolean }>(),
  { canFilterByTaxon: true }
)

const emits = defineEmits({
  emitSelect (filters: ColoredFilter[]) {
    return filters
  }
})

const emitSelect = (filters: ColoredFilter[]) => {
  emits('emitSelect', filters)
}

const { isLoading, isError, data: projectData } = store.projectData

const isNoData = computed(() => {
  if (projectData.value === undefined) return false

  const { locationSites, taxonClasses, dateEndInclusiveUtc, dateStartInclusiveUtc } = projectData.value ?? {}
  return locationSites.length === 0 ||
    taxonClasses.length === 0 ||
    dateEndInclusiveUtc === undefined ||
    dateStartInclusiveUtc === undefined
})

</script>
