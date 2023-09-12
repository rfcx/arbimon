<template>
  <h1>Threatened species</h1>
  <div>
    <stack-distribution
      :dataset="dataset"
      :known-total-count="200"
      class="mt-4"
    />
  </div>
  <div class="text-xxs p-6">
    <div>// TODO: tag with clickable</div>
    <div>// TODO: list of cards</div>
  </div>
</template>
<script setup lang="ts">
import StackDistribution from './stack-distribution.vue'
import type { HorizontalStack } from './types'

defineProps<{
  dataset: HorizontalStack[]
}>()

</script>
