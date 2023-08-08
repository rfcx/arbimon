<template>
  <header>
    <nav class="bg-white border-frequency border-b-4 px-4 lg:px-6 py-2.5 dark:bg-echo">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <!-- Logo -->
        <router-link
          :to="{ name: ROUTE_NAMES.landingHome }"
          class="flex items-center"
        >
          <brand-logo />
        </router-link>
        <!-- Auth -->
        <div class="flex items-center lg:order-2">
          <client-only>
            <auth-navbar-item dom-id="navbar-auth-desktop" />
          </client-only>
          <button
            data-collapse-toggle="mobile-menu-2"
            type="button"
            class="inline-flex items-center py-1 px-2 mx-2 text-sm dark:text-frequency rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-frequency dark:hover:ring-moss dark:focus:ring-moss"
            aria-controls="mobile-menu-2"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            /></svg>
            <svg
              class="hidden w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg>
          </button>
        </div>
        <!-- Nav menu -->
        <div
          id="mobile-menu-2"
          class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
        >
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
        </div>
      </div>
    </nav>
  </header>
</template>
<script setup lang="ts">
import { initCollapses, initDropdowns } from 'flowbite'
import { inject, onMounted } from 'vue'

import { togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import BrandLogo from '../brand-logo.vue'
import AuthNavbarItem from './auth-navbar-item/auth-navbar-item.vue'

const toggles = inject(togglesKey)

onMounted(() => {
  initCollapses()
  initDropdowns()
})
</script>
