<template>
  <div class="flex flex-col gap-y-6">
    <h4>
      Danger Zone
    </h4>
    <div>
      <div class="flex flex-row">
        <span class="font-medium text-secondary">Delete project</span>
        <icon-i-info
          tooltip-id="project-delete"
          :tooltip-text="'Delete this project permanently.'"
        />
      </div>
      <div class="flex flex-row items-center mt-4">
        <button
          data-modal-target="project-delete-modal"
          data-modal-toggle="project-delete-modal"
          type="button"
          class="btn btn-danger flex flex-row py-2"
          @click="openModalToDeleteProject"
        >
          Delete project
          <icon-custom-ic-loading
            v-if="isDeleting"
            class="animate-spin ml-2"
          />
          <icon-fa-trash
            v-else
            class="ml-2 cursor-pointer"
          />
        </button>
        <div
          id="project-delete-modal"
          data-modal-backdrop="static"
          tabindex="-1"
          aria-hidden="true"
          class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div class="relative w-full max-w-115 max-h-full">
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
                    data-modal-toggle="project-delete-modal"
                    title="Cancel"
                    @click="closeModal"
                  >
                    <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
                  </button>
                </div>
                <div class="mt-6 w-full text-cloud">
                  <h2>Delete project</h2>
                  <div v-if="!isDeleting">
                    <p class="mt-2">
                      Are you sure you want to delete this project?
                    </p>
                    <p>This action cannot be undone</p>
                  </div>
                </div>
                <div v-if="isDeleting">
                  <icon-custom-ic-loading class="my-6 mx-auto animate-spin" />
                </div>
                <div
                  v-if="isError"
                  class="bg-danger-light mt-6 flex flex-row items-center p-2 border-l-3 rounded-lg border-l-ibis"
                >
                  <p class="ml-2 text-util-gray-04 text-sm">
                    <span
                      class="text-sm font-medium"
                      role="alert"
                    >
                      A Server Error Occurred.
                    </span>
                    We encountered some issues while deleting your project. Could you please try again?
                  </p>
                </div>
                <div class="flex flex-row justify-center items-center mt-8 gap-x-4">
                  <button
                    data-modal-hide="species-highlighted-modal"
                    type="button"
                    class="btn btn-secondary flex flex-row justify-center px-6 py-3 w-49"
                    @click="closeModal"
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    data-modal-target="project-delete-modal"
                    data-modal-toggle="project-delete-modal"
                    type="button"
                    class="btn bg-ibis flex flex-row text-insight justify-center px-6 py-3 w-49"
                    @click="accessToDelete"
                  >
                    <span>Delete project</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'flowbite'
import { type Ref, onMounted, ref, watch } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = defineProps<{isDeleting?: boolean, isError?: boolean, isSuccess?: boolean}>()
const emit = defineEmits<{(e: 'emitProjectDelete'): void}>()

const modal = ref() as Ref<Modal>

watch(() => props.isSuccess, (val) => {
  if (val === true) closeModal()
})

onMounted(() => {
  modal.value = new Modal(document.getElementById('project-delete-modal'), {
    placement: 'top-center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
})

const openModalToDeleteProject = (): void => {
  modal.value.show()
}

const accessToDelete = (): void => {
  emit('emitProjectDelete')
}

const closeModal = (): void => {
  modal.value.hide()
}

</script>
