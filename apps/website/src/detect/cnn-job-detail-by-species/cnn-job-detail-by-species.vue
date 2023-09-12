<template>
  <div>
    <JobDetailHeader />
    <JobFilterOptions
      :species-name="speciesSlug"
      :species-count="speciesCount?.total ?? 0"
    />
    <JobValidationStatus
      :total="speciesCount?.total ?? 0"
      :uncertain="speciesCount?.uncertain ?? 0"
      :rejected="speciesCount?.rejected ?? 0"
      :confirmed="speciesCount?.confirmed ?? 0"
    />
    <JobDetections
      v-model:page="page"
      :is-loading="isLoadingJobDetections"
      :is-error="isErrorJobDetections"
      :data="jobDetections"
      :page-size="PAGE_SIZE_LIMIT"
    />
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { DetectDetectionsQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientBioKey } from '@/globals'
import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import { useGetJobDetections } from '../_composables/use-get-detections'
import { useGetJobDetectionSummary } from '../_composables/use-get-job-detection-summary'
import { useGetJobValidationResults } from '../_composables/use-get-job-validation-results'
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobFilterOptions from './components/job-filter-options.vue'
import JobValidationStatus from './components/job-validation-status.vue'

const route = useRoute()
const PAGE_SIZE_LIMIT = 100

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)
const speciesSlug = computed(() => typeof route.params.speciesSlug === 'string' ? route.params.speciesSlug : '')
const page = ref(1)

const { data: jobSummary } = useGetJobDetectionSummary(
  apiClientBio,
  jobId.value,
  {
    fields: [
      'id',
      'classifier_id',
      'query_start',
      'query_end',
      'status',
      'classifier',
      'streams'
    ]
  }
)

watch(jobSummary, (newValue) => {
  if (newValue == null) {
    return
  }

  detectionsResultFilterBySpeciesStore.updateCustomSitesList(newValue.streams)
})

const { data: jobResults } = useGetJobValidationResults(apiClientBio, jobId.value, { fields: ['classifications_summary'] })

const speciesCount = computed(() => {
  if (jobResults.value == null) {
    return undefined
  }

  const species = jobResults.value.classificationsSummary.find(cs => cs.value === speciesSlug.value)
  return species
})

const offset = computed<number>(() => {
  return (page.value - 1) * PAGE_SIZE_LIMIT
})

const params = computed<DetectDetectionsQueryParams>(() => {
  return {
    start: jobSummary.value?.queryStart ?? '',
    end: jobSummary.value?.queryEnd ?? '',
    classifications: [speciesSlug.value],
    sites: detectionsResultFilterBySpeciesStore.filter.siteIds,
    reviewStatuses: detectionsResultFilterBySpeciesStore.filter.validationStatus === 'all' ? undefined : [detectionsResultFilterBySpeciesStore.filter.validationStatus],
    minConfidence: detectionsResultFilterBySpeciesStore.formattedThreshold,
    descending: detectionsResultFilterBySpeciesStore.filter.sortBy === 'desc',
    limit: PAGE_SIZE_LIMIT,
    offset: offset.value
  }
})

const jobDetectionsRefetchInterval = computed(() => {
  if (jobSummary.value?.status != null && jobSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING) {
    return 30_000
  }

  return false
})

const {
  isLoading: isLoadingJobDetections,
  isError: isErrorJobDetections,
  data: jobDetections
} = useGetJobDetections(apiClientBio, jobId.value, params, computed(() => jobSummary.value?.id != null), jobDetectionsRefetchInterval)
</script>
