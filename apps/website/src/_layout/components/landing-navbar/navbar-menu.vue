<template>
  <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
    <li>
      <router-link
        :to="{ name: ROUTE_NAMES.landingFeatured }"
        exact-active-class="tab-active"
        class="block tab"
      >
        Featured work
      </router-link>
    </li>
    <li>
      <router-link
        :to="{ name: ROUTE_NAMES.landingHowItWorks }"
        exact-active-class="tab-active"
        class="block tab"
      >
        How it works
      </router-link>
    </li>
    <li v-if="toggles?.explore">
      <router-link
        :to="{ name: ROUTE_NAMES.explore }"
        exact-active-class="tab-active"
        class="block tab"
      >
        Explore
      </router-link>
    </li>
    <li>
      <router-link
        :to="{ name: ROUTE_NAMES.landingTeam }"
        exact-active-class="tab-active"
        class="block tab"
      >
        About us
      </router-link>
    </li>
    <li>
      <button
        id="dropdownResourcesButton"
        data-dropdown-toggle="dropdownResources"
        data-dropdown-trigger="hover"
        class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-medium text-gray-700 md:m-2 md:p-0 md:w-auto lg:m-0 dark:text-insight dark:hover:text-frequency"
      >
        Resources <svg
          class="w-4 h-4 ml-1"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        /></svg>
      </button>
      <!-- Dropdown menu -->
      <div
        id="dropdownResources"
        class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-moss dark:divide-moss border-0"
      >
        <ul
          class="py-2 text-gray-700 dark:text-insight"
          aria-labelledby="dropdownResourcesButton"
        >
          <li>
            <router-link
              :to="{ name: ROUTE_NAMES.landingFAQ }"
              exact-active-class="!text-gray-900 !dark:text-insight"
              class="block px-4 py-2 dark:text-insight dark:hover:text-frequency"
            >
              FAQ
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ name: ROUTE_NAMES.landingPublications }"
              exact-active-class="!text-gray-900 !dark:text-insight"
              class="block px-4 py-2 dark:text-insight dark:hover:text-frequency"
            >
              Publications
            </router-link>
          </li>
        </ul>
        <div class="py-2">
          <a
            href="https://support.rfcx.org"
            class="block px-4 py-2 text-gray-700 dark:text-insight dark:hover:text-frequency"
          >Help &amp; support <icon-custom-linkout class="inline ml-1" /></a>
          <router-link
            :to="{ name: ROUTE_NAMES.landingContact }"
            exact-active-class="!text-gray-900 !dark:text-insight"
            class="block px-4 py-2 text-gray-700 dark:text-insight dark:hover:text-frequency"
          >
            Contact us
          </router-link>
        </div>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { inject } from 'vue'

import { togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'

const toggles = inject(togglesKey)
</script>
