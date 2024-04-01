<template>
  <section class="max-w-screen-xl pt-22 pl-115px pr-4">
    <div>
      <JobDetailHeader :species-name="speciesName" />
      <JobValidationHeader
        :species-name="speciesName"
        :detections-count="jobDetections?.length"
        :filtered-result="jobDetections?.length"
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
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type GetDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/detections'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import { useGetJobDetections } from '../_composables/use-get-detections'
import { useGetJobDetectionSummary } from '../_composables/use-get-job-detection-summary'
import { useGetJobValidationResults } from '../_composables/use-get-job-validation-results'
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobValidationHeader from './components/job-validation-header.vue'
import JobValidationStatus from './components/job-validation-status.vue'

const route = useRoute()
const PAGE_SIZE_LIMIT = 100

const apiClientBio = inject(apiClientKey) as AxiosInstance
const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)
const speciesSlug = computed(() => typeof route.params.speciesSlug === 'string' ? route.params.speciesSlug : '')
const page = ref(1)

const isRefetch = ref<boolean>(true)

const refetchInterval = computed(() => {
  return isRefetch.value ? 30_000 : false
})

const { data: jobSummary, refetch: refetchJobSummary } = useGetJobDetectionSummary(
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
  },
  refetchInterval
)

const { data: jobResults } = useGetJobValidationResults(apiClientBio, jobId.value, { fields: ['classifications_summary'] }, refetchInterval)

watch(jobSummary, async (newValue) => {
  isRefetch.value = isRefetchIntervalEnable.value
  if (newValue == null) {
    await refetchJobSummary()
    return
  }

  // chunk dates to query to chunk of 7 days
  detectionsResultFilterBySpeciesStore.updateStartEndRanges(newValue.queryStart, newValue.queryEnd, 7)
  detectionsResultFilterBySpeciesStore.updateCustomSitesList(newValue.streams)
})

const speciesName = computed(() => {
  if (speciesSlug.value === '' || jobResults.value == null) {
    return ''
  }

  const found = jobResults.value.classificationsSummary.find(c => c.value === speciesSlug.value)

  if (found == null) {
    return ''
  }

  return `${found.title} (${found.value})`
})

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

const classifierId = computed(() => {
  return jobSummary.value?.classifierId
})

const detectionsQueryParams = computed<GetDetectionsQueryParams>(() => {
  return {
    start: detectionsResultFilterBySpeciesStore.selectedStartRange,
    end: detectionsResultFilterBySpeciesStore.selectedEndRange,
    reviewStatus: detectionsResultFilterBySpeciesStore.filter.validationStatus === 'all' ? undefined : detectionsResultFilterBySpeciesStore.filter.validationStatus,
    sites: detectionsResultFilterBySpeciesStore.filter.siteIds,
    classifierJobId: jobId.value,
    classification: speciesSlug.value,
    confidence: detectionsResultFilterBySpeciesStore.filter.minConfidence,
    classifierId: classifierId.value,
    limit: PAGE_SIZE_LIMIT,
    offset: offset.value
  } as GetDetectionsQueryParams
})

const isRefetchIntervalEnable = computed(() => {
  return jobSummary.value?.status != null && jobSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING
})

const { isLoading: isLoadingJobDetections, isError: isErrorJobDetections, data: jobDetections } = useGetJobDetections(
  apiClientBio,
  detectionsQueryParams,
  computed(() => jobSummary.value?.id != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== ''),
  refetchInterval
)
</script>
