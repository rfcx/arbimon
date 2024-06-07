<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) xl:(pl-33 pr-20)">
    <job-detail-header
      :is-cancel-job-enable="isRefetchIntervalEnable"
      :is-canceling="isLoadingPostStatus"
      @emit-cancel-job="onEmitCancelJob"
      @show-alert-dialog="showAlertDialog"
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
      :job-status="jobSummary?.status ?? 0"
      @emit-search="onEmitSearch"
      @emit-sort-paginations="onEmitSortAndPaginations"
    />
    <alert-dialog
      v-if="showAlert"
      severity="error"
      title="Error"
      :message="message"
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
import { usePostClassifierJobStatus } from '../_composables/use-post-classifier-job-status'
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
const searchKeyword = ref<string| undefined>()
const sortKeyLabel = ref<string| undefined>('name')

const message = ref('')
const showAlert = ref(false)

const refetchInterval = computed(() => {
  return isRefetch.value ? 30_000 : false
})

const { isLoading: isLoadingJobSummary, isError: isErrorJobSummary, data: jobSummary, refetch: refetchJobSummary } = useGetClassifierJobInformation(
  apiClientBio,
  jobId.value,
  refetchInterval
)

const { isPending: isLoadingPostStatus, mutate: mutatePostStatus } = usePostClassifierJobStatus(apiClientBio, jobId.value)

watch(jobSummary, async (newValue) => {
  isRefetch.value = isRefetchIntervalEnable.value
  if (!isRefetch.value && detectionList.value === undefined) {
    await getClassifierJobSpecies(PAGE_LIMIT, 0, searchKeyword.value, sortKeyLabel.value)
  }

  if (newValue == null) {
    await refetchJobSummary()
    return
  }

  detectionsResultFilterStore.updateCustomSitesList(newValue.streams)

  // chunk given date range to 7 days range
  detectionsResultFilterStore.updateStartEndRanges(newValue.queryStart, newValue.queryEnd, 7)
})

onMounted(async () => {
  await getClassifierJobSpecies(PAGE_LIMIT, 0, searchKeyword.value, sortKeyLabel.value)
})

const isRefetchIntervalEnable = computed(() => {
  return jobSummary.value?.status != null && (jobSummary.value.status === CLASSIFIER_JOB_STATUS.WAITING || jobSummary.value.status === CLASSIFIER_JOB_STATUS.RUNNING)
})

const PAGE_LIMIT = 25

const onEmitSearch = debounce(async (keyword: string) => {
  searchKeyword.value = keyword === '' ? undefined : keyword
  await getClassifierJobSpecies(PAGE_LIMIT, 0, keyword, sortKeyLabel.value)
}, 500)

const onEmitSortAndPaginations = async (sortKey?: string, pageIndex?: number) => {
  let index = 0
  if (pageIndex !== null) {
    index = (pageIndex ?? 0) - 1
  }
  sortKeyLabel.value = sortKey
  await getClassifierJobSpecies(PAGE_LIMIT, index * PAGE_LIMIT, searchKeyword.value, sortKey)
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

const onEmitCancelJob = async () => {
  mutatePostStatus({ status: CLASSIFIER_JOB_STATUS.CANCELLED }, {
    onSuccess: () => refetchJobSummary(),
    onError: () => { /* TODO: add error */ }
  })
}

const showAlertDialog = (messageValue: string) => {
  showAlert.value = true
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, 7000)
}
</script>
