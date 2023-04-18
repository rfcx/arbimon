<template>
  <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-steel-gray dark:border-gray-700">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start">
          <button
            data-drawer-target="sidebar"
            data-drawer-toggle="sidebar"
            aria-controls="sidebar"
            type="button"
            class="inline-flex items-center py-1 px-2 mx-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
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
            class="box-content flex items-center justify-center h-9 mx-6 px-4 hover:bg-gray-700 rounded-md cursor-pointer text-gray-700 lg:hover:text-primary-700 dark:text-gray-400 dark:hover:text-white lg:dark:hover:text-white"
            @click="toggleProjectSelector(true)"
          >
            <span class="max-w-96 truncate">{{ selectedProjectName }}</span>
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
              <li v-if="store?.user">
                <router-link
                  :to="{ name: ROUTE_NAMES.myProjects }"
                  class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                >
                  My Projects
                </router-link>
              </li>
            </ul>
          </div>
          <auth-navbar-item
            class="ml-8"
          />
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
import { initDrawers, initDropdowns } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import { storeKey, togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import BrandLogo from '../brand-logo.vue'
import AuthNavbarItem from '../navbar/auth-navbar-item/auth-navbar-item.vue'
import ProjectSelector from '../project-selector/project-selector.vue'

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
  initDrawers()
})
</script>
