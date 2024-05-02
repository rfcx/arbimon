<template>
  <div
    v-if="isLoading"
    class="loading-shimmer-light w-10 h-4 rounded"
  />
  <span v-else>{{ getNumber(value) }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean
  value: number
}>()

const getNumber = (value: number) => {
  return props.isLoading === true || value === -1 ? 'N/A' : value
}
</script>
