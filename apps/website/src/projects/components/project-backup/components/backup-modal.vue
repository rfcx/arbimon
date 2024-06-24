<template>
  <div
    id="backup-confirm-modal"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-136 max-h-full">
      <div class="relative p-6 bg-white rounded-lg shadow dark:bg-moss">
        <div class="flex flex-col">
          <div class="flex items-start justify-between">
            <div
              class="rounded-full bg-insight p-2.5 border-util-gray-04"
              :style="{borderWidth: '8px'}"
            >
              <icon-custom-ic-export
                class="text-black w-6 h-6"
              />
            </div>
            <button
              type="button"
              data-modal-toggle="backup-confirm-modal"
              title="Cancel"
              @click="closeModal"
            >
              <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
            </button>
          </div>
          <div
            v-if="!hasRequested"
            class="mt-6 w-full text-cloud"
          >
            <div>
              <h3 class="font-header">
                Request project backup
              </h3>
              <p class="mt-2">
                This process will take about 24 hours, depending on how large your project is. You're allowed to request a backup every 7 days.
              </p>
            </div>
            <div
              v-if="errorMessage"
              class="bg-danger-light mt-6 flex flex-row items-center p-2 border-l-3 rounded-lg border-l-ibis"
            >
              <icon-custom-alert-triangle class="h-6 w-6 cursor-pointer text-ibis" />
              <span
                class="text-sm ml-2 text-util-gray-04 font-medium"
                role="alert"
              >
                {{ errorMessage }}
              </span>
            </div>
          </div>
          <div
            v-else
            class="mt-6 w-full text-cloud"
          >
            <div>
              <h3 class="font-header">
                Backup requested
              </h3>
              <p class="mt-2">
                Your request has been received. You'll get an email notification when your backup is ready to download.
              </p>
            </div>
          </div>
          <div
            v-if="!hasRequested"
            class="flex flex-row justify-between items-center mt-8 gap-x-4"
          >
            <button
              data-modal-hide="backup-confirm-modal"
              type="button"
              class="btn btn-secondary btn-medium"
              @click="closeModal"
            >
              <span>Cancel</span>
            </button>
            <button
              data-modal-target="backup-confirm-modal"
              data-modal-toggle="backup-confirm-modal"
              type="button"
              class="rounded-full text-pitch font-medium bg-frequency w-fit px-5 py-3 text-center hover:bg-chirp flex flex-row items-center"
              @click="emit('emitRequestBackup')"
            >
              <span>Request backup</span>
              <icon-custom-ic-loading
                v-if="isLoading"
                class="ml-2 w-4 inline-flex stroke-pitch stroke-black"
              />
            </button>
          </div>
          <div
            v-else
            class="flex justify-end self-end mt-8"
          >
            <button
              data-modal-hide="backup-confirm-modal"
              type="button"
              class="btn btn-primary btn-medium w-fit"
              @click="closeModal"
            >
              <span>Close</span>
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
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{isOpen: boolean, isLoading: boolean, errorMessage?: string, hasRequested: boolean}>()
const emit = defineEmits<{(event: 'emitRequestBackup'): void, (event: 'emitClose'): void}>()

const modal = ref() as Ref<Modal>

onMounted(() => {
  modal.value = new Modal(document.getElementById('backup-confirm-modal'), {
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

const closeModal = (): void => {
  modal.value.hide()
  emit('emitClose')
}
</script>
