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
      <!-- Deactivated variant: project exceeds the deletion threshold -->
      <template v-if="isDisabled">
        <p class="mt-4 text-sm text-util-gray-01">
          Project deletion isn't available for projects with more than {{ deleteMaxRecordings?.toLocaleString() ?? 'the allowed number of' }} recordings<span v-if="recordingCount !== null && recordingCount !== undefined"> (this project has {{ recordingCount.toLocaleString() }})</span>.
          To delete this project, please contact support.
        </p>
        <div class="flex flex-row items-center mt-4">
          <button
            type="button"
            disabled
            class="btn flex flex-row py-2 bg-util-gray-04 text-util-gray-02 cursor-not-allowed"
            :title="`Project deletion isn't available for projects with more than ${deleteMaxRecordings?.toLocaleString() ?? 'the allowed number of'} recordings`"
          >
            Delete project
            <icon-fa-trash
              class="ml-2"
            />
          </button>
        </div>
      </template>
      <!-- Active variant: type-to-confirm deletion -->
      <div
        v-else
        class="flex flex-row items-center mt-4"
      >
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
                      This will permanently delete the project, its sites, recordings, and analysis results.
                    </p>
                    <p>This action cannot be undone.</p>
                    <p class="mt-4 text-sm">
                      To confirm, type
                      <span class="font-medium select-all break-all">{{ projectSlug }}</span>
                      in the box below:
                    </p>
                    <input
                      v-model="confirmationText"
                      type="text"
                      autocomplete="off"
                      autocapitalize="off"
                      spellcheck="false"
                      class="mt-2 w-full rounded-md border border-util-gray-03 bg-pitch px-3 py-2 text-sm text-insight placeholder:text-util-gray-02 focus:(border-flamingo ring-flamingo)"
                      :placeholder="projectSlug"
                    >
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
                    class="btn flex flex-row text-insight justify-center px-6 py-3 w-49"
                    :class="isConfirmationValid ? 'bg-ibis' : 'bg-util-gray-04 text-util-gray-02 cursor-not-allowed'"
                    :disabled="!isConfirmationValid"
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
import { type Ref, computed, nextTick, onMounted, ref, watch } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = defineProps<{
  isDeleting?: boolean
  isError?: boolean
  isSuccess?: boolean
  /** slug the user must type to arm the delete button (type-to-confirm) */
  projectSlug?: string
  /** deactivated variant: project exceeds the deletion threshold */
  isDisabled?: boolean
  recordingCount?: number | null
  deleteMaxRecordings?: number
}>()
const emit = defineEmits<{(e: 'emitProjectDelete'): void}>()

const modal = ref() as Ref<Modal>
const confirmationText = ref('')

// Type-to-confirm (common practice, e.g. GitHub repo deletion): the delete
// button stays disabled until the user types the exact project slug.
const isConfirmationValid = computed(() => {
  const slug = props.projectSlug ?? ''
  return slug !== '' && confirmationText.value.trim() === slug
})

watch(() => props.isSuccess, (val) => {
  if (val === true) closeModal()
})

const initModal = (): void => {
  const el = document.getElementById('project-delete-modal')
  if (el === null) return
  modal.value = new Modal(el, {
    placement: 'top-center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
}

onMounted(() => {
  if (props.isDisabled === true) return
  initModal()
})

// The active variant's modal markup only renders once capabilities load
// (isDisabled flips true -> false after the async fetch), which can happen
// AFTER onMounted — re-init the modal when that occurs.
watch(() => props.isDisabled, async (disabled) => {
  if (disabled !== true && modal.value === undefined) {
    await nextTick()
    initModal()
  }
})

const openModalToDeleteProject = (): void => {
  if (modal.value === undefined) initModal()
  confirmationText.value = ''
  modal.value?.show()
}

const accessToDelete = (): void => {
  if (!isConfirmationValid.value) return
  emit('emitProjectDelete')
}

const closeModal = (): void => {
  confirmationText.value = ''
  modal.value?.hide()
}

</script>
