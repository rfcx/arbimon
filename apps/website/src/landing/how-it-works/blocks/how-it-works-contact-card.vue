<template>
  <contact-card>
    <div class="flex flex-col">
      <h1>
        Have a question about the process?
      </h1>
      <p class="my-8">
        Our team of experts can answer any of your questions and help guide you along the way.
      </p>
      <router-link
        :to="{ name: ROUTE_NAMES.landingContact }"
        class="btn btn-primary"
      >
        Contact us
      </router-link>
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
import ContactCard from '../../home/components/contact-card.vue'
</script>
