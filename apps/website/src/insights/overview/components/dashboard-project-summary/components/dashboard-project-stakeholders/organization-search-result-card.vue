<template>
  <div
    class="flex items-center hover:bg-moss rounded-lg space-x-3 justify-between py-4 px-[18px] cursor-pointer"
    @click="$emit('emit-add-to-selected-organization', id)"
  >
    <div class="flex items-center justify-start space-x-2">
      <img
        class="w-12 h-12 rounded-full shadow"
        :src="image ?? undefined"
        alt="user profile image"
      >
      <div>
        <h3 class="text-base font-normal font-sans">
          {{ name }}
        </h3>
        <h4
          v-if="description"
          class="text-insight text-sm font-normal font-sans leading-tight"
        >
          {{ description }}
        </h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: number, name: string, description?: string, image: string | null }>()
defineEmits<{(event: 'emit-add-to-selected-organization', value: number): void}>()
</script>
