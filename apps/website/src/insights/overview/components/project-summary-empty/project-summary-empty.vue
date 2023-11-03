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
      <svg
        class="inline-block align-middle cursor-pointer"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        @click="$emit('emit-close')"
      >
        <path
          d="M12 4L4 12"
          stroke="#FFFEFC"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 4L12 12"
          stroke="#FFFEFC"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
defineEmits<{(event: 'emit-add-content'): void, (event: 'emit-close'): void}>()
</script>
