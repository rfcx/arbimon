<template>
  <div
    :id="ID"
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
              <icon-fa-trash class="text-ibis" />
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
              @click="confirmCancel"
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
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue'

const props = defineProps<{ jobId: number, isOpen: boolean}>()
const emit = defineEmits<{(e: 'confirmCancel'): void, (event: 'emitClose'): void }>()

const ID = 'cnn-cancel-job-modal'
const modal = ref() as Ref<Modal>

const confirmCancel = () => {
  emit('confirmCancel')
  closeModal()
}

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
  if (val === true) {
    openModal()
  }
})

const openModal = () => {
  modal.value.show()
}

const closeModal = () => {
  modal.value.hide()
  emit('emitClose')
}
</script>
