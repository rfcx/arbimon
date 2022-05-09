<template>
  <div
    v-for="(filter, idx) in filters"
    :key="'site-card' + idx"
    class="w-48 min-w-48 mr-4 cursor-pointer rounded-xl border-white text-white text-sm opacity-100 hover:opacity-90"
    :style="{ 'border': `solid 3px ${getFilterColor(idx)}`, 'background-color': `${getFilterColor(idx)}80` }"
    @click="openPopup(idx)"
  >
    <!--TODO: 268 Show full information of filter when the user hovers over the comparison box -->
    <!--TODO: 269 Extract comparison item to separate file -->
    <div class="flex px-4 mt-2">
      <div
        class="flex flex-1"
        :title="displayTitle(filter)"
      >
        <div class="min-w-4">
          <icon-fa-map-marker />
        </div>
        <div class="truncate max-w-24 ml-2">
          {{ displayTitle(filter) }}
        </div>
      </div>
      <div
        :class="{ 'invisible': isDefaultFilter }"
        @click.stop="removeFilterConfig(idx)"
      >
        <icon-fa-close class="cursor-pointer w-3" />
      </div>
    </div>
    <div
      class="flex items-center my-2 px-4"
    >
      <div class="min-w-4">
        <icon-fas-clock />
      </div>
      <div class="ml-2">
        {{ displayDate(filter) }}
      </div>
    </div>
    <div
      class="flex items-center py-2 px-4"
      :style="{ 'border-top': `solid 1px ${getFilterColor(idx)}`}"
    >
      <div class="min-w-4">
        <icon-fas-filter />
      </div>
      <div class="ml-2 first-letter:capitalize">
        {{ getTaxonFilterText(idx) }}
      </div>
    </div>
  </div>
  <div
    v-if="isShowAdd"
    class="flex justify-center items-center w-48 min-w-32 px-4 cursor-pointer rounded-xl bg-mirage-grey text-white border-2 border-dashed hover:bg-steel-grey"
    @click="addFilterConfig"
  >
    <div class="uppercase">
      Add comparison
    </div>
  </div>
  <comparison-filter-modal
    v-if="isOpenModal"
    :initial-values="modalFilter"
    :can-filter-by-taxon="canFilterByTaxon"
    @emit-apply="apply"
    @emit-close="closePopup"
  />
</template>
<script lang="ts" setup>
import { isEqual } from 'lodash-es'
import { computed, defineEmits, defineProps, onMounted, ref, withDefaults } from 'vue'

import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { formatDateRange } from '@rfcx-bio/utils/dates'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { DetectionFilter } from '~/filters/types'
import { useStore } from '~/store'
import ComparisonFilterModal from '../comparison-filter-modal/comparison-filter-modal.vue'

const props = withDefaults(
    defineProps<{ projectData: ProjectFiltersResponse, canFilterByTaxon: boolean }>(),
    { canFilterByTaxon: true }
  )

const emits = defineEmits<{(e: 'emitSelect', filters: DetectionFilter[]): void}>()

const store = useStore()
const isAddSelected = ref(false)
const selectedFilterId = ref(-1)
const isOpenModal = ref(false)
const modalFilter = ref<DetectionFilter | null>(null)

const defaultFilter = computed((): DetectionFilter => {
  return {
    dateStartLocal: dayjs.utc(props.projectData.dateStartInclusiveUtc).startOf('day'),
    dateEndLocal: dayjs.utc(props.projectData.dateEndInclusiveUtc).startOf('day'),
    siteGroups: [],
    taxonClasses: []
  }
})
const filters: DetectionFilter[] = [defaultFilter.value]

const emitSelect = () => {
  const fs = filters.map((f, i) => ({
      ...f,
      color: store.datasetColors[i]
    }))
  emits('emitSelect', fs)
}

onMounted(() => {
  emitSelect()
})

const isDefaultFilter = computed(() => {
  return filters.length === 1 && isEqual(defaultFilter.value, filters[0])
})

const isShowAdd = computed(() => {
  return filters.length < 5
})

const displayTitle = (filter: DetectionFilter) => {
  if (filter.siteGroups.length === 0 || filter.siteGroups[0].sites.length === 0) {
    return 'All sites'
  }
  return filter.siteGroups.flatMap(({ label }) => label).join(', ')
}

const displayDate = (filter: DetectionFilter) => {
  return formatDateRange(filter.dateStartLocal, filter.dateEndLocal)
}

const getFilterColor = (idx: number) => {
  return store.datasetColors[idx]
}

const openPopup = (idx: number): void => {
  isOpenModal.value = true
  isAddSelected.value = false
  selectedFilterId.value = idx
  modalFilter.value = filters[selectedFilterId.value]
}

const closePopup = (): void => {
  isOpenModal.value = false
}

const getTaxonFilterText = (idx: number) => {
  const taxonClasses = filters[idx].taxonClasses
  if (taxonClasses.length === 0) {
    return 'All taxon'
  }
  if (taxonClasses.length === 1) {
    return `Taxon: ${taxonClasses[0].commonName}`
  }
  return `+ ${taxonClasses.length} taxons applied`
}

const addFilterConfig = () => {
  // Copy previous filter
  const previousFilter = filters[filters.length - 1]
  modalFilter.value = { ...previousFilter }

// Open modal
  isAddSelected.value = true
  isOpenModal.value = true
}

const removeFilterConfig = (idx: number): void => {
  filters.splice(idx, 1)
  if (filters.length === 0) {
    filters.push(defaultFilter.value)
  }
  emitSelect()
}

const apply = (filter: DetectionFilter): void => {
  const newFilter = { ...filter }
  if (isAddSelected.value) {
    filters.push(newFilter)
    isAddSelected.value = false
  } else {
    filters.splice(selectedFilterId.value, 1, newFilter)
    selectedFilterId.value = -1
  }
  emitSelect()
}

</script>
