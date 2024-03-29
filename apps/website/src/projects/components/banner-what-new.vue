<template>
  <div
    :class="extraClass"
    class="w-full m-auto inline-block text-center font-display text-sm items-center justify-center bg-moss border-b-1 border-frequency px-10 py-4 gap-x-3"
  >
    Check out Arbimon’s new features!
    <a
      href="https://help.arbimon.org/article/253-whats-new-with-arbimon-february-2024 "
      class="text-frequency underline"
    >Learn more</a>
    about our exciting updates
  </div>
</template>

<script setup lang="ts">
defineProps<{
  extraClass?: string
}>()
</script>
