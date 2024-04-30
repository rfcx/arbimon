import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { chunkDates } from '@rfcx-bio/utils/dates'

import { type ValidationFilterConfig } from '@/detect/cnn-job-detail/components/types'
import { type ResultFilterInner, type ValidationResultFilterInner, sortByOptions, validationStatus } from './detections-constants'
// import { useStoreOutsideSetup } from './index'

/**
 * Very similar store for separate species page, this is used to sync between the modal settings and
 * the full page settings for querying new detections. This differs from `./use-detections-result-filter-store.ts`
 * that this store does not have options to select classifier outputs. Because it's already selected.
 */
export const useDetectionsResultFilterBySpeciesStore = defineStore('cnn-result-filter-by-species', () => {
  // const store = useStoreOutsideSetup()
  const route = useRoute()

  const customSitesList = ref<DetectSummaryResponse['streams']>([])

  const updateCustomSitesList = (list: DetectSummaryResponse['streams']): void => {
    customSitesList.value = list
  }

  const startRange = ref('')
  const endRange = ref('')
  const startEndRanges = ref<Array<{ start: string, end: string }>>([])

  const filter = ref<Omit<ValidationFilterConfig, 'classification'> & { classification?: string }>({
    threshold: 50,
    validationStatus: 'all',
    siteIds: [],
    sortBy: 'asc',
    range: 'all',
    minConfidence: 0.1
  })

  const updateResultFilter = (value: Omit<ValidationFilterConfig, 'classification'> & { classification?: string }): void => {
    filter.value.threshold = value.threshold
    filter.value.validationStatus = value.validationStatus
    filter.value.siteIds = value.siteIds
    filter.value.sortBy = value.sortBy
    filter.value.range = value.range
    filter.value.minConfidence = value.minConfidence
  }

  const updateStartEndRanges = (start: string, end: string, rangeInDays: number): void => {
    startRange.value = start
    endRange.value = end

    const range = chunkDates(start, end, rangeInDays)
    startEndRanges.value = range
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
    filter.value.range = 'all'
    filter.value.minConfidence = 0.1

    // "drain" all values out of the array
    while (filter.value.siteIds.length > 0) {
      filter.value.siteIds.pop()
    }
  })

  const validationStatusFilterOptions = computed<ValidationResultFilterInner[]>(() => {
    return validationStatus
  })

  const startEndRangeFilterOptions = computed<ResultFilterInner[]>(() => {
    return [{ label: 'All', value: 'all' }, ...startEndRanges.value.map(range => {
      return {
        label: `${range.start} - ${range.end}`,
        value: `${range.start}|${range.end}`
      }
    })]
  })

  const selectedStartRange = computed<string>(() => {
    if (startRange.value === '' || endRange.value === '') { return '' }
    const timeStartOfDay = 'T00:00:00Z'
    if (filter.value.range === 'all') {
      return startRange.value + timeStartOfDay
    }
    return dayjs(filter.value.range.split('|')[0]).format('YYYY-MM-DD') + timeStartOfDay
  })

  const selectedEndRange = computed<string>(() => {
    if (startRange.value === '' || endRange.value === '') { return '' }
    const timeEndOfDay = 'T23:59:59Z'
    if (filter.value.range === 'all') {
      return endRange.value + timeEndOfDay
    }

    return dayjs(filter.value.range.split('|')[1]).format('YYYY-MM-DD') + timeEndOfDay
  })

  const sitesFilterOptions = computed<ResultFilterInner[]>(() => {
    // if (customSitesList.value.length === 0) {
    //   return store.projectFilters?.locationSites.map(ls => {
    //     return {
    //       label: ls.name,
    //       value: ls.idCore.toString()
    //     }
    //   }) ?? []
    // }

    return customSitesList.value.map(cs => {
      return {
        label: cs.name,
        value: cs.id
      }
    })
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
    sortByFilterOptions,
    customSitesList,
    updateCustomSitesList,
    startEndRangeFilterOptions,
    selectedStartRange,
    selectedEndRange,
    updateStartEndRanges
  }
})
