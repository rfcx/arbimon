<template>
  <!-- force import the bg from tailwind -->
  <div class="hidden not-sr-only bg-hero-cta-home" />
  <contact-card hero-background="hero-cta-home">
    <div>
      <h1>
        Stay connected
      </h1>
      <p class="my-8">
        Be the first to hear the latest from Arbimon.
      </p>
    </div>
    <contact-form />
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '@/_layout/components/landing-cta-card/contact-card-full-background.vue'
import ContactForm from '@/_layout/components/mailing-list-form.vue'
</script>
