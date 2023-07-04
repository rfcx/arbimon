import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-cnn-detections'

import { type ValidationFilterConfig } from '@/detect/cnn-job-detail/components/types'
import { useStoreOutsideSetup } from './index'

export interface ValidationResultFilterInner {
  label: string
  value: ReviewStatus | 'all'
}

export interface ResultFilterInner {
  label: string
  value: string
}

export type ResultFilterList = Array<{ label: string, items: ResultFilterInner[] }>

export const useCnnResultFilterStore = defineStore('cnn-result-filter', () => {
  const store = useStoreOutsideSetup()
  const route = useRoute()

  const filter = ref<ValidationFilterConfig>({
    threshold: 50,
    validationStatus: 'all',
    taxonClass: '',
    siteIds: [],
    sortBy: ''
  })

  const updateResultFilter = (value: ValidationFilterConfig): void => {
    filter.value.threshold = value.threshold
    filter.value.validationStatus = value.validationStatus
    filter.value.taxonClass = value.taxonClass
    filter.value.siteIds = value.siteIds
    filter.value.sortBy = value.sortBy
  }

  const formatThreshold = (value: number): number => {
    return value / 100
  }

  const formattedThreshold = computed<number>(() => {
    return filter.value.threshold / 100
  })

  // reset all settings when job change.
  watch(() => route.params.jobId, () => {
    filter.value.threshold = 50
    filter.value.validationStatus = 'all'
    filter.value.taxonClass = ''
    filter.value.sortBy = ''

    // "drain" all values out of the array
    while (filter.value.siteIds.length > 0) {
      filter.value.siteIds.pop()
    }
  })

  const validationStatusFilterOptions = computed<ValidationResultFilterInner[]>(() => {
    return [
      {
        label: 'All',
        value: 'all'
      },
      {
        label: 'Rejected',
        value: 'rejected'
      },
      {
        label: 'Uncertain',
        value: 'uncertain'
      },
      {
        label: 'Confirmed',
        value: 'confirmed'
      },
      {
        label: 'Unreviewed',
        value: 'unreviewed'
      }
    ]
  })

  const classFilterOptions = computed<ResultFilterInner[]>(() => {
    return store.projectFilters?.taxonClasses.map(tc => {
      return {
        label: tc.commonName,
        value: tc.id.toString()
      }
    }) ?? []
  })

  const sitesFilterOptions = computed<ResultFilterInner[]>(() => {
    return store.projectFilters?.locationSites.map(ls => {
      return {
        label: `${ls.name} (${ls.idCore})`,
        value: ls.id.toString()
      }
    }) ?? []
  })

  const sortByFilterOptions = computed<ResultFilterInner[]>(() => {
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
    formatThreshold,
    formattedThreshold
  }
})
