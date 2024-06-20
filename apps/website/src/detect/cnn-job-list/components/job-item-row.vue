<template>
  <tr class="border-b border-box-gray">
    <td
      scope="row"
      class="w-2/10 px-6 py-4 align-text-top"
    >
      <router-link
        :to="{ name: ROUTE_NAMES.cnnJobDetail, params: { jobId: props.job.id }}"
        class="hover:underline"
      >
        {{ props.job.modelName }} <br>
        <span class="text-subtle text-sm">
          Job#{{ props.job.id }}
        </span>
      </router-link>
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
        :status="props.job.progress.status"
        :current="props.job.progress.value"
        :total="100"
        :is-compact="true"
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
            @click="hasOpenedCancelModal = true"
          />
        </button>
      </span>
    </td>
  </tr>

  <CancelJobModal
    :job-id="props.job.id"
    :is-open="hasOpenedCancelModal"
    :emit-close="hasOpenedCancelModal=false"
    @confirmCancel="cancelJob"
  />
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import { computed, inject, ref } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import useDateFormat from '~/hooks/use-date-format'
import { ROUTE_NAMES } from '~/router'
import { FETCH_CLASSIFIER_JOBS_KEY } from '../../_composables/use-classifier-jobs'
import { usePostClassifierJobStatus } from '../../_composables/use-post-classifier-job-status'
import type { Job } from '../../types'
import CancelJobModal from './cancel-job-modal.vue'
import JobInput from './job-input.vue'
import JobProgress from './job-progress.vue'

const props = defineProps<{
  job: Job
}>()

const { formatDateLocal } = useDateFormat()

const apiClient = inject(apiClientKey) as AxiosInstance
const { isPending: isLoadingPostStatus, mutate: mutatePostStatus } = usePostClassifierJobStatus(apiClient, props.job.id)

const canCancelJob = computed(() => props.job.progress.status === CLASSIFIER_JOB_STATUS.WAITING || props.job.progress.status === CLASSIFIER_JOB_STATUS.RUNNING)

const openErrorMessage = () => {
  ElMessage({
    message: 'Unable to update job status',
    type: 'error'
  })
}

const queryClient = useQueryClient()

const cancelJob = async (): Promise<void> => {
  mutatePostStatus({ status: CLASSIFIER_JOB_STATUS.CANCELLED }, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FETCH_CLASSIFIER_JOBS_KEY] }),
    onError: openErrorMessage
  })
}

const hasOpenedCancelModal = ref(false)

</script>
