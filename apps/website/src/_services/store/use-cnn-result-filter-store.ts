import { ValidationFilterConfig } from '@/detect/cnn-job-detail/components/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStoreOutsideSetup } from './index'

export interface ResultFilterInner {
  label: string
  value: string
}

export type ResultFilterList = Array<{ label: string, items: Array<ResultFilterInner> }>

export const useCnnResultFilterStore = defineStore('cnn-result-filter', () => {
  const store = useStoreOutsideSetup()
  const filter = ref<ValidationFilterConfig>({
    threshold: 50,
    validationStatus: '',
    taxonClass: '',
    siteIds: [],
    sortBy: ''
  })

  const updateResultFilter = (value: ValidationFilterConfig): void => {
    filter.value.threshold = value.threshold
    filter.value.validationStatus = value.validationStatus
    filter.value.taxonClass= value.taxonClass
    filter.value.siteIds = value.siteIds
    filter.value.sortBy = value.sortBy
  }

  const formatThreshold = computed(() => {
    return filter.value.threshold / 100
  })

  const validationStatusFilterOptions = computed<Array<ResultFilterInner>>(() => {
    return [
      {
        label: 'All',
        value: '3'
      },
      {
        label: 'Unvalidated',
        value: '2'
      },
      {
        label: 'Present',
        value: '1'
      },
      {
        label: 'Not present',
        value: '-1'
      },
      {
        label: 'Unknown',
        value: '0'
      }
    ]
  })

  const classFilterOptions = computed<Array<ResultFilterInner>>(() => {
    return store.projectFilters?.taxonClasses.map(tc => {
      return {
        label: tc.commonName,
        value: tc.id.toString()
      }
    }) ?? []
  })

  const sitesFilterOptions = computed<Array<ResultFilterInner>>(() => {
    return store.projectFilters?.locationSites.map(ls => {
      return {
        label: `${ls.name} (${ls.id})`,
        value: ls.id.toString()
      }
    }) ?? []
  })

  const sortByFilterOptions = computed<Array<ResultFilterInner>>(() => {
    return [
      {
        label: 'Low to high',
        value: 'asc'
      },
      {
        label: 'High to low',
        value: 'desc'
      }
    ]
  })

  const resultFilter = computed(() => filter.value)

  return {
    filter,
    updateResultFilter,
    resultFilter,
    validationStatusFilterOptions,
    classFilterOptions,
    sitesFilterOptions,
    sortByFilterOptions,
    formatThreshold
  }
})
