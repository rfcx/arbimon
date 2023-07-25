<template>
  <job-detail-header />
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
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'

import type { DetectDetectionsQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import { apiClientBioKey } from '@/globals'
import { useDetectionsResultFilterStore } from '~/store'
import { useGetJobDetections } from '../_composables/use-get-detections'
import { useGetJobDetectionSummary } from '../_composables/use-get-job-detection-summary'
import { useGetJobValidationResults } from '../_composables/use-get-job-validation-results'
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobDetailInformation from './components/job-information.vue'
import JobDetailResult from './components/job-result.vue'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const route = useRoute()
const detectionsResultFilterStore = useDetectionsResultFilterStore()

const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

// these two queries below will run simultaneously
const { isLoading: isLoadingJobSummary, isError: isErrorJobSummary, data: jobSummary } = useGetJobDetectionSummary(
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
      'query_hours'
    ]
  }
)

const { isLoading: isLoadingJobResults, isError: isErrorJobResults, data: jobResults } = useGetJobValidationResults(apiClientBio, jobId.value, { fields: ['classifications_summary'] })

const queryStart = computed(() => jobSummary.value?.queryStart ?? '')
const queryEnd = computed(() => jobSummary.value?.queryEnd ?? '')
const classifierId = computed(() => jobSummary.value?.classifierId)

// Just a simple check that the returned value contains some data.
const enabled = computed(() => jobSummary.value?.classifierId != null)

// This query will run after `useGetJobDetectionSummary`
const params = computed<DetectDetectionsQueryParams>(() => ({
  start: queryStart.value,
  end: queryEnd.value,
  sites: detectionsResultFilterStore.filter.siteIds,
  classifications: detectionsResultFilterStore.filter.classification === 'all' || detectionsResultFilterStore.filter.classification === '' ? undefined : [detectionsResultFilterStore.filter.classification],
  minConfidence: detectionsResultFilterStore.formattedThreshold,
  reviewStatuses: detectionsResultFilterStore.filter.validationStatus === 'all' ? undefined : [detectionsResultFilterStore.filter.validationStatus],
  classifiers: [classifierId.value ?? -1],
  descending: detectionsResultFilterStore.filter.sortBy === 'desc'
}))

const { isLoading: isLoadingDetections, isError: isErrorDetections, data: detections } = useGetJobDetections(apiClientBio, jobId.value, params, enabled)
</script>
