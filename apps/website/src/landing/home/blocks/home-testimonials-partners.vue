<template>
  <section class="bg-white dark:bg-pitch py-8 lg:(pt-50 pb-20)">
    <div class="px-4 flex justify-between items-center lg:px-6 mx-auto max-w-screen-xl">
      <div class="px-8 md:px-4">
        <button
          type="button"
          class="w-full h-full items-center min-h-50"
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
      <div class="flex items-start gap-4 flex-col md:flex-row">
        <img
          src="@/_assets/landing/testimonials/fi_quote.svg"
          alt="Quote"
          class="mx-auto lg:mr-10"
        >
        <div class="max-w-screen-sm">
          <h1 class="mb-4 tracking-tight text-gray-900 dark:text-frequency">
            What Arbimon users are saying...
          </h1>
          <h4 class="text-base text-lg lg:text-2xl min-h-24 lg:min-h-40">
            “{{ feedbacks[currentFeedbackIndex].text }}”
          </h4>
          <div class="mt-8 flex min-h-30 lg:min-h-17">
            <img
              v-if="feedbacks[currentFeedbackIndex].user.profilePicUrl"
              :src="feedbacks[currentFeedbackIndex].user.profilePicUrl"
              alt="Profile picture"
              class="w-16 h-16 aspect-square object-cover rounded-full mr-4"
            >
            <div
              v-else
              class="mr-4 relative inline-flex items-center justify-center w-16 h-16 aspect-square bg-gray-100 rounded-full dark:bg-gray-600"
            >
              <span
                class="font-medium text-gray-600 dark:text-util-gray-01"
              > {{ feedbacks[currentFeedbackIndex].user.name.charAt(0) }}</span>
            </div>
            <div class="flex flex-col">
              <div class="mb-2 flex flex-col-reverse md:flex-row items-start gap-2">
                <span class="text-gray-900 dark:text-insight">
                  {{ feedbacks[currentFeedbackIndex].user.name }}
                </span>
                <span class="px-2 py-1 rounded-full text-xs uppercase bg-util-gray-03 text-spoonbill font-eyebrow tracking-wide">
                  {{ feedbacks[currentFeedbackIndex].user.role }}
                </span>
              </div>
              <span class="text-gray-500 block text-sm dark:text-insight">
                {{ feedbacks[currentFeedbackIndex].user.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="px-8 md:px-4">
        <button
          type="button"
          class="w-full h-full items-center min-h-50"
          @click="currentFeedbackIndex = (currentFeedbackIndex + 1 !== feedbacks.length) ? currentFeedbackIndex + 1 : 0"
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
    <div class="flex space-x-3 -translate-x-1/2 bottom-5 left-1/2 p-10 m-auto justify-center">
      <button
        v-for="(feedback, index) in feedbacks"
        :key="index"
        type="button"
        class="w-2 h-2 rounded-full border-frequency border-1"
        :aria-current="currentFeedbackIndex === index"
        :aria-label="'Feedback ' + (index + 1) + ' of ' + feedbacks.length"
        :data-carousel-slide-to="index"
        :class="{ 'bg-frequency': currentFeedbackIndex === index }"
        @click="currentFeedbackIndex = index"
      />
    </div>
  </section>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import { feedbacks } from '../data/feedbacks'

const currentFeedbackIndex = ref<number>(0)

</script>
