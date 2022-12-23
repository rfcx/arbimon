<template>
  <tr class="border-b border-box-grey">
    <td
      scope="row"
      class="w-2/10 px-6 py-4 align-text-top"
    >
      <router-link
        v-if="props.job.progress.status === 30"
        :to="{ name: ROUTE_NAMES.cnnJobDetail, params: { jobId: props.job.id }}"
        class="hover:underline"
      >
        {{ props.job.modelName }} <br>
        <span class="text-subtle text-sm">
          Job#{{ props.job.id }}
        </span>
      </router-link>
      <div
        v-else
        class="text-subtle text-sm"
        title="In Progress"
      >
        <div>{{ props.job.modelName }}</div>
        Job#{{ props.job.id }}
      </div>
    </td>
    <td class="w-3/10 px-6 py-4 align-text-top w-80">
      <job-input
        :total-duration-minutes="props.job.totalDurationMinutes"
        :job-input="props.job.input"
      />
    </td>
    <td class="w-2/10 w-48 px-6 py-4 align-text-top">
      <span>{{ formatDateLocal(props.job.createdAt) }}</span>
    </td>
    <td class="w-1/10 px-6 py-4 align-text-top">
      <job-progress
        :job-progress="props.job.progress"
      />
    </td>
    <td class="w-1/10 px-6 py-4  align-text-top">
      <span
        v-if="canCancelJob && !isLoadingPostStatus"
        class="mx-auto"
      >
        <button>
          <icon-fa-trash
            class="cursor-pointer"
            @click="cancelJob"
          />
        </button>
      </span>
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
import { ROUTE_NAMES } from '~/router'
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
