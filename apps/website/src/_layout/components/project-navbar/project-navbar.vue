<template>
  <nav class="w-full bg-white dark:bg-echo border-frequency border-b-1 fixed top-0 left-0 z-50">
    <div class="px-4 lg:px-6 py-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start">
          <button
            data-drawer-target="sidebar"
            data-drawer-toggle="sidebar"
            aria-controls="sidebar"
            data-drawer-backdrop="false"
            type="button"
            class="inline-flex items-center py-1 px-2 mx-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:focus:ring-gray-600"
          >
            <span class="sr-only">Open sidebar</span>
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              />
            </svg>
          </button>
          <router-link
            :to="{ name: ROUTE_NAMES.landingHome }"
            class="flex items-center min-w-58"
          >
            <brand-logo />
          </router-link>
        </div>
        <div class="flex items-center">
          <div
            class="hidden justify-between items-center md:flex md:w-auto"
          >
            <ul class="flex flex-col mt-4 font-medium md:flex-row md:space-x-8 md:mt-0">
              <li v-if="toggles?.explore">
                <router-link
                  :to="{ name: ROUTE_NAMES.explore }"
                  class="block py-2 pr-4 pl-3 md:p-0 text-gray-700 dark:text-insight"
                >
                  Projects
                </router-link>
              </li>
            </ul>
          </div>
          <auth-navbar-item
            class="ml-8"
            dom-id="project-navbar-auth-desktop"
          />
        </div>
      </div>
    </div>
  </nav>
</template>
<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { inject, onMounted } from 'vue'

import { togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import BrandLogo from '../brand-logo.vue'
import AuthNavbarItem from '../landing-navbar/auth-navbar-item/auth-navbar-item.vue'

const toggles = inject(togglesKey)

onMounted(() => {
  initDropdowns()
})
</script>
