<template>
  <div class="bg-util-gray-04 p-4 border border-util-gray-02 rounded-md w-full justify-between max-w-80">
    <div class="font-medium flex flex-col gap-4 justify-between">
      <div class="flex items-center">
        <icon-custom-ic-warning class="h-5 w-5 text-insight" />
        <span class="ml-2">Error</span>
      </div>
      <span class="text-insight text-base font-medium font-sans flex-1 flex-shrink">
        {{ props.message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ message?: string }>(), {
  message: 'There was a problem while loading this component'
})
</script>
