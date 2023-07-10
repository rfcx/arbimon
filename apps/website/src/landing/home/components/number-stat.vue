<template>
  <section class="text-center">
    <h1 class="text-flamingo">
      {{ valueShortScale }}
    </h1>
    <p class="text-sm">
      {{ props.title }}
    </p>
  </section>
</template>

<script setup lang="ts">

import numeral from 'numeral'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  number: number
}>()

const valueShortScale = computed(() => numeral(props.number).format('0a'))

</script>
