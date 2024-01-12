<template>
  <div class="flex flex-col gap-y-6">
    <h5>
      Danger Zone
    </h5>
    <div>
      <div class="flex flex-row">
        <span class="font-medium">Delete project</span>
        <icon-i-info
          tooltip-id="project-settings-project-image"
          :tooltip-text="'Delete project'"
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
          <icon-fas-spinner
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
          <div class="relative w-full max-w-2/5 max-h-full">
            <div class="relative p-6 bg-white rounded-lg shadow dark:bg-moss">
              <div class="flex flex-col gap-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col gap-y-3">
                    <h2>Delete project</h2>
                  </div>
                  <button
                    type="button"
                    data-modal-toggle="project-delete-modal"
                    @click="closeModal"
                  >
                    <icon-custom-fi-close-thin class="cursor-pointer" />
                  </button>
                </div>
                <div class="w-full">
                  Are you sure you want to delete this project?
                </div>
                <div class="flex flex-row justify-end items-center gap-x-4">
                  <span
                    v-if="isError"
                    class="text-sm text-red-800 dark:text-flamingo"
                    role="alert"
                  >
                    <span class="font-medium">Failed to delete project.</span>
                  </span>
                  <button
                    data-modal-target="project-delete-modal"
                    data-modal-toggle="project-delete-modal"
                    type="button"
                    class="btn btn-danger flex flex-row py-2"
                    @click="accessToDelete"
                  >
                    I accept
                    <icon-fas-spinner
                      v-if="isDeleting"
                      class="animate-spin ml-2"
                    />
                    <icon-fa-trash
                      v-else
                      class="ml-2 cursor-pointer"
                    />
                  </button>
                  <button
                    data-modal-hide="species-highlighted-modal"
                    type="button"
                    class="btn btn-secondary flex flex-row py-2"
                    @click="closeModal"
                  >
                    Decline
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
