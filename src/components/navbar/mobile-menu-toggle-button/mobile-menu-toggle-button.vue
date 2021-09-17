<template>
  <div class="toggle-button cursor-pointer mx-2 block sm:hidden">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      @click="$emit('toggleMobileMenu')"
    >
      <path
        v-if="!isToggled"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
      <path
        v-else
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </div>
</template>
<script src="./mobile-menu-toggle-button.ts" lang="ts" />
