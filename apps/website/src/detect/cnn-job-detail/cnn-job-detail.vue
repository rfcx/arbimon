<template>
  <section class="max-w-screen-xl pt-20 pl-115px pr-4">
    <job-detail-header
      :is-cancel-job-enable="isRefetchIntervalEnable"
    />
    <job-detail-information
      :is-loading-summary="isLoadingJobSummary"
      :is-error-summary="isErrorJobSummary"
      :summary="jobSummary"
      :is-loading-results="isLoadingJobResults"
      :is-error-results="isErrorJobResults"
      :results="jobResults"
      class="mt-4"
    />
    <job-detail-result
      :is-loading="isLoadingJobResults"
      :is-error="isErrorJobResults"
      :data="jobResults"
      :classifier-id="classifierId"
      class="mt-4"
    />
    <job-detections
      :is-loading="isLoadingDetections"
      :is-error="isErrorDetections"
      :data="detections"
      class="mt-4"
    />
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { DetectDetectionsQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import { useDetectionsResultFilterStore } from '~/store'
import { useGetJobDetections } from '../_composables/use-get-detections'
import { useGetJobDetectionSummary } from '../_composables/use-get-job-detection-summary'
import { useGetJobValidationResults } from '../_composables/use-get-job-validation-results'
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobDetailInformation from './components/job-information.vue'
import JobDetailResult from './components/job-result.vue'

const apiClientBio = inject(apiClientKey) as AxiosInstance

const route = useRoute()
const detectionsResultFilterStore = useDetectionsResultFilterStore()

const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

const isRefetch = ref<boolean>(true)

const refetchInterval = computed(() => {
  return isRefetch.value ? 30_000 : false
})

const { isLoading: isLoadingJobSummary, isError: isErrorJobSummary, data: jobSummary, refetch: refetchJobSummary } = useGetJobDetectionSummary(
  apiClientBio,
  jobId.value,
  {
    fields: [
      'id',
      'classifier_id',
      'project_id',
      'minutes_completed',
      'minutes_total',
      'created_by_id',
      'created_at',
      'completed_at',
      'status',
      'query_start',
      'query_end',
      'classifier',
      'query_streams',
      'query_hours',
      'streams'
    ]
  },
  refetchInterval
)
const { isLoading: isLoadingJobResults, isError: isErrorJobResults, data: jobResults } = useGetJobValidationResults(apiClientBio, jobId.value, { fields: ['classifications_summary'] }, refetchInterval)

watch(jobSummary, async (newValue) => {
  isRefetch.value = isRefetchIntervalEnable.value
  if (newValue == null) {
    await refetchJobSummary()
    return
  }

  detectionsResultFilterStore.updateCustomSitesList(newValue.streams)

  // chunk given date range to 7 days range
  detectionsResultFilterStore.updateStartEndRanges(newValue.queryStart, newValue.queryEnd, 7)
})

const isRefetchIntervalEnable = computed(() => {
  return jobSummary.value?.status != null && (jobSummary.value.status === CLASSIFIER_JOB_STATUS.WAITING || jobSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING)
})

const classifierId = computed(() => jobSummary.value?.classifierId)
const enabled = computed(() => jobSummary.value?.classifierId != null)

// This query will run after `useGetJobValidationResults`
const params = computed<DetectDetectionsQueryParams>(() => ({
  start: detectionsResultFilterStore.selectedStartRange,
  end: detectionsResultFilterStore.selectedEndRange,
  sites: detectionsResultFilterStore.filter.siteIds,
  classifications: detectionsResultFilterStore.filter.classification === 'all' || detectionsResultFilterStore.filter.classification === '' ? undefined : [detectionsResultFilterStore.filter.classification],
  minConfidence: detectionsResultFilterStore.formattedThreshold,
  reviewStatuses: detectionsResultFilterStore.filter.validationStatus === 'all' ? undefined : [detectionsResultFilterStore.filter.validationStatus],
  classifiers: [classifierId.value ?? -1],
  descending: detectionsResultFilterStore.filter.sortBy === 'desc',
  limit: 200,
  offset: 0,
  fields: [
    'id',
    'stream_id',
    'classifier_id',
    'start',
    'end',
    'confidence',
    'review_status',
    'classification'
  ]
}))

const { isLoading: isLoadingDetections, isError: isErrorDetections, data: detections } = useGetJobDetections(apiClientBio, jobId.value, params, enabled, refetchInterval)
</script>
