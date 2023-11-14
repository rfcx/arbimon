<template>
  <button
    :disabled="disabled || loading"
    class="btn btn-icon flex items-center disabled:(cursor-not-allowed opacity-50)"
    :class="{ 'cursor-wait': loading }"
    :title="title"
  >
    <icon-custom-download class="h-4 w-4" />
    <slot name="label" />
  </button>
</template>
<script setup lang="ts">
defineProps<{ disabled: boolean, loading: boolean, title: string }>()
</script>
