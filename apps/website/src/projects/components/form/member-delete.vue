<template>
  <button
    data-modal-target="project-member-delete-modal"
    data-modal-toggle="project-member-delete-modal"
    type="button"
    class="bg-echo text-danger border-1 border-util-gray-03 rounded-lg flex flex-row items-center py-1 px-2 ml-2 disabled:hover:btn-disabled disabled:btn-disabled"
    :disabled="disabledDeleteButton"
    @click="openModalToDeleteProjectMember"
  >
    Delete <icon-fa-close class="cursor-pointer h-3 inline" />
  </button>
  <div
    id="project-member-delete-modal"
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
                class="text-flamingo"
              />
            </div>
            <button
              type="button"
              data-modal-toggle="project-member-delete-modal"
              title="Cancel"
              @click="closeModal"
            >
              <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer" />
            </button>
          </div>
          <div class="mt-6 w-full text-cloud">
            <h2>Delete member?</h2>
            <p class="mt-2">
              Are you sure you want to delete this member? You can always add them again.
            </p>
          </div>
          <div
            v-if="isError"
            class="bg-[#F5D1D6] mt-6 flex flex-row items-center p-2 border-l-3 rounded-lg border-l-[#CC1E3D]"
          >
            <icon-custom-alert-triangle class="h-6 w-6 cursor-pointer" />
            <span
              class="text-sm ml-2 text-util-gray-04 font-medium"
              role="alert"
            >
              Action failed due to system errors. Please try again.
            </span>
          </div>
          <div class="flex flex-row justify-center items-center mt-8 gap-x-4">
            <button
              data-modal-hide="species-highlighted-modal"
              type="button"
              class="btn btn-secondary text-sm flex flex-row justify-center px-6 py-3 w-49"
              @click="closeModal"
            >
              <span>Cancel</span>
            </button>
            <button
              data-modal-target="project-member-delete-modal"
              data-modal-toggle="project-member-delete-modal"
              type="button"
              class="btn bg-[#CC1E3D] flex flex-row text-sm text-insight justify-center px-6 py-3 w-49"
              @click="$emit('emitDeleteProjectMember')"
            >
              <span>Delete member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'flowbite'
import { type Ref, ref, watch } from 'vue'

const props = defineProps<{userId: number, disabledDeleteButton: boolean, isDeleting?: boolean, isError?: boolean, isSuccess?: boolean}>()
defineEmits<{(e: 'emitDeleteProjectMember'): void}>()

const modal = ref() as Ref<Modal | null>

watch(() => props.isSuccess, (val) => {
  if (val === true) closeModal()
})

const openModalToDeleteProjectMember = (): void => {
  modal.value = new Modal(document.getElementById('project-member-delete-modal'), {
    placement: 'top-center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
  modal.value.show()
}

const closeModal = (): void => {
  modal.value?.hide()
  modal.value = null
}

</script>