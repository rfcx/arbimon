<template>
  <hero-content :hero-image-url="heroImage">
    <h1 class="text-giant mb-4 text-gray-900 dark:text-frequency">
      Scientific publications
    </h1>
    <p class="text-gray-500 dark:text-insight">
      Explore the extensive scientific publication, featuring studies powered by Arbimon, offering valuable insights for conservation and research.
    </p>
  </hero-content>
</template>
<script setup lang="ts">
import heroImage from '@/_assets/publications/hero-publications.webp'
import HeroContent from '@/_layout/components/hero-content.vue'
</script>
