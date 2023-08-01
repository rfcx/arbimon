<template>
  <contact-card>
    <div class="flex flex-col">
      <h1>
        Stay connected
      </h1>
      <p class="my-8">
        Be the first to hear the latest from Arbimon.
      </p>
    </div>
    <div class="flex flex-col lg:flex-row gap-2">
      <contact-form />
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '@/_layout/components/landing-cta-card/contact-card-full-background.vue'
import ContactForm from '@/_layout/components/mailing-list-form.vue'
</script>
