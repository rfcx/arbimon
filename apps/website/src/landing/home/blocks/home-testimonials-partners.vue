<template>
  <section class="bg-white dark:bg-pitch py-8 lg:py-24">
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
          class="px-4 mx-auto md:mx-4"
        >
        <div class="max-w-screen-sm">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-frequency">
            What our partners have to say
          </h2>
          <p class="text-xl">
            "{{ feedbacks[currentFeedbackIndex].text }}"
          </p>
          <div class="mt-4 flex">
            <div class="mr-4 mb-4 relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
              <span class="font-medium text-gray-600 dark:text-gray-300"> {{ feedbacks[currentFeedbackIndex].user.name.charAt(0) }}</span>
            </div>
            <div class="flex flex-col">
              <div class="mb-2">
                <span class="mt-8 mb-4 mr-2 text-gray-900 dark:text-insight">
                  {{ feedbacks[currentFeedbackIndex].user.name }}
                </span>
                <span class="px-2 py-1 rounded-full text-sm uppercase bg-gray-600 text-spoonbill font-eyebrow tracking-wide">
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
  <section class="bg-hero-testimonial bg-cover bg-no-repeat">
    <div class="py-8 lg:py-24 mx-auto max-w-screen-xl px-4">
      <h2 class="mb-8 lg:mb-16 text-3xl font-extrabold tracking-tight leading-tight text-center text-gray-900 dark:text-white md:text-4xl">
        Trusted by 100+ organizations<br> around the world
      </h2>
      <div class="grid grid-cols-4 gap-4 text-gray-500 sm:gap-8 lg:gap-2 md:grid-cols-6 lg:grid-cols-12 dark:text-gray-400">
        <a
          v-for="partner in partners"
          :key="partner.name"
          href="#"
          class="flex justify-center items-center"
        >
          <img
            :src="partner.imageUrl"
            :alt="partner.name"
          >
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import { feedbacks } from '../data/feedbacks'
import { partners } from '../data/partners'

const currentFeedbackIndex = ref<number>(0)

</script>
