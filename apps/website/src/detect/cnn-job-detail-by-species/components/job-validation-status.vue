<template>
  <div
    class="border-2 border-util-gray-04 bg-echo rounded-md px-6 py-4 mt-4"
  >
    <div class="flex flex-row items-center justify-between">
      <div class="text-base">
        Validation status
      </div>
      <div class="text-subtle text-sm flex flex-row items-center">
        <icon-custom-fi-unvalidated class="h-3 w-3 mr-2 mb-0.5" />
        <span class="mr-4">Unvalidated:</span>
        <span>{{ total - (confirmed + rejected + uncertain) }}</span>
      </div>
      <div class="text-subtle text-sm flex flex-row items-center">
        <icon-custom-fi-present class="h-3 w-3 mr-2 mb-0.5" />
        <span class="mr-4">Present:</span>
        <span>{{ confirmed }}</span>
      </div>
      <div class="text-subtle text-sm flex flex-row items-center">
        <icon-custom-fi-not-present class="h-3 w-3 mr-2 mb-0.5" />
        <span class="mr-4">Not present:</span>
        <span>{{ rejected }}</span>
      </div>
      <div class="text-subtle text-sm flex flex-row items-center mb-0.5">
        <icon-custom-fi-unknown class="h-3 w-3 mr-2" />
        <span class="mr-4">Unknown:</span>
        <span>{{ uncertain }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number
  rejected: number
  uncertain: number
  confirmed: number
}>()
</script>
