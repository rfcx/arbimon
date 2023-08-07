<template>
  <div class="h-full w-full bg-chirp p-6 text-left text-echo flex flex-col items-baseline justify-center rounded-lg">
    <h1>{{ title }}</h1>
    <h2
      v-if="subtitle"
      class="md:text-2xl lg:text-3xl"
    >
      {{ subtitle }}
    </h2>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly subtitle?: string
}>()
</script>
