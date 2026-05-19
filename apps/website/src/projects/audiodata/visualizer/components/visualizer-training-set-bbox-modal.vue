<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 isolate flex items-center justify-center ml-120"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6">
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-2xl font-header">
            {{ title }}
          </h2>
          <button
            type="button"
            title="Cancel"
            @click="$emit('handleAction', 'cancel')"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <div class="pl-0.5">
          {{ trainingSetName }}
        </div>
        <div class="flex flex-row items-center justify-between gap-x-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium"
            @click="$emit('handleAction', 'cancel')"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 btn btn-primary btn-medium"
            @click="$emit('handleAction', 'create')"
          >
            Add Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  title: string
  trainingSetName: string
  visible: boolean
}>()

defineEmits<{(e: 'handleAction', value: string): void}>()

</script>
