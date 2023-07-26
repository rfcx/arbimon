<template>
  <section class="bg-white dark:bg-moss py-8 lg:pb-30">
    <div class="px-4 flex justify-between items-center lg:px-6">
      <div class="px-8 md:px-4">
        <button
          v-show="props.feedbacks.length > 1"
          type="button"
          @click="currentFeedbackIndex = (currentFeedbackIndex !== 0) ? currentFeedbackIndex - 1 : feedbacks.length - 1"
        >
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-frequency sm:w-10 sm:h-10 dark:text-frequency"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          /></svg>
          <span class="sr-only">Previous</span>
        </button>
      </div>
      <div class="max-w-screen-sm">
        <h2 class="text-bold text-frequency text-lg font-display">
          "{{ props.feedbacks[currentFeedbackIndex]?.text }}"
        </h2>
        <div class="mt-6 flex">
          <div class="mr-4 mb-4 relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
            <span class="font-medium text-gray-600 dark:text-gray-300"> {{ props.feedbacks[currentFeedbackIndex]?.partnerName.charAt(0) }}</span>
          </div>
          <div class="flex flex-col">
            <div class="mb-2">
              <span class="mt-8 mb-4 mr-2 text-gray-900 dark:text-insight">
                {{ props.feedbacks[currentFeedbackIndex]?.partnerName }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="px-8 md:px-4">
        <button
          v-show="props.feedbacks.length > 1"
          type="button"
          @click="currentFeedbackIndex = (currentFeedbackIndex + 1 !== props.feedbacks.length) ? currentFeedbackIndex + 1 : 0"
        >
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-frequency sm:w-10 sm:h-10 dark:text-frequency"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          /></svg>
          <span class="sr-only">Next</span>
        </button>
      </div>
    </div>
    <!-- Slider indicators -->
    <div
      v-show="props.feedbacks.length > 1"
      class="flex space-x-3 -translate-x-1/2 bottom-5 left-1/2 p-10 m-auto justify-center"
    >
      <button
        v-for="(feedback, index) in props.feedbacks"
        :key="index"
        type="button"
        class="w-2 h-2 rounded-full border-frequency border-1"
        :aria-current="currentFeedbackIndex === index"
        :aria-label="'Feedback ' + (index + 1) + ' of ' + props.feedbacks.length"
        :data-carousel-slide-to="index"
        :class="{ 'bg-frequency': currentFeedbackIndex === index }"
        @click="currentFeedbackIndex = index"
      />
    </div>
  </section>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import { type ProjectFeedback } from '../../featured/data/types'

const props = defineProps<{
  readonly feedbacks: ProjectFeedback[] | []
}>()

const currentFeedbackIndex = ref<number>(0)

</script>
