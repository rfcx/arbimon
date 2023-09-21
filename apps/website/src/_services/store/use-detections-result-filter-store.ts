import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { chunkDates } from '@rfcx-bio/utils/dates'

import { type ValidationFilterConfig } from '@/detect/cnn-job-detail/components/types'
import { type ResultFilterInner, type ValidationResultFilterInner, sortByOptions, validationStatus } from './detections-constants'
import { useStoreOutsideSetup } from './index'

dayjs.extend(isSameOrAfter)

interface ClassifierOutputList { title: string, value: string }

/**
 * A store to store the settings value between the modal and the full page components
 * of the cnn result page.
 */
export const useDetectionsResultFilterStore = defineStore('cnn-result-filter', () => {
  const store = useStoreOutsideSetup()
  const route = useRoute()

  const classifierOutputList = ref<ClassifierOutputList[]>([])

  const startRange = ref('')
  const endRange = ref('')
  const startEndRanges = ref<Array<{ start: string, end: string }>>([])

  const updateClassifierOutputList = (classes: ClassifierOutputList[] | undefined): void => {
    classifierOutputList.value = classes ?? []
  }

  const updateStartEndRanges = (start: string, end: string, rangeInDays: number): void => {
    startRange.value = start
    endRange.value = end

    const range = chunkDates(start, end, rangeInDays)
    startEndRanges.value = range
  }

  const filter = ref<ValidationFilterConfig>({
    threshold: 50,
    validationStatus: 'all',
    classification: 'all',
    siteIds: [],
    sortBy: 'asc',
    range: 'all'
  })

  const customSitesList = ref<DetectSummaryResponse['streams']>([])

  const updateCustomSitesList = (list: DetectSummaryResponse['streams']): void => {
    customSitesList.value = list
  }

  const updateResultFilter = (value: ValidationFilterConfig): void => {
    filter.value.threshold = value.threshold
    filter.value.validationStatus = value.validationStatus
    filter.value.classification = value.classification
    filter.value.siteIds = value.siteIds
    filter.value.sortBy = value.sortBy
    filter.value.range = value.range
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
    filter.value.classification = 'all'
    filter.value.sortBy = 'asc'
    filter.value.range = 'all'

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
    if (filter.value.range === 'all') {
      return startRange.value
    }

    return dayjs(filter.value.range.split('|')[0]).format('YYYY-MM-DD')
  })

  const selectedEndRange = computed<string>(() => {
    if (filter.value.range === 'all') {
      return endRange.value
    }

    return dayjs(filter.value.range.split('|')[1]).format('YYYY-MM-DD')
  })

  const classFilterOptions = computed<ResultFilterInner[]>(() => {
    return [{ label: 'All', value: 'all' }, ...classifierOutputList.value.map(output => {
      return {
        label: `${output.title} (${output.value})`,
        value: output.value
      }
    })] ?? [{ label: 'All', value: 'all' }]
  })

  const sitesFilterOptions = computed<ResultFilterInner[]>(() => {
    if (customSitesList.value.length === 0) {
      return store.projectFilters?.locationSites.map(ls => {
        return {
          label: `${ls.name} (${ls.idCore})`,
          value: ls.idCore.toString()
        }
      }) ?? []
    }

    return customSitesList.value.map(cs => {
      return {
        label: `${cs.name} (${cs.id})`,
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
    validationStatusFilterOptions,
    classFilterOptions,
    sitesFilterOptions,
    sortByFilterOptions,
    formatThreshold,
    formattedThreshold,
    classifierOutputList,
    updateClassifierOutputList,
    customSitesList,
    updateCustomSitesList,
    startEndRanges,
    updateStartEndRanges,
    startEndRangeFilterOptions,
    selectedStartRange,
    selectedEndRange
  }
})
