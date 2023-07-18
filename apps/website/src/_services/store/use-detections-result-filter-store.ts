import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type ValidationFilterConfig } from '@/detect/cnn-job-detail/components/types'
import { type ResultFilterInner, type ValidationResultFilterInner, sortByOptions, validationStatus } from './detections-constants'
import { useStoreOutsideSetup } from './index'

/**
 * A store to store the settings value between the modal and the full page components
 * of the cnn result page.
 */
export const useDetectionsResultFilterStore = defineStore('cnn-result-filter', () => {
  const store = useStoreOutsideSetup()
  const route = useRoute()

  const filter = ref<ValidationFilterConfig>({
    threshold: 50,
    validationStatus: 'all',
    taxonClass: '',
    siteIds: [],
    sortBy: 'asc'
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
    filter.value.sortBy = 'asc'

    // "drain" all values out of the array
    while (filter.value.siteIds.length > 0) {
      filter.value.siteIds.pop()
    }
  })

  const validationStatusFilterOptions = computed<ValidationResultFilterInner[]>(() => {
    return validationStatus
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
    return sortByOptions
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
