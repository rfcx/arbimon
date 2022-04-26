<template>
  <div class="overflow-x-auto scrollbar-hide">
    <h2 class="text-white">
      Click "Add comparison" below to compare between date ranges, sites, or taxonomies
    </h2>
    <div class="flex mt-5">
      <div v-if="store.projectData.value.isLoading" />
      <div v-else-if="store.projectData.value.isError" />
      <div v-else-if="store.projectData.value.isNoData" />
      <comparison-list-data
        v-else
        :project-data="store.projectData.value.data"
        :can-filter-by-taxon="props.canFilterByTaxon"
        @emit-select="emitSelect"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, withDefaults } from 'vue'

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
</script>
