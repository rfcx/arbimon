<template>
  <!-- force import the bg from tailwind -->
  <div class="hidden not-sr-only bg-hero-cta" />
  <contact-card hero-background="hero-cta">
    <div class="flex flex-col gap-2">
      <h2 class="font-medium font-header">
        Working on <span class="lowercase">{{ text }}</span> project?
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
import { computed } from 'vue'

import ContactCard from '@/_layout/components/landing-cta-card/contact-card-full-background.vue'
import { ROUTE_NAMES } from '~/router'

const props = defineProps<{
  readonly projectName: string
}>()

const text = computed(() => {
  const isStartWithVowel = ['a', 'e', 'i', 'o', 'u'].some((e) => e === props.projectName.charAt(0).toLowerCase())
  return isStartWithVowel ? `an ${props.projectName}` : `a ${props.projectName}`
})

</script>
