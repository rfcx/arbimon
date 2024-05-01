<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) xl:(pl-33 pr-20)">
    <div>
      <JobDetailHeader :species-name="speciesClass" />
      <JobValidationHeader
        :is-loading="isLoadingDetectionSummary || isRefetchingDetectionSummary"
        :species-name="speciesClass"
        :detections-count="totalDetections"
        :filtered-result="jobDetectionResponse?.total"
        :page-size="pageSizeLimit"
        @emit-page-size="onEmitPageSize"
        @emit-filter-changed="onEmitFilterChanged"
      />
      <JobValidationStatus
        :is-loading="isLoadingDetectionSummary || isRefetchingDetectionSummary"
        :unvalidated="detectionsSummary?.unvalidated ?? -1"
        :uncertain="detectionsSummary?.unknown ?? -1"
        :rejected="detectionsSummary?.notPresent ?? -1"
        :confirmed="detectionsSummary?.present ?? -1"
      />
      <JobDetections
        v-model:page="page"
        :is-loading="isLoadingJobDetections"
        :is-error="isErrorJobDetections"
        :data="jobDetectionResponse?.data"
        :page-size="pageSizeLimit"
        :max-page="Math.ceil(Number(jobDetectionResponse?.total)/pageSizeLimit)"
        @emit-validation-result="refetchJobResults()"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiBioGetClassifierJobSpecies } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'
import { type GetDetectionsQueryParams } from '@rfcx-bio/common/api-bio/cnn/detections'
import type { GetDetectionsSummaryQueryParams } from '@rfcx-bio/common/api-bio/cnn/detections-summary'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import { useGetDetectionsSummary, useGetJobDetections } from '../_composables/use-get-detections'
import { useGetJobDetectionSummary } from '../_composables/use-get-job-detection-summary'
import { useGetJobValidationResults } from '../_composables/use-get-job-validation-results'
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
const totalDetections = ref('')
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

const { data: jobResults, refetch: refetchJobResults } = useGetJobValidationResults(apiClientBio, jobId.value, { fields: ['classifications_summary'] }, refetchInterval)

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

const speciesClass = computed(() => {
  if (speciesSlug.value === '' || jobResults.value == null) {
    return speciesSlug.value
  }

  const found = jobResults.value.classificationsSummary.find(c => c.value === speciesSlug.value)

  if (found == null) {
    return speciesSlug.value
  }
  getClassifierJobSpecies(found.title)
  return `${found.title}`
})

const speciesCount = computed(() => {
  if (jobResults.value == null) {
    return undefined
  }

  const species = jobResults.value.classificationsSummary.find(cs => cs.value === speciesSlug.value)
  return species
})

const offset = computed<number>(() => {
  return (page.value - 1) * pageSizeLimit.value
})

const classifierId = computed(() => {
  return jobSummary.value?.classifierId
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
  return jobSummary.value?.status != null && jobSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING
})

const { isLoading: isLoadingJobDetections, isError: isErrorJobDetections, data: jobDetectionResponse } = useGetJobDetections(
  apiClientBio,
  detectionsQueryParams,
  computed(() => jobSummary.value?.id != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== ''),
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

const { isLoading: isLoadingDetectionSummary, isRefetching: isRefetchingDetectionSummary, data: detectionsSummary } = useGetDetectionsSummary(
  apiClientBio,
  detectionsSummaryQueryParams,
  computed(() => jobSummary.value?.id != null && detectionsResultFilterBySpeciesStore.selectedStartRange !== '' && detectionsResultFilterBySpeciesStore.selectedEndRange !== '')
)

const onEmitPageSize = (pageSize: number) => {
  pageSizeLimit.value = pageSize
}

const getClassifierJobSpecies = async (q: string): Promise<void> => {
  const response = await apiBioGetClassifierJobSpecies(apiClientBio, jobId.value, { q })

  if (response?.data === undefined) return
  const species = response?.data[0]
  totalDetections.value = (species.unvalidated + species.notPresent + species.unknown + species.present).toString()
}

const onEmitFilterChanged = () => {
  page.value = 1
  refetchJobResults()
}

</script>
