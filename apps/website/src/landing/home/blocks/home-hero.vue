<template>
  <section class="bg-white dark:bg-echo">
    <div class="grid max-w-screen-xl px-4 mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
      <div class="mr-auto place-self-center lg:col-span-7 py-8 lg:py-24">
        <h1 class="max-w-2xl mb-4 text-2xl leading-10 md:text-3xl xl:text-4xl dark:text-frequency">
          AI empowered biodiversity research & conservation action
        </h1>
        <p class="max-w-2xl mb-4 text-echo md:text-base lg:text-lg dark:text-insight">
          Unleash the full potential of your acoustic data and gain unprecedented biodiveristy insights into the natural world.
        </p>
        <p class="max-w-2xl mb-6 text-echo lg:mb-8 md:text-base lg:text-lg dark:text-insight">
          Join the global community of scientists, conservationists, and nature enthusiasts who use Arbimon to drive impactful and sustainable change.
        </p>
        <a
          href="#"
          class="inline-flex items-center justify-center btn btn-primary"
        >
          Start analyzing
        </a>
        <router-link
          :to="{ name: ROUTE_NAMES.landingFeatured }"
          class="inline-flex items-center justify-center btn btn-secondary"
        >
          Learn more about our work
        </router-link>
      </div>
      <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
        <img
          class="object-center object-cover w-full h-full"
          src="@/_assets/landing/species-image.png"
          alt="Sound of the Fire-tufted Barbet (Psilopogon pyrolophus)"
        >
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
</script>
