<template>
  <div
    class="bg-moss border-1 border-util-gray-02 rounded-lg px-6 py-4 mt-4"
  >
    <div class="grid grid-cols-3 gap-2 items-center justify-between text-insight text-base font-medium sm:flex sm:flex-row">
      <div>Validation status</div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-unvalidated class="h-4 w-4" />
          <span>Unvalidated:</span>
        </div>
        <span class="row-span-1">{{ total - (confirmed + rejected + uncertain) }}</span>
      </div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-present class="h-4 w-4" />
          <span>Present:</span>
        </div>
        <span>{{ confirmed }}</span>
      </div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-not-present class="h-4 w-4" />
          <span>Not present:</span>
        </div>
        <span>{{ rejected }}</span>
      </div>
      <div class="flex flex-row items-center gap-x-4">
        <div class="flex flex-row items-center gap-x-2">
          <icon-custom-fi-unknown class="h-4 w-4" />
          <span>Unknown:</span>
        </div>
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
