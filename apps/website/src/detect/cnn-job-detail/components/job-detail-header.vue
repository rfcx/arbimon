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
        @click="hasOpenedCancelModal = true"
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

  <CancelJobModal
    :job-id="parsedJobId"
    :is-open="hasOpenedCancelModal"
    :emit-close="hasOpenedCancelModal=false"
    @confirmCancel="emit('emitCancelJob')"
  />
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'

import CancelJobModal from '@/detect/cnn-job-list/components/cancel-job-modal.vue'
import { togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import ExportModal from '../../cnn-job-export/job-export-modal.vue'

const route = useRoute()
const toggles = inject(togglesKey)

const jobId = computed(() => route.params.jobId)

withDefaults(defineProps<{ isCancelJobEnable: boolean, isCanceling: boolean }>(), {
  isCancelJobEnable: true,
  isCanceling: false
})

const emit = defineEmits<{(e: 'emitCancelJob'): void, (e: 'showAlertDialog', messageValue: string): void}>()

const hasOpenedExportModal = ref(false)

const alertDialog = (message: string) => {
  emit('showAlertDialog', message)
}

const hasOpenedCancelModal = ref(false)

const parsedJobId = computed(() => {
  const id = route.params.jobId
  return Array.isArray(id) ? Number(id[0]) : Number(id)
})
</script>
