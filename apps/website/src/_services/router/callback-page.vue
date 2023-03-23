<template>
  <div class="fixed inset-0 flex flex-col justify-center items-center">
    <div class="animate-spin h-10 w-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  </div>
  <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-steel-gray dark:border-gray-700">
    <a
      class="flex items-center px-3 py-3 lg:px-5 lg:pl-3"
      href="/"
    ><brand-logo /></a>
  </nav>
</template>
<script setup lang="ts">
import BrandLogo from '@/_layout/components/brand-logo.vue'
</script>
