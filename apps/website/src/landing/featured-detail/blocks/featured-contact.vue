<template>
  <contact-card>
    <div class="flex flex-col gap-2">
      <h2 class="font-medium font-header">
        Working on an endangered species project?
      </h2>
      <p>
        <router-link
          :to="{ name: ROUTE_NAMES.landingContact }"
          class="text-frequency underline"
        >Contact us</router-link> to find out how the Arbimon science team can help.
      </p>
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '@/_layout/components/landing-cta-card/contact-card-full-background.vue'
import { ROUTE_NAMES } from '~/router'
</script>
