<template>
  <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
    {{ title }}
  </div>
  <p class="mb-4 text-gray-900 dark:text-insight">
    <slot />
  </p>
</template>

<script setup lang="ts">

defineProps<{
  readonly title: string
}>()

</script>
