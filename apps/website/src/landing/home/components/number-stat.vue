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
  const formattedNumber = numeral(props.number).format('0.0a')
  const firstDecimalDigit = (x: string) => x.split('.')[1].slice(0, 1)
  return firstDecimalDigit(formattedNumber) === '0' ? formattedNumber.replace('.0', '') : formattedNumber
})

</script>
