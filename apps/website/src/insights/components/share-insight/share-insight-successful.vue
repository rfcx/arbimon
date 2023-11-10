<template>
  <div
    id="share-insight-successfully"
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
            data-modal-hide="share-insight-successfully"
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
        <div class="px-4 py-6 space-y-3">
          <h3 class="text-frequency text-base font-medium font-sans leading-normal">
            This page is now live on Arbimon's Directory.
          </h3>
          <input
            type="text"
            readonly
            class="p-4 bg-pitch text-insight w-full border border-insight rounded-lg focus:border-frequency focus:outline-none"
            :value="arbimonLink"
          >
          <p class="text-base text-white font-normal font-sans leading-normal mb-0.5">
            This project is searchable on Arbimon's Directory and is visible to anyone.
          </p>
        </div>
        <!-- Modal footer -->
        <div class="flex flex-col gap-y-3 items-center px-4 pb-6 rounded-b">
          <button
            type="button"
            class="btn btn-primary w-full text-pitch"
            @click="copy(arbimonLink)"
          >
            {{ copied ? 'Link copied' : 'Copy link' }} <icon-custom-fi-link class="inline-flex w-5 h-5 text-pitch" />
          </button>
          <router-link
            type="button"
            target="_blank"
            class="btn btn-secondary w-full"
            :to="{ name: ROUTE_NAMES.overview }"
          >
            View as guest (opens new tab)
          </router-link>
          <button
            type="button"
            class="btn btn-secondary w-full"
            @click="$emit('emit-hide-insight')"
          >
            Hide Insight to non-project members
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Modal } from 'flowbite'
import { computed, onMounted, ref, watch } from 'vue'

import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{(event: 'emit-close-modal'): void, (event: 'emit-hide-insight'): void}>()

const store = useStore()

const arbimonLink = computed((): string => {
  return `${import.meta.env.VITE_ARBIMON_BASE_URL}/p/${store.selectedProject?.slug ?? ''}`
})

const { copy, copied } = useClipboard({ source: arbimonLink })

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
  modal.value = new Modal(document.getElementById('share-insight-successfully'), {
    placement: 'top-right',
    backdrop: 'static',
    backdropClasses: 'bg-box-gray bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
})
</script>
