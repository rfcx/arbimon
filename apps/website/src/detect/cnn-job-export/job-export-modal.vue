<template>
  <div
    :id="ID"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-160 max-h-full">
      <div class="relative p-6 bg-white rounded-lg shadow dark:bg-moss">
        <div class="flex flex-col gap-4">
          <h2>Export results</h2>
          <span>All model detections export preview:</span>
          <img
            :src="exportAllModelDetections"
            alt="Export preview"
            class="w-full object-cover rounded-lg bg-util-gray-03"
          >
          <div class="flex flex-row items-center gap-x-4 mt-4 justify-between">
            <button
              class="btn btn-secondary btn-medium"
              @click="closeModal"
            >
              Close
            </button>
            <button
              :disable="isLoadingExportDetections || isErrorExportDetections"
              class="btn btn-primary btn-medium"
              @click="requestExport"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosError, type AxiosInstance } from 'axios'
import { Modal } from 'flowbite'
import type { Ref } from 'vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import exportAllModelDetections from '@/_assets/cnn/export-all-model-detections.png'
import { apiClientKey } from '@/globals'
import { useExportDetections } from '../_composables/use-export-detections'

const ID = 'cnn-export-modal'

const props = defineProps<{isOpen: boolean}>()
const emit = defineEmits<{(event: 'emitClose'): void}>()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const modal = ref() as Ref<Modal>

const route = useRoute()
const jobId = computed(() => route.params.jobId)

const { isPending: isLoadingExportDetections, isError: isErrorExportDetections, mutate: mutateExportDetections } = useExportDetections(apiClientBio, Number(jobId.value))

onMounted(() => {
  modal.value = new Modal(document.getElementById(ID), {
    placement: 'top-center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true,
    onHide: () => {
      emit('emitClose')
    }
  })
})

watch(() => props.isOpen, (val) => {
  if (val === true) openModal()
})

const openModal = () => {
  modal.value.show()
}

const closeModal = () => {
  modal.value.hide()
  emit('emitClose')
}

const requestExport = async () => {
  // TODO: leave open util export is done
  mutateExportDetections({ types: ['all-model-detections'] }, {
    onSuccess: async () => {
      modal.value.hide()
      emit('emitClose')
    },
    onError: (e) => {
      const error = e as AxiosError<Error>
      console.error(error)

      if (error.response?.data !== undefined && error.response.data?.message.includes('already exists')) {
        console.error(error.response.data?.message)
        closeModal()
      } else {
        console.error('error')
        closeModal()
      }
    }
  })
}

</script>
