<template>
  <button
    :disabled="disabled || loading"
    class="btn btn-icon flex items-center disabled:(btn-disabled cursor-not-allowed pointer-events-none)"
    :class="{ 'cursor-wait': loading }"
    :title="title"
  >
    <icon-custom-download class="h-4 w-4" />
    <slot name="label" />
  </button>
</template>
<script setup lang="ts">
defineProps<{ disabled?: boolean, loading?: boolean, title?: string }>()
</script>
