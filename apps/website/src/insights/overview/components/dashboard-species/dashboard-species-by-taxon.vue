<template>
  <h2 class="mt-6">
    Taxonomic groups
  </h2>
  <h6>Number of species detected in each taxonomic group.</h6>
  <div class="dashboard-taxon">
    <StackDistribution
      :dataset="dataset"
      :known-total-count="knownTotalCount"
      class="my-6"
    />
  </div>
</template>

<script setup lang="ts">

import StackDistribution from './components/stack-distribution.vue'
import { type HorizontalStack } from './components/stack-distribution.vue'

defineProps<{
  dataset: HorizontalStack[]
  knownTotalCount: string
}>()

</script>
