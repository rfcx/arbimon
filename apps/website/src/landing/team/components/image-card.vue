<template>
  <img
    :src="src"
    class="rounded-2xl w-full h-full object-cover object-center h-52 bg-moss"
  >
</template>
<script setup lang="ts">
defineProps<{ src: string }>()
</script>
