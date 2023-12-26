<template>
  <div class="flex flex-row gap-4 border-t-1 border-util-gray-03 p-4 bg-echo">
    <icon-custom-ic-warning />
    <div class="flex flex-col gap-2">
      <span>Private project</span>
      <span class="text-sm">Project details are hidden to non-project members.</span>
      <router-link
        class="text-frequency text-sm"
        :to="{ name: ROUTE_NAMES.landingContact }"
      >
        Contact Arbimon
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
</script>
