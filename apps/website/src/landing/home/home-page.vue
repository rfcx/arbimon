<template>
  <hero />
  <impact />
  <what-we-do />
  <how-it-works />
  <features />
  <testimonials-partners />
</template>
<script setup lang="ts">
import { useHead } from '@vueuse/head'

import Features from './blocks/home-features.vue'
import Hero from './blocks/home-hero.vue'
import HowItWorks from './blocks/home-how-it-works.vue'
import Impact from './blocks/home-impact.vue'
import TestimonialsPartners from './blocks/home-testimonials-partners.vue'
import WhatWeDo from './blocks/home-what-we-do.vue'

useHead({
  title: 'Arbimon - Empower your wildlife research',
  meta: [
    {
      name: 'description',
      content: 'Website and page description'
    }
  ]
})
</script>
