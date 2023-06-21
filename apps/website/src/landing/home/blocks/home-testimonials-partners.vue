<template>
  <section class="bg-white dark:bg-pitch">
    <div class="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-frequency">
          What our partners have to say
        </h2>
      </div>
      <figure class="py-12 px-64 rounded-xl bg-gray-100 dark:bg-gray-300">
        <svg
          class="h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600"
          viewBox="0 0 24 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"
            fill="currentColor"
          />
        </svg>
        <blockquote>
          <p class="text-2xl text-gray-800 dark:text-gray-900">
            "Arbimon has revolutionized the way we conduct acoustic research. With its user-friendly interface, we can now easily collect, analyze, and collaborate on biodiversity data to drive meaningful change and protect our planet's precious ecosystems."
          </p>
        </blockquote>
        <figcaption class="flex items-center justify-center mt-6 space-x-3">
          <img
            class="w-12 h-12 rounded-full"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gouch.png"
            alt="profile picture"
          >
          <div class="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
            <div class="pr-3 text-gray-800 dark:text-gray-900">
              Andry Ford
            </div>
            <div class="pl-3 font-light text-gray-700 dark:text-gray-800">
              Chief Scientist at Ikenfell
            </div>
          </div>
        </figcaption>
      </figure>
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
            class="hover:text-gray-900 dark:hover:text-white"
          >
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import partners from '@/_assets/landing/testimonials/partners/data.json'

</script>
