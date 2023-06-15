<template>
  <section class="bg-white dark:bg-echo">
    <div class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-24 lg:grid-cols-12">
      <div class="mr-auto place-self-center lg:col-span-7">
        <h1 class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
          Empower your wildlife research with Arbimon
        </h1>
        <p class="max-w-2xl mb-4 text-gray-500 md:text-lg lg:text-xl dark:text-gray-400">
          Unleash the full potential of your acoustic data and gain unprecedented biodiveristy insights into the natural world.
        </p>
        <p class="max-w-2xl mb-6 text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
          Join the global community of scientists, conservationists, and nature enthusiasts who use Arbimon to drive impactful and sustainable change.
        </p>
        <a
          href="#"
          class="inline-flex items-center justify-center px-5 py-2 mr-3 text-base font-medium text-center text-pitch rounded-full bg-frequency hover:bg-frequency-dark focus:ring-4 focus:ring-frequency-300 dark:bg-frequency-light dark:hover:bg-frequency dark:focus:ring-frequency-900"
        >
          Start Analyzing
          <svg
            class="w-5 h-5 ml-2 -mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          /></svg>
        </a>
        <router-link
          :to="{ name: ROUTE_NAMES.landingFeatured }"
          class="inline-flex items-center justify-center px-5 py-2 text-base font-medium text-center text-frequency border border-frequency rounded-full hover:bg-frequency-100 focus:ring-4 focus:ring-frequency-100 dark:text-frequency dark:border-frequency-700 dark:hover:bg-frequency-700 dark:focus:ring-frequency-800"
        >
          Learn more about our work
        </router-link>
      </div>
      <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
        <img
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png"
          alt="mockup"
        >
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
</script>
