<template>
  <section class="text-center lg:w-52">
    <h1 class="text-flamingo">
      {{ valueShortScale }}
    </h1>
    <p class="text-sm font-medium">
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

const valueShortScale = computed(() => {
  return numeral(props.number).format(props.number > 999999999 ? '0,0am' : '0,0.[0]a')
})

</script>
