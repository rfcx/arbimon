<template>
  <div class="flex flex-row items-center justify-start space-x-3 border-1 border-insight rounded-lg py-4 px-[18px] row-span-3 group hover:(row-span-4 py-8)">
    <img
      class="w-12 h-12 rounded-full shadow"
      :src="image || 'https://inaturalist-open-data.s3.amazonaws.com/photos/332643265/small.jpeg'"
      alt="user profile image"
    >
    <div class="max-w-2/3">
      <h3
        v-if="ranking === 0"
        class="text-danger text-xs font-medium font-eyebrow uppercase"
      >
        Primary contact
      </h3>
      <h3 class="text-base font-normal font-sans">
        {{ name }}
      </h3>
    </div>
    <icon-custom-dots-vertical class="hidden group-hover:block !ml-auto" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string, email: string, image?: string, ranking?: number }>()
</script>
