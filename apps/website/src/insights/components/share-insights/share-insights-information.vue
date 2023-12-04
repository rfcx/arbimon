<template>
  <div
    :id="MODAL_ID"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="fixed top-0 right-0 z-50 hidden w-full mx-auto max-w-screen-2xl pt-24 pr-12 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-1xl max-h-full rounded-lg shadow">
      <!-- Modal content -->
      <div class="relative bg-moss rounded-lg shadow">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-3 border-b rounded-t border-insight">
          <h3 class="text-base font-medium text-frequency">
            Share Insights
          </h3>
          <button
            type="button"
            class="bg-transparent rounded-lg text-sm w-6 h-6 ml-auto inline-flex justify-center items-center"
            data-modal-hide="share-insight-information-modal"
            @click="$emit('emit-close-modal')"
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
          <h3 class="text-white text-xl font-medium font-sans leading-7 mb-4">
            Share Insights to the Arbimon community
          </h3>
          <p class="text-base text-white font-normal font-sans leading-normal mb-0.5">
            Showcase your project on Arbimon's <router-link
              class="text-frequency hover:underline"
              :to="{ name: ROUTE_NAMES.myProjects }"
            >
              Projects
            </router-link>. You will have a unique sharable link.
          </p>
          <p class="text-base text-white font-normal font-sans leading-normal mb-0.5">
            Public projects enable open collaboration, improve ecological knowledge, and facilitate break through discoveries around the world.
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
            data-modal-hide="share-insight-information-modal"
            type="button"
            class="btn btn-primary w-full text-black"
            @click="showInsightsConfirm"
          >
            Share Insights <icon-custom-ft-globe class="inline-flex w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { Modal } from 'flowbite'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { apiClientKey } from '@/globals'
import { useUpdateInsightsPublishStatus } from '@/insights/_composables/use-update-insights-publish-status'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const apiClientBio = inject(apiClientKey) as AxiosInstance
const store = useStore()
const selectedProjectId = computed(() => store.selectedProject?.id)

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{(event: 'emit-close-modal'): void, (event: 'emit-share-insight-successful'): void}>()

const modal = ref<Modal | null>(null)
const { mutate: mutateInsightsPublishStatus } = useUpdateInsightsPublishStatus(apiClientBio, selectedProjectId)

const MODAL_ID = 'share-insights-information-modal'

onBeforeRouteLeave(() => {
  modal.value?.hide()
})

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    modal.value?.show()
    return
  }

  modal.value?.hide()
})

onMounted(() => {
  modal.value = new Modal(document.getElementById(MODAL_ID), {
    placement: 'top-right',
    backdrop: 'static',
    backdropClasses: 'bg-box-gray bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
})

const showInsightsConfirm = (): void => {
  mutateInsightsPublishStatus(true, {
    onSuccess: () => {
      emit('emit-share-insight-successful')
    },
    onError: () => {
      // TODO: do nothing and show some error.
    }
  })
}
</script>
