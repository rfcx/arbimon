<template>
  <img
    src="/src/_services/assets/arbimon-logo.svg"
    class="mr-3 h-6 sm:h-9"
    alt="Arbimon Logo"
  >
  <span
    class="self-center uppercase font-base whitespace-nowrap font-display dark:text-insight"
    :class="{ pride: toggles?.logoPride }"
  >Arbimon</span>
</template>
<script setup lang="ts">
import { inject } from 'vue'

import { togglesKey } from '@/globals'

const toggles = inject(togglesKey)
</script>
<style lang="scss">
.pride {
  background-image: linear-gradient(to right, rgb(255, 0, 0), rgb(255, 145, 0), rgb(255, 234, 0), rgb(0, 255, 0), rgb(0, 238, 255), rgb(30, 100, 255), rgb(200, 70, 255), rgb(255, 50, 255), rgb(255, 44, 104));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>