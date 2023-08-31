import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type ValidationFilterConfig } from '@/detect/cnn-job-detail/components/types'
import { type ResultFilterInner, type ValidationResultFilterInner, sortByOptions, validationStatus } from './detections-constants'
import { useStoreOutsideSetup } from './index'

/**
 * Very similar store for separate species page, this is used to sync between the modal settings and
 * the full page settings for querying new detections. This differs from `./use-detections-result-filter-store.ts`
 * that this store does not have options to select classifier outputs. Because it's already selected.
 */
export const useDetectionsResultFilterBySpeciesStore = defineStore('cnn-result-filter-by-species', () => {
  const store = useStoreOutsideSetup()
  const route = useRoute()

  const filter = ref<Omit<ValidationFilterConfig, 'classification'> & { classification?: string }>({
    threshold: 50,
    validationStatus: 'all',
    siteIds: [],
    sortBy: 'asc'
  })

  const updateResultFilter = (value: Omit<ValidationFilterConfig, 'classification'> & { classification?: string }): void => {
    filter.value.threshold = value.threshold
    filter.value.validationStatus = value.validationStatus
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
    filter.value.sortBy = 'asc'

    // "drain" all values out of the array
    while (filter.value.siteIds.length > 0) {
      filter.value.siteIds.pop()
    }
  })

  const validationStatusFilterOptions = computed<ValidationResultFilterInner[]>(() => {
    return validationStatus
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

  return {
    filter,
    updateResultFilter,
    formatThreshold,
    formattedThreshold,
    validationStatusFilterOptions,
    sitesFilterOptions,
    sortByFilterOptions
  }
})
