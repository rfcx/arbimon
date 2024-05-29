<template>
  <img
    v-if="src"
    :src="src"
    class="rounded-2xl w-full h-full object-cover object-center h-52 bg-moss"
  >
  <div v-else>
    <div class="flex items-center justify-center h-full bg-moss rounded-2xl">
      <span class="text-xs font-medium text-fog">
        It seems the image didn’t load as expected. <br>
        Please refresh your browser to give it another go.
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ src: string }>()
</script>
