<template>
  <!-- force import the bg from tailwind -->
  <div class="hidden not-sr-only bg-hero-cta-monkey bg-hero-cta-monkey-bg" />
  <contact-card
    text-background="hero-cta-monkey-bg"
    hero-background="hero-cta-monkey"
  >
    <div class="flex flex-col items-start">
      <h2>
        Have a question about the process?
      </h2>
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
import ContactCard from '@/_layout/components/landing-cta-card/contact-card-right-hero.vue'
import { ROUTE_NAMES } from '~/router'
</script>
