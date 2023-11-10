<template>
  <div
    id="hide-insight-for-non-project-members"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-1xl max-h-full rounded-lg shadow">
      <!-- Modal content -->
      <div class="relative bg-moss rounded-lg shadow">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-3 border-b rounded-t border-fog">
          <h3 class="text-base font-medium text-frequency">
            Share Insight
          </h3>
          <button
            type="button"
            class="bg-transparent rounded-lg text-sm w-6 h-6 ml-auto inline-flex justify-center items-center"
            data-modal-hide="hide-insight-for-non-project-members"
            @click="closeModal"
          >
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span class="sr-only">Close share insight information modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <div class="px-4 py-6">
          <div class="flex flex-row justify-between mb-3 items-center">
            <h3 class="text-white text-xl font-medium font-sans leading-normal">
              Are you sure you want to hide insight?
            </h3>
            <icon-custom-fi-frown class="w-6 h-6" />
          </div>
          <p class="text-base text-white font-normal font-sans leading-normal mb-1">
            Public projects enable open collaboration, improve ecological knowledge, and facilitate break through discoveries around the world.
          </p>
          <p class="text-base text-white font-normal font-sans leading-normal mb-1">
            You can always share Insight again when you are ready
          </p>
          <a
            href="https://rfcx.org/privacy-policy"
            target="_self"
            rel="noopener noreferrer"
            class="text-base text-frequency font-normal font-sans leading-normal hover:underline"
          >
            Learn more about our data privacy policy
          </a>
        </div>
        <!-- Modal footer -->
        <div class="flex items-center px-4 pb-6 rounded-b">
          <button
            type="button"
            class="btn btn-secondary w-full"
            @click="$emit('emit-hide-insight-confirm')"
          >
            Hide Insight to non-project members
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{(event: 'emit-close-modal'): void, (event: 'emit-hide-insight-confirm'): void}>()

const modal = ref<Modal | null>(null)

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    modal.value?.show()
    return
  }

  modal.value?.hide()
})

const closeModal = (): void => {
  emit('emit-close-modal')
}

onMounted(() => {
  modal.value = new Modal(document.getElementById('hide-insight-for-non-project-members'), {
    placement: 'top-right',
    backdrop: 'static',
    backdropClasses: 'bg-box-gray bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
})
</script>
