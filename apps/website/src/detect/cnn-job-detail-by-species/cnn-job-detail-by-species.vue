<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) xl:(pl-33 pr-20)">
    <div>
      <JobDetailHeader :species-name="jobResultsSummary?.title" />
      <JobValidationHeader
        :is-loading="isLoadingClassifierInfo"
        :is-loading-filter="isLoadingDetectionSummary || isRefetchingDetectionSummary || isLoadingJobDetections"
        :species-name="jobResultsSummary?.title"
        :detections-count="jobResultsSummary?.total"
        :filtered-result="filteredResult"
        :page-size="pageSizeLimit"
        @emit-page-size="onEmitPageSize"
        @emit-filter-changed="onEmitFilterChanged"
      />
      <JobValidationStatus
        :is-loading="isLoadingDetectionSummary || isRefetchingDetectionSummary || isLoadingBestDetectionsSummary || isRefetchBestDetectionsSummary"
        :unvalidated="summary?.unvalidated"
        :uncertain="summary?.unknown"
        :rejected="summary?.notPresent"
        :confirmed="summary?.present"
      />
      <JobDetections
        v-model:page="page"
        :is-loading="isLoadingJobDetections || isLoadingBestDetections || isRefetchBestDetections"
        :is-error="isErrorJobDetections || isErrorBestDetections"
        :data-best-detections="bestDetectionsData?.data"
        :data="jobDetectionResponse?.data"
        :page-size="pageSizeLimit"
        :selected-grouping="selectedGrouping"
        :max-page="maxPage"
        @emit-validation-result="onEmitValidateResult"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { type GetBestDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type GetBestDetectionsSummaryQueryParams } from '@rfcx-bio/common/api-bio/cnn/best-detections-summary'
import { type ValidationStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type GetDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/detections'
import type { GetDetectionsSummaryQueryParams } from '@rfcx-bio/common/api-bio/cnn/detections-summary'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { useGetBestDetections, useGetBestDetectionsSummary } from '@/detect/_composables/use-get-best-detections'
import { apiClientKey } from '@/globals'
import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import { useGetClassifierJobInfo, useGetDetectionsSummary, useGetJobDetections } from '../_composables/use-get-detections'
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobValidationHeader from './components/job-validation-header.vue'
import JobValidationStatus from './components/job-validation-status.vue'

const route = useRoute()
const pageSizeLimit = ref<number>(25)

const apiClientBio = inject(apiClientKey) as AxiosInstance
const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)
const speciesSlug = computed(() => typeof route.params.speciesSlug === 'string' ? route.params.speciesSlug : '')
const page = ref(1)
const selectedGrouping = ref<string>()
const numberOfBestScores = ref<number>(5)

const refetchInterval = computed(() => {
  return isRefetchIntervalEnable.value ? 30_000 : false
})
const offset = computed<number>(() => {
  return (page.value - 1) * pageSizeLimit.value
})

const classifierId = computed(() => {
  return jobResultsSummary.value?.classifierId
})

// API: job info (species, query range, etc.)
const { data: jobResultsSummary, isLoading: isLoadingClassifierInfo } = useGetClassifierJobInfo(apiClientBio, jobId.value, speciesSlug.value)
const bestPerFilterApplied = computed(() => selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite')

watch(jobResultsSummary, async (newValue) => {
  if (newValue === null || newValue === undefined) {
    return
  }

  detectionsResultFilterBySpeciesStore.updateStartEndRanges(newValue.queryStart, newValue.queryEnd, 7)
  detectionsResultFilterBySpeciesStore.updateCustomSitesList(newValue.streams)
})

const detectionsQueryParams = computed<GetDetectionsQueryParams>(() => {
  return {
    start: detectionsResultFilterBySpeciesStore.selectedStartRange,
    end: detectionsResultFilterBySpeciesStore.selectedEndRange,
    reviewStatus: detectionsResultFilterBySpeciesStore.filter.validationStatuses,
    sites: detectionsResultFilterBySpeciesStore.filter.siteIds,
    classifierJobId: jobId.value,
    classification: speciesSlug.value,
    confidence: detectionsResultFilterBySpeciesStore.filter.minConfidence,
    classifierId: classifierId.value,
    limit: pageSizeLimit.value,
    offset: offset.value
  } as GetDetectionsQueryParams
})

const isRefetchIntervalEnable = computed(() => {
  return jobResultsSummary.value?.status != null && jobResultsSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING
})

// API: detections for the species in the job

const { isLoading: isLoadingJobDetections, isError: isErrorJobDetections, data: jobDetectionResponse, refetch: refetchJobDetections } = useGetJobDetections(
  apiClientBio,
  detectionsQueryParams,
  computed(() => jobResultsSummary.value?.classifierId != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== '' && !bestPerFilterApplied.value),
  refetchInterval
)

// API: summary of detections for the species in the job

const detectionsSummaryQueryParams = computed<GetDetectionsSummaryQueryParams>(() => {
  return {
    start: detectionsResultFilterBySpeciesStore.selectedStartRange,
    end: detectionsResultFilterBySpeciesStore.selectedEndRange,
    reviewStatus: detectionsResultFilterBySpeciesStore.filter.validationStatuses,
    sites: detectionsResultFilterBySpeciesStore.filter.siteIds,
    classifierJobId: jobId.value,
    classification: speciesSlug.value,
    classifierId: classifierId.value,
    confidence: detectionsResultFilterBySpeciesStore.filter.minConfidence
  } as GetDetectionsSummaryQueryParams
})

const { isLoading: isLoadingDetectionSummary, isRefetching: isRefetchingDetectionSummary, data: detectionsSummary, refetch: refetchDetectionSummary } = useGetDetectionsSummary(
  apiClientBio,
  detectionsSummaryQueryParams,
  computed(() => jobResultsSummary.value?.classifierId != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== '' && !bestPerFilterApplied.value),
  refetchInterval
)

const bestDetectionsQueryParams = computed<GetBestDetectionsQueryParams>(() => {
  return {
    nPerStream: numberOfBestScores.value,
    byDate: selectedGrouping.value === 'topScorePerSitePerDay',
    reviewStatus: detectionsResultFilterBySpeciesStore.filter.validationStatuses,
    sites: detectionsResultFilterBySpeciesStore.filter.siteIds,
    limit: pageSizeLimit.value,
    offset: offset.value
  }
})
const { isLoading: isLoadingBestDetections, isError: isErrorBestDetections, data: bestDetectionsData, refetch: refetchBestDetectionsData, isRefetching: isRefetchBestDetections } = useGetBestDetections(apiClientBio, jobId.value, bestDetectionsQueryParams, computed(() => false), bestPerFilterApplied)

const bestDetectionsSummaryQueryParams = computed<GetBestDetectionsSummaryQueryParams>(() => {
  return {
    nPerStream: numberOfBestScores.value,
    byDate: selectedGrouping.value === 'topScorePerSitePerDay',
    reviewStatus: detectionsResultFilterBySpeciesStore.filter.validationStatuses,
    sites: detectionsResultFilterBySpeciesStore.filter.siteIds
  }
})
const { isLoading: isLoadingBestDetectionsSummary, data: bestDetectionsSummary, refetch: refetchBestDetectionsSummary, isRefetching: isRefetchBestDetectionsSummary } = useGetBestDetectionsSummary(apiClientBio, jobId.value, bestDetectionsSummaryQueryParams, bestPerFilterApplied)

const summary = computed((): Omit<ValidationStatus, 'total'> => {
  return {
    unvalidated: detectionsResultFilterBySpeciesStore.reviewSummary?.unvalidated ?? -1,
    unknown: detectionsResultFilterBySpeciesStore.reviewSummary?.unknown ?? -1,
    notPresent: detectionsResultFilterBySpeciesStore.reviewSummary?.notPresent ?? -1,
    present: detectionsResultFilterBySpeciesStore.reviewSummary?.present ?? -1
  }
})

const total = computed<number>(() => {
  const t = summary.value.unvalidated + summary.value.unknown + summary.value.notPresent + summary.value.present
  return t < 0 ? -1 : t
})

const maxPage = computed<number>(() => {
  return Math.ceil(Number(total.value) / pageSizeLimit.value)
})

const filteredResult = computed<number>(() => {
  return total.value ?? -1
})

// update the review summary based on the detection summary
watchEffect(() => {
  if (bestPerFilterApplied.value) {
    detectionsResultFilterBySpeciesStore.updateReviewSummaryFromDetectionSummary(bestDetectionsSummary.value)
  } else {
    detectionsResultFilterBySpeciesStore.updateReviewSummaryFromDetectionSummary(detectionsSummary.value)
  }
})

const onEmitPageSize = async (pageSize: number) => {
  pageSizeLimit.value = pageSize
  page.value = 1 // reset the page to 1 when the page size is changed

  if (bestPerFilterApplied.value) {
    await refetchBestDetectionsData()
    await refetchBestDetectionsSummary()
  }
}

const onEmitFilterChanged = async (groupType: string | undefined, displayBestScores: number) => {
  selectedGrouping.value = groupType
  numberOfBestScores.value = displayBestScores
  page.value = 1

  if (bestPerFilterApplied.value) {
    await refetchBestDetectionsData()
    await refetchBestDetectionsSummary()
  } else {
    await refetchDetectionSummary()
  }
}

watch(() => page.value, async () => {
  if (bestPerFilterApplied.value) {
    await refetchBestDetectionsData()
    await refetchBestDetectionsSummary()
  }
})

const onEmitValidateResult = async () => {
  // if filter is applied, update the summary review status (from api)
  if (detectionsResultFilterBySpeciesStore.filter.validationStatuses.length > 0) {
    setTimeout(async () => {
      // the refetch will only work for any filter applied
      if (bestPerFilterApplied.value) {
        await refetchBestDetectionsData()
        await refetchBestDetectionsSummary()
      } else {
        await refetchJobDetections()
        await refetchDetectionSummary()
      }
    }, 500) // workaround to wait for the detection summary to be updated in the database
  }
}

onBeforeUnmount(() => {
  detectionsResultFilterBySpeciesStore.resetFilter()
})

</script>
