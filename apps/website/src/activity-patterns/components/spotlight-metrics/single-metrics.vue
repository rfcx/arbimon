<template>
  <div>
    <div class="text-3xl my-4">
      {{ value }}
    </div>
    <div class="text-subtle">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ value: string, description: string }>(), {
  description: undefined
})
</script>
