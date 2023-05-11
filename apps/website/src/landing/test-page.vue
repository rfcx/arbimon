<template>
  <navbar-component />
  <nav
    class="bg-gray-50 dark:bg-steel-gray-light"
  >
    <div class="max-w-screen-xl mx-auto text-gray-900 dark:text-white">
      <h1 class="text-2xl py-12 font-bold">
        Puerto Rico Island Wide
      </h1>
    </div>
  </nav>
  <nav class="sticky top-0 bg-gray-50 dark:bg-steel-gray-light">
    <div class="max-w-screen-xl mx-auto">
      <div class="text-sm font-medium text-center text-gray-500 dark:text-gray-300">
        <ul class="flex flex-wrap -mb-px">
          <li class="mr-2">
            <a
              href="#"
              class="inline-block p-4 text-primary border-b-2 border-primary rounded-t-lg active dark:text-primary dark:border-primary"
              aria-current="page"
            >Dashboard</a>
          </li>
          <li class="mr-2">
            <a
              href="#"
              class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-200"
            >Species &amp; Biodiversity</a>
          </li>
          <li class="mr-2">
            <a
              href="#"
              class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-200"
            >Environment</a>
          </li>
          <li class="mr-2">
            <a
              href="#"
              class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-200"
            >Impact &amp; Recommendation</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- content -->
  <section class="bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
    <div class="mx-auto max-w-screen-xl grid grid-cols-3 gap-8">
      <div
        v-for="index in 50"
        :key="index"
        class="p-4 bg-white rounded-lg dark:bg-steel-gray"
      >
        <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Odio aenean sed
        </h5>
        <p class="font-normal text-gray-700 dark:text-gray-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import NavbarComponent from '@/_layout/components/navbar/nav-bar.vue'
</script>
