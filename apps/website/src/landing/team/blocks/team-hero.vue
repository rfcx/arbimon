<template>
  <hero-content
    :hero-image-url="heroImage"
    :with-border-bottom="false"
  >
    <h1 class="text-giant mb-4 text-gray-900 dark:text-frequency">
      Mission
    </h1>
    <h4 class="text-gray-500 dark:text-insight">
      We are changing the landscape for bioacoustic monitoring.
    </h4>
  </hero-content>
</template>
<script setup lang="ts">
import heroImage from '@/_assets/landing/team/hero-orange-bird.webp'
import HeroContent from '@/_layout/components/hero-content.vue'
</script>
