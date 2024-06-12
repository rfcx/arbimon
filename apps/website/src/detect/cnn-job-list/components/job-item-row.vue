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
            @click="openCancelModal()"
          />
        </button>
      </span>
    </td>
  </tr>

  <div
    :id="'cnn-cancel-job-modal' + job.id"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-100 max-h-full">
      <div class="relative p-6 bg-white rounded-lg shadow dark:bg-moss">
        <div class="flex flex-col">
          <div class="flex items-start justify-between">
            <div class="rounded-full bg-util-gray-01 p-3">
              <icon-fa-trash
                class="text-ibis"
              />
            </div>
            <button
              type="button"
              data-modal-toggle="cnn-cancel-job-modal"
              title="Cancel"
              @click="closeModal"
            >
              <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
            </button>
          </div>
          <div class="mt-6 w-full text-cloud">
            <h2>Cancel job</h2>
            <p class="mt-2">
              Are you sure you want to cancel this job? <br>
              Any progress made will be lost and this action cannot be undone.
            </p>
          </div>
          <div class="flex flex-row justify-center items-center mt-8 gap-x-4">
            <button
              data-modal-hide="cnn-cancel-job-modal"
              type="button"
              class="btn btn-secondary text-sm flex flex-row justify-center px-6 py-3 w-56"
              @click="closeModal"
            >
              <span>No, keep running</span>
            </button>
            <button
              data-modal-target="cnn-cancel-job-modal"
              data-modal-toggle="cnn-cancel-job-modal"
              type="button"
              class="btn bg-ibis flex flex-row text-sm text-insight justify-center px-6 py-3 w-49"
              @click="cancelJob()"
            >
              <span>Yes, cancel job</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import type { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import { Modal } from 'flowbite'
import type { Ref } from 'vue'
import { computed, inject, ref } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import { apiClientKey } from '@/globals'
import useDateFormat from '~/hooks/use-date-format'
import { ROUTE_NAMES } from '~/router'
import { FETCH_CLASSIFIER_JOBS_KEY } from '../../_composables/use-classifier-jobs'
import { usePostClassifierJobStatus } from '../../_composables/use-post-classifier-job-status'
import type { Job } from '../../types'
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

const modal = ref() as Ref<Modal>

const cancelJob = async (): Promise<void> => {
  mutatePostStatus({ status: CLASSIFIER_JOB_STATUS.CANCELLED }, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FETCH_CLASSIFIER_JOBS_KEY] }),
    onError: () => openErrorMessage()
  })
  closeModal()
}

const openCancelModal = () => {
  modal.value = new Modal(document.getElementById('cnn-cancel-job-modal' + props.job.id), {
    placement: 'top-center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
  modal.value.show()
}

const closeModal = () => {
  modal.value.hide()
}

</script>
