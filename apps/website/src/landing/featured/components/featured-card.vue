<template>
  <div class="relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <img
      class="object-cover w-full"
      :src="backgroundImage"
      alt=""
    >
    <div class="absolute bottom-0 left-0 p-5">
      <p class="leading-normal text-sm text-gray-100">
        {{ subtitle }}
      </p>
      <h4 class="mt-1 text-2xl font-bold tracking-tight text-white">
        {{ title }}
      </h4>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ backgroundImage: string, title: string, subtitle: string }>()
</script>
