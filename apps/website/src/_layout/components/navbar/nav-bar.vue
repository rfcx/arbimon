<template>
  <header>
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-steel-gray">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <router-link
          :to="{ name: ROUTE_NAMES.landingHome }"
          class="flex items-center"
        >
          <img
            src="/src/_services/assets/rfcx-logo.svg"
            class="mr-3 h-6 sm:h-9"
            alt="Arbimon Logo"
          >
          <span
            class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
            :class="{ pride: isPride }"
          >Arbimon</span>
        </router-link>
        <div class="flex items-center lg:order-2">
          <client-only>
            <auth-navbar-item-component dom-id="navbar-auth-desktop" />
          </client-only>
          <button
            data-collapse-toggle="mobile-menu-2"
            type="button"
            class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
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
        <div
          id="mobile-menu-2"
          class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
        >
          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <router-link
                :to="{ name: ROUTE_NAMES.landingHome }"
                class="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white"
                aria-current="page"
              >
                Home
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: ROUTE_NAMES.landingFeatured }"
                class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
              >
                Featured Work
              </router-link>
            </li>
            <li v-if="toggles.explore">
              <router-link
                :to="{ name: ROUTE_NAMES.explore }"
                class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
              >
                Explore
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: ROUTE_NAMES.landingHowItWorks }"
                class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
              >
                How It Works
              </router-link>
            </li>
            <li>
              <button
                id="dropdownResourcesButton"
                data-dropdown-toggle="dropdownResources"
                data-dropdown-trigger="hover"
                class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-medium text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-gray-400 dark:hover:text-white dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
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
                class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  class="py-2 text-sm text-gray-700 dark:text-gray-400"
                  aria-labelledby="dropdownResourcesButton"
                >
                  <li>
                    <router-link
                      :to="{ name: ROUTE_NAMES.landingFAQ }"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      FAQ
                    </router-link>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Publications</a>
                  </li>
                </ul>
                <div class="py-2">
                  <a
                    href="https://support.rfcx.org"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                  >Help &amp; Support <icon-custom-linkout class="inline ml-1" /></a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <nav
    v-if="isProjectLevel"
    class="bg-steel-gray-light"
  >
    <div class="sm:(relative flex justify-between) items-center">
      <div class="justify-between flex-row relative flex items-center h-13">
        <div class="flex items-center">
          <button
            v-if="store.projects.length > 0"
            class="navbar-item text-sm h-9 mx-2 px-4 sm:(hover:bg-steel-gray rounded-md cursor-pointer)"
            @click="toggleProjectSelector(true)"
          >
            <span class="max-w-48 truncate">{{ selectedProjectName }}</span>
            <icon-custom-angle-down class="ml-1 text-xs" />
          </button>
        </div>
      </div>
      <div
        class="flex-col sm:(flex-1 flex flex-row items-center) <sm:(border-t-box-gray border-t-1)"
        :class="hasToggledMobileMenu ? 'visible' : 'hidden' "
      >
        <router-link
          v-for="(item, idx) in projectMenuItems"
          :key="'nav-menus-' + idx"
          :to="item.destination"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
          :class="item.isParent ? 'router-link-needs-exact' : ''"
          @click="hasToggledMobileMenu = false"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </nav>
  <project-selector
    v-if="hasOpenedProjectSelector"
    @emit-close="toggleProjectSelector(false)"
  />
</template>
<script src="./nav-bar" lang="ts">
</script>
<style lang="scss">
.pride {
  background-image: linear-gradient(to right, rgb(255, 0, 0), rgb(255, 145, 0), rgb(255, 234, 0), rgb(0, 255, 0), rgb(0, 238, 255), rgb(30, 100, 255), rgb(200, 70, 255), rgb(255, 50, 255), rgb(255, 44, 104));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
