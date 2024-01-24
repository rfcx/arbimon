<template>
  <div class="flex flex-row gap-4 border-t-1 border-util-gray-03 p-4 bg-echo">
    <icon-custom-ic-warning class="text-insight flex-shrink-0" />
    <div class="flex flex-col gap-2">
      <span>Private project</span>
      <span class="text-xs">Project details are hidden to non-project members. For any inquiries about this project, contact us and we’ll connect you with the owners.</span>
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
