<template>
  <section class="bg-white dark:bg-echo">
    <div class="grid max-w-screen-xl px-4 mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
      <div class="mr-auto place-self-center lg:col-span-7 py-8 lg:py-24">
        <h1 class="max-w-2xl mb-4 dark:text-frequency">
          AI empowered biodiversity research & conservation action
        </h1>
        <p class="max-w-2xl mb-4 text-echo dark:text-insight">
          Unleash the full potential of your acoustic data and gain unprecedented biodiveristy insights into the natural world.
        </p>
        <p class="max-w-2xl mb-6 text-echo lg:mb-8 dark:text-insight">
          Join the global community of scientists, conservationists, and nature enthusiasts who use Arbimon to drive impactful and sustainable change.
        </p>
        <a
          v-if="toggles?.legacyLogin"
          :href="universalLoginUrl + '&screen_hint=signup'"
          class="inline-flex items-center justify-center btn btn-primary mr-3"
        >
          Start analyzing
        </a>
        <router-link
          v-else
          :to="{ name: ROUTE_NAMES.myProjects }"
          class="inline-flex items-center justify-center btn btn-primary mr-3"
        >
          Start analyzing
        </router-link>
      </div>
      <hero-media />
    </div>
  </section>
</template>
<script setup lang="ts">
import { inject } from 'vue'

import { togglesKey } from '@/globals'
import { universalLoginUrl } from '@/landing/auth0-arbimon'
import { ROUTE_NAMES } from '~/router'
import HeroMedia from './home-hero-media.vue'

const toggles = inject(togglesKey)
</script>
