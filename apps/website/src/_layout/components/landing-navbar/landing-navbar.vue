<template>
  <header>
    <nav
      class="bg-white border-frequency border-b-1 px-4 lg:px-6 dark:bg-echo"
      :class="store.user ? 'py-3' : 'py-1.7'"
    >
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <div class="flex gap-10 items-center">
          <!-- Logo -->
          <router-link
            :to="{ name: ROUTE_NAMES.landingHome }"
            class="flex items-center"
          >
            <brand-logo />
          </router-link>
          <!-- Nav menu for desktop -->
          <navbar-menu
            dom-id="desktopNav"
            class="hidden lg:flex"
          />
        </div>
        <!-- Right menus -->
        <div class="flex items-center lg:order-2">
          <div
            v-if="isLoading"
            class="flex items-center space-x-4 font-medium <lg:hidden"
          >
            <div class="tab bg-util-gray-03 relative block h-5 w-24 rounded-full dark:bg-util-gray-03 loading-shimmer" />
            <div class="bg-util-gray-03 h-8 w-8 rounded-full dark:bg-util-gray-03 loading-shimmer" />
          </div>
          <client-only v-else-if="!toggles?.legacyLogin">
            <auth-navbar-item
              dom-id="navbar-auth-desktop"
              class="<lg:hidden"
            />
          </client-only>
          <div
            v-else-if="!store.user"
            class="flex items-center <lg:hidden"
          >
            <a
              :href="universalLoginUrl"
              class="text-gray-800 font-display dark:text-insight px-4 lg:px-5 py-1.5 lg:py-2 mr-2 dark:hover:text-frequency md:block"
            >
              Log in
            </a>
            <a
              :href="universalLoginUrl + '&screen_hint=signup'"
              class="btn btn-primary"
            >
              Sign up
            </a>
          </div>
          <!-- Mobile menu -->
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

        <!-- Nav menu for mobile -->
        <div
          id="mobile-menu-2"
          class="hidden justify-between items-center w-full lg:hidden"
        >
          <navbar-menu dom-id="mobileNav" />
        </div>
      </div>
    </nav>
  </header>
</template>
<script setup lang="ts">
import { initCollapses } from 'flowbite'
import { inject, onMounted, ref } from 'vue'

import { togglesKey } from '@/globals'
import { universalLoginUrl } from '@/landing/auth0-arbimon'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import BrandLogo from '../brand-logo.vue'
import AuthNavbarItem from './auth-navbar-item/auth-navbar-item.vue'
import NavbarMenu from './navbar-menu.vue'

const store = useStore()
const toggles = inject(togglesKey)
const isLoading = ref(true)

onMounted(() => {
  initCollapses()
  isLoading.value = false
})
</script>
