<template>
  <div class="mb-2 uppercase text-spoonbill font-eyebrow text-xs col-span-1">
    {{ title }}
  </div>
  <p class="mb-6 text-gray-900 dark:text-insight col-span-2">
    <slot />
  </p>
</template>

<script setup lang="ts">

defineProps<{
  readonly title: string
}>()

</script>
