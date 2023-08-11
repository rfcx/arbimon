<template>
  <!-- force import the bg from tailwind -->
  <div class="hidden not-sr-only bg-hero-cta-frog bg-hero-cta-frog-bg" />
  <contact-card
    text-background="hero-cta-frog-bg"
    hero-background="hero-cta-frog"
    background-position="center"
  >
    <div class="flex flex-col items-start">
      <h2 class="mb-8">
        Work with us
      </h2>
      <p>
        <router-link
          :to="{ name: ROUTE_NAMES.landingContact }"
        >
          <span class="text-frequency underline">Contact us</span>
        </router-link>
        to find out how the Arbimon science team can help.
      </p>
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '@/_layout/components/landing-cta-card/contact-card-right-hero.vue'
import { ROUTE_NAMES } from '~/router'
</script>
