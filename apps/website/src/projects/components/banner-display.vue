<template>
  <div
    :class="extraClass"
    class="w-full m-auto inline-block text-center font-display text-sm items-center justify-center bg-moss border-b-1 border-frequency px-10 py-4 gap-x-3"
  >
    Scheduled maintenance: Arbimon will be unavailable from 02:00 AM (GMT) Saturday 26 October to 22:00 PM Sunday 27 October 2024.
  </div>
</template>

<script setup lang="ts">
defineProps<{
  extraClass?: string
}>()
</script>
