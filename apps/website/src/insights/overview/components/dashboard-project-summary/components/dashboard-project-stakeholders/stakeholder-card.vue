<template>
  <div class="flex items-center justify-start space-x-3 py-4 pr-4">
    <img
      class="w-12 h-12 rounded-full shadow"
      :src="image || 'https://inaturalist-open-data.s3.amazonaws.com/photos/332643265/small.jpeg'"
      alt="user profile image"
    >
    <div>
      <h3
        v-if="ranking === 0"
        class="text-danger text-xs font-medium font-eyebrow uppercase"
      >
        Primary contact
      </h3>
      <h3 class="text-base font-normal font-sans">
        {{ name }}
      </h3>
      <h3
        v-if="description"
        class="text-sm font-normal"
      >
        {{ description }}
      </h3>
      <a
        v-if="email"
        class="text-steel-gray-light text-sm font-normal leading-tight hover:underline hover:cursor-pointer"
        :href="`mailto:${email}`"
      >
        {{ email }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string, description?: string, email?: string, image?: string, ranking?: number }>()
</script>
