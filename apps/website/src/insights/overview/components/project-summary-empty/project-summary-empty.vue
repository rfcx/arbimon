<template>
  <div class="bg-neutral-600 border border-white rounded-md w-fit px-4 py-2 mx-auto whitespace-nowrap">
    <span class="text-white text-base font-medium">
      Don't leave this space empty - make it meaningful by adding your content.
      <span
        class="text-frequency cursor-pointer"
        @click="$emit('emit-add-content')"
      >
        Add content
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineEmits<{(event: 'emit-add-content'): void}>()
</script>
