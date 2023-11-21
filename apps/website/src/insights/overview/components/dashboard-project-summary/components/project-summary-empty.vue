<template>
  <div class="bg-util-gray-02 border border-insight rounded-md w-fit px-4 py-2 mx-auto">
    <span class="text-insight text-base font-medium font-sans">
      Don't leave this space empty - make it meaningful by adding your content.
      <span
        class="text-frequency cursor-pointer font-display"
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
