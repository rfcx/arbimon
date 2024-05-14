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
        :unvalidated="isBestDetections ? bestDetectionsSummary?.unvalidated ?? -1 : detectionsSummary?.unvalidated ?? -1"
        :uncertain="isBestDetections ? bestDetectionsSummary?.unknown ?? -1 : detectionsSummary?.unknown ?? -1"
        :rejected="isBestDetections ? bestDetectionsSummary?.notPresent ?? -1 : detectionsSummary?.notPresent ?? -1"
        :confirmed="isBestDetections ? bestDetectionsSummary?.present ?? -1 : detectionsSummary?.present ?? -1"
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
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type GetBestDetectionsSummaryQueryParams } from '@rfcx-bio/common/api-bio/cnn/best-detections-summary'
import { type GetBestDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/best-detections'
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

const { data: jobResultsSummary, isLoading: isLoadingClassifierInfo } = useGetClassifierJobInfo(apiClientBio, jobId.value, speciesSlug.value)

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

const { isLoading: isLoadingJobDetections, isError: isErrorJobDetections, data: jobDetectionResponse } = useGetJobDetections(
  apiClientBio,
  detectionsQueryParams,
  computed(() => jobResultsSummary.value?.classifierId != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== ''),
  refetchInterval
)

// summary of detections for the species in the job

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
  computed(() => jobResultsSummary.value?.classifierId != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== '')
)

const bestDetectionsQueryParams = computed<GetBestDetectionsQueryParams>(() => {
  return {
    nPerStream: numberOfBestScores.value,
    byDate: selectedGrouping.value === 'topScorePerSitePerDay',
    limit: pageSizeLimit.value,
    offset: offset.value
  }
})
const { isLoading: isLoadingBestDetections, isError: isErrorBestDetections, data: bestDetectionsData, refetch: refetchBestDetectionsData, isRefetching: isRefetchBestDetections } = useGetBestDetections(apiClientBio, jobId.value, bestDetectionsQueryParams, computed(() => 30_000), computed(() => selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite'))

const bestDetectionsSummaryQueryParams = computed<GetBestDetectionsSummaryQueryParams>(() => {
  return {
    nPerStream: numberOfBestScores.value,
    byDate: selectedGrouping.value === 'topScorePerSitePerDay',
  }
})
const { isLoading: isLoadingBestDetectionsSummary, data: bestDetectionsSummary, refetch: refetchBestDetectionsSummary, isRefetching: isRefetchBestDetectionsSummary } = useGetBestDetectionsSummary(apiClientBio, jobId.value, bestDetectionsSummaryQueryParams, computed(() => selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite'))
const isBestDetections= computed(() => selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite')

const maxPage = computed<number>(() => {
  if (selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite') {
    return Math.ceil(Number(bestDetectionsData.value?.total)/pageSizeLimit.value)
  } else {
    return Math.ceil(Number(jobDetectionResponse.value?.total)/pageSizeLimit.value)
  }
})

const filteredResult = computed<number>(() => {
  if (selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite') {
    return bestDetectionsData.value?.total ?? -1
  } else {
    return jobDetectionResponse.value?.total ?? -1
  }
})

const onEmitPageSize = (pageSize: number) => {
  pageSizeLimit.value = pageSize
}

const onEmitFilterChanged = async (groupType: string | undefined, displayBestScores: number) => {
  selectedGrouping.value = groupType
  numberOfBestScores.value = displayBestScores
  page.value = 1

  if (selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite') {
    await refetchBestDetectionsData()
    await refetchBestDetectionsSummary()
  } else {
    await refetchDetectionSummary()
  }
}

const onEmitValidateResult = async () => {
  setTimeout(async () => {
    await refetchDetectionSummary()
  }, 500) // workaround to wait for the detection summary to be updated in the database
}

</script>
