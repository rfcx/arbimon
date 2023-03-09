<template>
  <Hero />
</template>
<script lang="ts" setup>
import { useHead } from '@vueuse/head'

import Hero from './blocks/hero.vue'

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
