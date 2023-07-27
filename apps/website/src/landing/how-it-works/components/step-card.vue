<template>
  <div class="rounded-xl px-6 py-8">
    <div class="flex justify-center items-center mb-4 w-10 h-10 rounded-full lg:h-12 lg:w-12">
      <img
        :src="iconUrl"
        alt="icon"
      >
    </div>
    <h4 class="mb-4 dark:text-insight">
      {{ title }}
    </h4>
    <p class="text-gray-700 dark:text-insight">
      {{ description }}
    </p>
  </div>
</template>
<script setup lang="ts">
defineProps<{ iconUrl: string, title: string, description: string }>()
</script>
