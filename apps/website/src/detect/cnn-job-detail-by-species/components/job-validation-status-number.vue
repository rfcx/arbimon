<template>
  <div class="loading-shimmer-light w-10 h-4 rounded" v-if="isLoading"></div>
  <span v-else>{{ getNumber(value) }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean
  value: number
}>()

const getNumber = (value: number) => {
  return props.isLoading || value === -1 ? 'N/A' : value
}
</script>
