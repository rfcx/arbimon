<template>
  <contact-card>
    <div class="flex flex-col gap-2">
      <h3 class="font-medium font-header">
        Working on an endangered species project?
      </h3>
      <p class="mb-4">
        <router-link
          :to="{ name: ROUTE_NAMES.landingContact }"
          class="text-frequency underline"
        >
          Contact us
        </router-link> to find out how the Arbimon science team can help.
      </p>
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
import ContactCard from '../../home/components/contact-card.vue'
</script>
