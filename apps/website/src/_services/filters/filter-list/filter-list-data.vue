<template>
  <div
    v-for="(filter, idx) in filters"
    :key="'site-card' + idx"
    class="w-48 min-w-48 mr-4 cursor-pointer rounded-xl border-white text-white text-sm opacity-100 hover:opacity-90"
    :style="{ 'border': `solid 3px ${getFilterColor(idx)}`, 'background-color': `${getFilterColor(idx)}80` }"
    @click="openPopup(idx)"
  >
    <!--TODO: 268 Show full information of filter when the user hovers over the comparison box -->
    <filter-list-item
      :filter="filter"
      :is-default-filter="isDefaultFilter"
      :color="getFilterColor(idx)"
      :taxon-filter-text="getTaxonFilterText(idx)"
      @emit-remove-config="removeFilterConfig(idx)"
    />
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
  <filter-modal
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
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { DetectionFilter } from '~/filters/types'
import { useStore } from '~/store'
import FilterModal from '../filter-modal/filter-modal.vue'
import FilterListItem from './filter-list-item.vue'

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

const filters = ref<DetectionFilter[]>([defaultFilter.value])

const emitSelect = () => {
  emits('emitSelect', filters.value)
}

onMounted(() => {
  emitSelect()
})

const isDefaultFilter = computed(() => {
  return filters.value.length === 1 && isEqual(defaultFilter.value, filters.value[0])
})

const isShowAdd = computed(() => {
  return filters.value.length < 5
})

const getFilterColor = (idx: number) => {
  return store.datasetColors[idx]
}

const openPopup = (idx: number): void => {
  isOpenModal.value = true
  isAddSelected.value = false
  selectedFilterId.value = idx
  modalFilter.value = filters.value[selectedFilterId.value]
}

const closePopup = (): void => {
  isOpenModal.value = false
}

const getTaxonFilterText = (idx: number) => {
  const taxonClasses = filters.value[idx].taxonClasses
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
  const previousFilter = filters.value[filters.value.length - 1]
  modalFilter.value = { ...previousFilter }

  // Open modal
  isAddSelected.value = true
  isOpenModal.value = true
}

const removeFilterConfig = (idx: number): void => {
  filters.value.splice(idx, 1)
  if (filters.value.length === 0) {
    filters.value.push(defaultFilter.value)
  }
  emitSelect()
}

const apply = (filter: DetectionFilter): void => {
  const newFilter = { ...filter }
  if (isAddSelected.value) {
    filters.value.push(newFilter)
    isAddSelected.value = false
  } else {
    filters.value.splice(selectedFilterId.value, 1, newFilter)
    selectedFilterId.value = -1
  }
  closePopup()
  emitSelect()
}

</script>
