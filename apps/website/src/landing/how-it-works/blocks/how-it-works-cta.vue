<template>
  <section class="bg-gray-800 dark:bg-echo border-b-1 border-b-frequency">
    <div class="py-10 px-6 mx-auto max-w-screen-xl lg:px-20 flex flex-col md:flex-row items-center gap-4">
      <div class="md:basis-2/3">
        <h2 class="mb-2 text-gray-700 dark:text-insight">
          Ready to level up your research?
        </h2>
      </div>
      <div class="md:basis-1/3 text-right">
        <a
          v-if="toggles?.legacyLogin"
          :href="universalLoginUrl + '&screen_hint=signup'"
          class="btn btn-primary"
        >
          Get started
        </a>
        <router-link
          v-else
          :to="{ name: ROUTE_NAMES.myProjects }"
          class="btn btn-primary"
        >
          Get started
        </router-link>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { inject } from 'vue'

import { togglesKey } from '@/globals'
import { universalLoginUrl } from '@/landing/auth0-arbimon'
import { ROUTE_NAMES } from '~/router'

const toggles = inject(togglesKey)
</script>
