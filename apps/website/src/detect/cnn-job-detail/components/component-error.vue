<template>
  <div class="bg-danger border-red-900 border-4 rounded-lg mx-2 flex justify-center items-center">
    <p class="text-md px-4">
      {{ props.message }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ message?: string }>(), {
  message: 'There was a problem while loading this component'
})
</script>
