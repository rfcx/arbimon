<template>
  <tr class="border-b border-box-grey">
    <th
      scope="row"
      class="px-6 py-4 align-text-top"
    >
      {{ props.job.modelName }}
    </th>
    <td class="px-6 py-4 align-text-top w-80">
      <job-input
        :number-of-recordings="props.job.numberOfRecordings"
        :job-input="props.job.input"
      />
    </td>
    <td class="px-6 py-4 align-text-top">
      <span>{{ formatDateLocal(props.job.createdAt) }}</span>
    </td>
    <td class="px-6 py-4 align-text-top">
      <job-progress
        :job-progress="props.job.progress"
      />
    </td>
    <td
      v-if="canCancelJob"
      class="px-4 py-4 align-text-top"
    >
      <div>
        <icon-fa-trash
          class="cursor-pointer"
          @click="cancelJob"
        />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import { computed, inject } from 'vue'
import { useQueryClient } from 'vue-query'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientCoreKey } from '@/globals'
import useDateFormat from '~/hooks/use-date-format'
import { FETCH_CLASSIFIER_JOBS_KEY } from '../../_composables/use-classifier-jobs'
import { usePostClassifierJobStatus } from '../../_composables/use-post-classifier-job-status'
import { Job } from '../../types'
import JobInput from './job-input.vue'
import JobProgress from './job-progress.vue'

const props = defineProps<{
  job: Job
}>()

const { formatDateLocal } = useDateFormat()

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingPostStatus, mutate: mutatePostStatus } = usePostClassifierJobStatus(apiClientCore, props.job.id)

const canCancelJob = computed(() => props.job.progress.status === CLASSIFIER_JOB_STATUS.WAITING)

const openErrorMessage = () => {
  ElMessage({
    message: 'Unable to update job status',
    type: 'error'
  })
}

const queryClient = useQueryClient()

const cancelJob = async (): Promise<void> => {
  mutatePostStatus({ status: CLASSIFIER_JOB_STATUS.CANCELLED }, {
    onSuccess: () => queryClient.invalidateQueries(FETCH_CLASSIFIER_JOBS_KEY),
    onError: () => openErrorMessage()
  })
}
</script>
