<template>
  <div class="pt-6 pb-8 rounded-lg border-1 border-frequency">
    <div
      v-if="iconUrl || tag"
      class="flex flex-row w-full justify-between items-center mb-4"
    >
      <img
        v-if="iconUrl"
        :src="iconUrl"
        alt="icon"
        class="ml-6"
      >
      <span
        v-else
        class="ml-6 not-sr-only invisible"
      >
        .
      </span>
      <span
        v-if="tag"
        class="border-y-1 border-l-1 border-spoonbill rounded-l-full px-3 uppercase font-header"
      >
        {{ tag }}
      </span>
    </div>
    <div class="px-6">
      <h4 class="mb-3 basis-2/3 dark:text-insight">
        {{ title }}
      </h4>
      <p class="text-gray-700 dark:text-insight">
        {{ description }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ iconUrl?: string, title: string, description: string, tag?: string }>()
</script>
