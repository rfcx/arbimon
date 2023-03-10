<template>
  <img
    src="/src/_services/assets/rfcx-logo.svg"
    class="mr-3 h-6 sm:h-9"
    alt="Arbimon Logo"
  >
  <span
    class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
    :class="{ pride: toggles?.logoPride }"
  >Arbimon</span>
</template>
<script setup lang="ts">
import { inject } from 'vue'

import { togglesKey } from '@/globals'

const toggles = inject(togglesKey)
</script>
