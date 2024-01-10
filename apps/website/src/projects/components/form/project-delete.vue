<template>
  <div class="flex flex-col gap-y-6">
    <h5>
      Danger Zone
    </h5>
    <div>
      <div class="flex flex-row">
        <span class="font-medium">Delete project</span>
        <icon-i-info
          tooltip-id="project-settings-project-image"
          :tooltip-text="'Delete project'"
        />
      </div>
      <div class="flex flex-row items-center mt-4">
        <button
          type="button"
          class="btn btn-danger flex flex-row py-2"
          @click="$emit('emitProjectDelete')"
        >
          Delete project
          <icon-fas-spinner
            v-if="isDeleting"
            class="animate-spin ml-2"
          />
          <icon-fa-trash
            v-else
            class="ml-2 cursor-pointer"
          />
        </button>
        <span
          v-if="isError"
          class="ml-4 text-sm text-red-800 dark:text-flamingo"
          role="alert"
        >
          <span class="font-medium">Failed to delete project.</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import IconIInfo from '../icon-i-info.vue'

defineProps<{isDeleting?: boolean, isError?: boolean}>()
defineEmits<{(e: 'emitProjectDelete'): void}>()

</script>
