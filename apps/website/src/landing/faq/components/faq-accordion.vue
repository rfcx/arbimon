<template>
  <h2 :id="'accordion-open-heading-' + itemId">
    <button
      type="button"
      class="flex items-center justify-between w-full p-4 text-left text-insight border-b-1 border-util-gray-01 bg-transparent focus:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
      :data-accordion-target="'#accordion-open-body-' + itemId"
      aria-expanded="true"
      :aria-controls="'accordion-open-body-' + itemId"
    >
      <div class="text-lg lg:text-xl font-medium">
        <slot name="question" />
      </div>
      <svg
        data-accordion-icon
        class="w-3 h-3 rotate-180 shrink-0"
        aria-hidden="true"
        width="14"
        height="17"
        viewBox="0 0 14 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 9.33789L1.1875 8.13477L6.14062 13.0879L6.14062 0.259766H7.85938L7.85938 13.0879L12.7969 8.13477L14 9.33789L7 16.3379L0 9.33789Z"
          fill="#ADFF2C"
        />
      </svg>
    </button>
  </h2>
  <div
    :id="'accordion-open-body-' + itemId"
    class="hidden font-base"
    :aria-labelledby="'accordion-open-heading-' + itemId"
  >
    <div class="px-4 py-8">
      <slot name="answer" />
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  itemId: string
}>()
</script>
