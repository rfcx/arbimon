<template>
  <div
    class="flex items-center hover:bg-moss space-x-3 justify-between py-4 px-[18px] cursor-pointer h-22"
    @click="$emit('emitAddToSelectedOrganization', id)"
  >
    <div class="flex items-center justify-start space-x-3">
      <img
        v-if="image"
        class="w-12 h-12 rounded-full shadow"
        :src="image"
        @error="replaceByDefault"
      >
      <div
        v-else
        class="w-12 h-12 rounded-full shadow bg-util-gray-03"
      />
      <div>
        <h3
          class="text-base font-normal font-sans line-clamp-2"
          :title="name"
        >
          {{ name }}
        </h3>
        <h4
          v-if="description"
          class="text-insight text-sm font-normal font-sans leading-tight line-clamp-2"
          :title="description"
        >
          {{ description }}
        </h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: number, name: string, description?: string, image?: string }>()
defineEmits<{(event: 'emitAddToSelectedOrganization', value: number): void}>()

const replaceByDefault = (event: Event) => {
  (event.target as HTMLImageElement).src = new URL('@/_assets/default-stakeholder-image.png', import.meta.url).toString()
}
</script>
