<template>
  <section class="max-w-screen-xl pt-22 pl-115px pr-4">
    <job-detail-header
      :is-cancel-job-enable="isRefetchIntervalEnable"
    />
    <job-detail-information
      :is-loading-summary="isLoadingJobSummary"
      :is-error-summary="isErrorJobSummary"
      :summary="jobSummary"
      class="mt-4"
    />
    <job-detections
      :is-loading="isLoadingClassifierJob"
      :results="detectionList ?? []"
      :total="total"
      @emit-search="onEmitSearch"
      @emit-sort-paginations="onEmitSortAndPaginations"
    />
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import debounce from 'lodash.debounce'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiBioGetClassifierJobSpecies } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'
import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import { useDetectionsResultFilterStore } from '~/store'
import { useGetClassifierJobInformation } from '../_composables/use-get-job-detection-summary'
import JobDetailHeader from './components/job-detail-header.vue'
import type { ClassificationsSummaryDataset } from './components/job-detection-list.vue'
import JobDetections from './components/job-detections.vue'
import JobDetailInformation from './components/job-information.vue'

const apiClientBio = inject(apiClientKey) as AxiosInstance

const route = useRoute()
const detectionsResultFilterStore = useDetectionsResultFilterStore()

const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

const isLoadingClassifierJob = ref(false)
const isRefetch = ref<boolean>(true)
const detectionList = ref<ClassificationsSummaryDataset[]>()
const total = ref(0)

const refetchInterval = computed(() => {
  return isRefetch.value ? 30_000 : false
})

const { isLoading: isLoadingJobSummary, isError: isErrorJobSummary, data: jobSummary, refetch: refetchJobSummary } = useGetClassifierJobInformation(
  apiClientBio,
  jobId.value,
  refetchInterval
)

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

onMounted(async () => {
  await getClassifierJobSpecies(pageLimit, 0)
})

const isRefetchIntervalEnable = computed(() => {
  return jobSummary.value?.status != null && (jobSummary.value.status === CLASSIFIER_JOB_STATUS.WAITING || jobSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING)
})

const pageLimit = 25

const onEmitSearch = debounce(async (keyword: string) => {
  if (keyword === '') {
    await getClassifierJobSpecies(pageLimit, 0)
    return
  }
  await getClassifierJobSpecies(pageLimit, 0, keyword)
}, 500)

const onEmitSortAndPaginations = async (sortKey?: string, pageIndex?: number) => {
  let index = 0
  if (pageIndex !== null) {
    index = (pageIndex ?? 0) - 1
  }
  await getClassifierJobSpecies(pageLimit, index * pageLimit, undefined, sortKey)
}

const getClassifierJobSpecies = async (limit?: number, offset?: number, q?: string, sort?: string) => {
  isLoadingClassifierJob.value = true
  const response = await apiBioGetClassifierJobSpecies(apiClientBio, jobId.value, { q, sort, limit, offset })
  isLoadingClassifierJob.value = false

  if (response?.data === undefined) return
  total.value = response?.total ?? 0
  detectionList.value = []
  detectionList.value = response?.data.map(d => {
    return {
      value: d.value,
      title: d.title,
      image: d.image,
      unvalidated: d.unvalidated,
      rejected: d.notPresent,
      uncertain: d.unknown,
      confirmed: d.present
    }
  })
}
</script>
