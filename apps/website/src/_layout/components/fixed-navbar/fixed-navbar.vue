<template>
  <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-steel-gray dark:border-gray-700">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start">
          <button
            data-drawer-target="logo-sidebar"
            data-drawer-toggle="logo-sidebar"
            aria-controls="logo-sidebar"
            type="button"
            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
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
            class="flex items-center"
          >
            <brand-logo />
          </router-link>
          <button
            v-if="store?.projects.length"
            class="navbar-item h-9 mx-6 px-4 hover:bg-gray-700 rounded-md cursor-pointer text-gray-700 lg:hover:text-primary-700 dark:text-gray-400 dark:hover:text-white lg:dark:hover:text-white"
            @click="toggleProjectSelector(true)"
          >
            <span class="max-w-48 truncate">{{ selectedProjectName }}</span>
            <icon-custom-angle-down class="ml-1 text-xs" />
          </button>
        </div>
        <div class="flex items-center">
          <div
            class="hidden justify-between items-center lg:flex lg:w-auto"
          >
            <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <li v-if="toggles?.explore">
                <router-link
                  :to="{ name: ROUTE_NAMES.explore }"
                  class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Explore
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: ROUTE_NAMES.explore }"
                  class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                >
                  My Projects
                </router-link>
              </li>
            </ul>
          </div>
          <div class="flex items-center ml-8">
            <div>
              <button
                type="button"
                class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                aria-expanded="false"
                data-dropdown-toggle="dropdown-user"
              >
                <span class="sr-only">Open user menu</span>
                <img
                  class="w-8 h-8 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="user photo"
                >
              </button>
            </div>
            <div
              id="dropdown-user"
              class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
            >
              <div
                class="px-4 py-3"
                role="none"
              >
                <p
                  class="text-sm text-gray-900 dark:text-white"
                  role="none"
                >
                  Neil Sims
                </p>
                <p
                  class="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                  role="none"
                >
                  neil.sims@flowbite.com
                </p>
              </div>
              <ul
                class="py-1"
                role="none"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >Dashboard</a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >Settings</a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >Earnings</a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >Sign out</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <project-selector
    v-if="hasOpenedProjectSelector"
    @emit-close="toggleProjectSelector(false)"
  />
</template>
<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import { storeKey, togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import ProjectSelector from '../project-selector/project-selector.vue'
import BrandLogo from './brand-logo.vue'

const store = inject(storeKey)
const toggles = inject(togglesKey)

const hasOpenedProjectSelector = ref(false)

const selectedProjectName = computed(() => {
  return store?.selectedProject?.name ?? 'Select Project'
})

function toggleProjectSelector (isOpened: boolean): void {
  hasOpenedProjectSelector.value = isOpened
}

onMounted(() => {
  initDropdowns()
})
</script>
