import { ROUTE_NAMES } from '~/router';

<template>
  <section class="bg-white dark:bg-echo">
    <div class="text-center px-8 pt-30 lg:mb-20">
      <h1 class="mb-2 tracking-tight font-medium text-gray-900 dark:text-white">
        What we do
      </h1>
      <p class="mb-6 text-gray-500 dark:text-insight max-w-3xl mx-auto">
        At Arbimon, our mission is to empower scientists and conservationists with innovative AI-powered ecoacoustic analysis tools and data-driven insights to better understand and protect the world's biodiversity.
      </p>
    </div>
    <div class="flex flex-col gap-2 flex-col-reverse md:(flex-row pb-8) pb-4 px-4 items-center mx-auto max-w-screen-xl gap-2">
      <div class="w-full max-w-240 lg:w-168 xl:w-200">
        <div class="pb-14">
          <h5 class="mb-1 font-medium">
            The platform
          </h5>
          <p class="mb-6">
            Arbimon is an ecoacoustic analysis platform empowering scientists and conservationists with an efficient way to upload, store, and analyze mass amounts of acoustic data, enabling the ability to derive insights about the ecosystem at scale.
          </p>
          <a
            v-if="toggles?.legacyLogin"
            :href="universalLoginUrl + '&screen_hint=signup'"
            class="inline-flex items-center justify-center btn btn-secondary"
          >
            Start analyzing
          </a>
          <router-link
            v-else
            :to="{ name: ROUTE_NAMES.myProjects }"
            class="inline-flex items-center justify-center btn btn-secondary"
          >
            Start analyzing
          </router-link>
        </div>
      </div>
      <div>
        <img
          class="w-full"
          src="@/_assets/landing/what-we-do.gif"
          alt="dashboard image"
        >
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
