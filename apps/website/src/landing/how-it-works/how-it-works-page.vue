<template>
  <hero-content
    :hero-image-url="heroImage"
  >
    <h1 class="text-giant mb-4 text-gray-900 dark:text-frequency">
      How it works
    </h1>
  </hero-content>
  <analyses />
  <cta />
  <steps />
  <contact-card />
  <footer-contact />
</template>
<script setup lang="ts">
import { onMounted } from 'vue'

import heroImage from '@/_assets/how-it-works/hero-how-it-works.webp'
import HeroContent from '@/_layout/components/hero-content.vue'
import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import Analyses from './blocks/how-it-works-analyses.vue'
import ContactCard from './blocks/how-it-works-contact-card.vue'
import Cta from './blocks/how-it-works-cta.vue'
import Steps from './blocks/how-it-works-steps.vue'

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>
