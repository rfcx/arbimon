<template>
  <section class="bg-white dark:bg-pitch py-8 lg:(pt-50 pb-20)">
    <div class="px-4 flex justify-between items-center lg:px-6 mx-auto max-w-screen-xl">
      <div class="px-8 md:px-4">
        <button
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
      <div class="flex items-start gap-4 flex-col md:flex-row">
        <img
          src="@/_assets/landing/testimonials/fi_quote.svg"
          alt="Quote"
          class="mx-auto lg:mr-10"
        >
        <div class="max-w-screen-sm">
          <h1 class="mb-4 tracking-tight text-gray-900 dark:text-frequency">
            What our users & partners are saying...
          </h1>
          <h4 class="text-base text-lg lg:text-2xl">
            “{{ feedbacks[currentFeedbackIndex].text }}”
          </h4>
          <div class="mt-8 flex">
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
                class="font-medium text-gray-600 dark:text-gray-300"
              > {{ feedbacks[currentFeedbackIndex].user.name.charAt(0) }}</span>
            </div>
            <div class="flex flex-col">
              <div class="mb-2 flex flex-col-reverse md:flex-row items-start gap-2">
                <span class="text-gray-900 dark:text-insight">
                  {{ feedbacks[currentFeedbackIndex].user.name }}
                </span>
                <span class="px-2 py-1 rounded-full text-xs uppercase bg-util-gray-02 text-spoonbill font-eyebrow tracking-wide">
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
  <section class="bg-hero-testimonial bg-cover bg-top bg-no-repeat">
    <div class="bg-gradient-to-b from-transparent to-pitch/[.6]">
      <div class="py-10 lg:(pt-30 pb-50 px-10) mx-auto max-w-screen-xl px-4">
        <h1 class="mb-20 lg:mb-16 tracking-tight leading-tight text-center text-gray-900 dark:text-insight">
          Trusted by 100+ organizations<br> around the world
        </h1>
        <div
          class="grid grid-cols-4 gap-4 text-gray-500 md:grid-cols-6 lg:grid-cols-9 dark:text-gray-400"
          :aria-expanded="!isCollapsed"
        >
          <img
            v-for="(partner, index) in partners"
            :key="partner.name"
            :src="partner.imageUrl"
            :alt="partner.name"
            class="w-28 h-28 object-center object-contain"
            :class="index > 23 && isCollapsed ? 'hidden lg:block' : ''"
          >
        </div>
        <button
          class="text-center w-full font-display mt-10 mx-auto lg:hidden"
          :aria-expanded="!isCollapsed"
          @click="isCollapsed = !isCollapsed"
        >
          {{ isCollapsed ? 'And more...' : 'Show less' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import { feedbacks } from '../data/feedbacks'
import { partners } from '../data/partners'

const currentFeedbackIndex = ref<number>(0)
const isCollapsed = ref<boolean>(true)

</script>
