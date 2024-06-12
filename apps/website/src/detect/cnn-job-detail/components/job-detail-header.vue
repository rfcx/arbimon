<template>
  <div
    class="flex justify-between items-start"
  >
    <nav
      class="flex justify-between py-3"
      aria-label="Breadcrumb"
    >
      <ol class="inline-flex align-top space-x-1 md:space-x-2 rtl:space-x-reverse text-insight">
        <li class="inline-flex align-top text-sm font-display">
          <router-link
            :to="{ name: ROUTE_NAMES.cnnJobList }"
            class="inline-flex align-top hover:text-util-gray-02"
          >
            CNN Jobs
          </router-link>
        </li>
        <li class="flex align-top text-sm font-display text-insight">
          <icon-fas-chevron-right class="w-3 h-3 mr-2 mt-0.8" />
          <router-link
            :to="{ name: ROUTE_NAMES.cnnJobDetail, params: { jobId } }"
            class="inline-flex align-top hover:text-util-gray-02"
          >
            Job {{ jobId }}
          </router-link>
        </li>
      </ol>
    </nav>
    <div class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <button
        v-if="toggles?.cnnExport === true"
        class="flex flex-row justify-center items-center gap-2 btn btn-secondary btn-medium"
        @click="hasOpenedExportModal = true"
      >
        <icon-custom-ic-export class="h-4 w-4" />
        <span>Export job</span>
      </button>
      <button
        v-if="isCancelJobEnable"
        class="btn btn-danger btn-medium flex flex-row justify-center items-center"
        :class="isCanceling ? 'cursor-not-allowed' : 'cursor-pointer'"
        :disabled="isCanceling"
        @click="openCancelModal()"
      >
        <icon-custom-ic-loading
          v-if="isCanceling"
          class="h-4 w-4 animate-spin"
        />
        <span
          v-else
          class="flex flex-row justify-center items-center"
        >
          <span>Cancel job</span>
          <icon-fa-trash class="h-4 w-4 ml-2" />
        </span>
      </button>
    </div>
  </div>
  <export-modal
    v-if="toggles?.cnnExport === true"
    :is-open="hasOpenedExportModal"
    :emit-close="hasOpenedExportModal=false"
    @show-alert-dialog="alertDialog"
  />

  <div
    :id="'cnn-cancel-job-modal' + route.params.jobId"
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
              @click="emit('emitCancelJob')"
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
import { Modal } from 'flowbite'
import type { Ref } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import ExportModal from '../../cnn-job-export/job-export-modal.vue'

const route = useRoute()
const toggles = inject(togglesKey)

const jobId = computed(() => route.params.jobId)

const props = withDefaults(defineProps<{ isCancelJobEnable: boolean, isCanceling: boolean }>(), {
  isCancelJobEnable: true,
  isCanceling: false
})

const emit = defineEmits<{(e: 'emitCancelJob'): void, (e: 'showAlertDialog', messageValue: string): void}>()

const hasOpenedExportModal = ref(false)

const alertDialog = (message: string) => {
  emit('showAlertDialog', message)
}

const modal = ref() as Ref<Modal>

const openCancelModal = () => {
  modal.value = new Modal(document.getElementById('cnn-cancel-job-modal' + route.params.jobId), {
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

watch(() => props.isCanceling, (newVal) => {
  if (newVal) {
    closeModal()
  }
})
</script>
