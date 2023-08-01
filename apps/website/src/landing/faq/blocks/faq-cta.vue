<template>
  <!-- force import the bg from tailwind -->
  <div class="hidden not-sr-only bg-hero-cta-bird bg-hero-cta-bird-bg" />
  <contact-card
    text-background="hero-cta-bird-bg"
    hero-background="hero-cta-bird"
  >
    <h2 class="mb-8">
      Still have questions?
    </h2>
    <p>
      Check out our <a
        href="https://support.rfcx.org/"
        class="text-frequency underline"
      >Support Documents</a> or <router-link
        :to="{ name: ROUTE_NAMES.landingContact }"
        class="text-frequency underline"
      >
        Contact us
      </router-link> with your specific questions and we'll see how we can help.
    </p>
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '@/_layout/components/landing-cta-card/contact-card-right-hero.vue'
import { ROUTE_NAMES } from '~/router'
</script>
