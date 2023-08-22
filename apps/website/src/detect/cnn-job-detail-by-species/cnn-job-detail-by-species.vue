<template>
  <div>
    <JobDetailHeader />
    <JobFilterOptions
      :species-name="species?.outputClassName"
      :species-count="100"
    />
    <JobValidationStatus />
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
import { lowerCase, snakeCase } from 'lodash-es'
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'

import type { ClassifierParams, ClassifierResponse } from '@rfcx-bio/common/api-bio/classifiers/classifier'
import type { DetectDetectionsQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientBioKey } from '@/globals'
import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import { useClassifier } from '../_composables/use-classifier'
import { useGetJobDetections } from '../_composables/use-get-detections'
import { useGetJobDetectionSummary } from '../_composables/use-get-job-detection-summary'
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobFilterOptions from './components/job-filter-options.vue'
import JobValidationStatus from './components/job-validation-status.vue'

type ClassifierOutput<A> = A extends readonly (infer T)[] ? T : never

const route = useRoute()
const PAGE_SIZE_LIMIT = 10

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
      'classifier'
    ]
  }
)

const classifierParams = computed<ClassifierParams>(() => {
  return {
    classifierId: jobSummary.value != null ? jobSummary.value.classifierId.toString() : '-1'
  }
})
const enabled = computed(() => classifierParams.value != null)
const { data: classifierOutputs } = useClassifier(apiClientBio, classifierParams, { fields: ['outputs'] }, enabled)

const species = computed<ClassifierOutput<ClassifierResponse['outputs']> | undefined>(() => {
  return classifierOutputs.value?.outputs?.find(c => snakeCase(lowerCase(c.outputClassName)) === speciesSlug.value)
})

const offset = computed<number>(() => {
  return page.value * PAGE_SIZE_LIMIT
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
} = useGetJobDetections(apiClientBio, jobId.value, params, computed(() => species.value?.classificationId != null), jobDetectionsRefetchInterval)
</script>
