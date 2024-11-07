<template>
  <span
    :id="`badge-dismiss-${text}`"
    class="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-insight bg-util-gray-03 mr-1 mt-1 rounded"
  >
    {{ text }}
    <button
      type="button"
      class="inline-flex items-center p-1 ms-2 text-sm text-gray-400 bg-transparent rounded-sm hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-util-gray-03 dark:hover:text-gray-300"
      :data-dismiss-target="`badge-dismiss-${text}`"
      aria-label="Remove"
      @click="deleteTag(text)"
    >
      <svg
        class="w-2 h-2"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
      <span class="sr-only">Remove</span>
    </button>
  </span>
</template>
<script setup lang="ts">
defineProps<{
  text: string
}>()
const emit = defineEmits<{(e: 'emitDelete', value: string): void}>()
const deleteTag = (text: string) => {
  emit('emitDelete', text)
}
</script>
