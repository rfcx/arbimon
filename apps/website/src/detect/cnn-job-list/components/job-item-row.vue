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
      {{ formatDateLocal(props.job.createdAt) }}
    </td>
    <td class="px-6 py-4 align-text-top">
      <job-progress
        :job-progress="props.job.progress"
      />
    </td>
    <td
      v-if="displayCancleButton"
      class="align-text-top"
    >
      <button
        class="btn w-20"
        :disabled="!canCancelJob || isLoadingPostStatus"
        @click="update"
      >
        <icon-fas-spinner
          v-if="isLoadingPostStatus"
          class="animate-spin inline mr-1"
        />
        <span v-else>Cancel</span>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import { computed, defineEmits, inject } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientCoreKey, togglesKey } from '@/globals'
import { FeatureToggles } from '~/feature-toggles'
import useDateFormat from '~/hooks/use-date-format'
import { usePostClassifierJobStatus } from '../../_composables/use-post-classifier-job-status'
import { Job } from '../../types'
import JobInput from './job-input.vue'
import JobProgress from './job-progress.vue'

const props = defineProps<{
  job: Job
}>()

const emit = defineEmits<{(e: 'emitUpdate'): void}>()

const { formatDateLocal } = useDateFormat()

const toggles = inject(togglesKey) as FeatureToggles
const displayCancleButton = computed(() => toggles.cnnCancelJob)

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingPostStatus, mutate: mutatedPostStatus } = usePostClassifierJobStatus(apiClientCore, props.job.id)

const canCancelJob = computed(() => props.job.progress.status === CLASSIFIER_JOB_STATUS.WAITING)

const openErrorMessage = () => {
  ElMessage({
    message: 'Unable to update job status',
    type: 'error'
  })
}

const update = async (): Promise<void> => {
  mutatedPostStatus({ status: CLASSIFIER_JOB_STATUS.CANCELLED }, {
    onSuccess: () => emit('emitUpdate'),
    onError: () => openErrorMessage()
  })
}
</script>
