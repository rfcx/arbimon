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
      <button
        type="button"
        class="btn btn-danger flex flex-row py-2 mt-4"
        @click="$emit('emitProjectDelete')"
      >
        Delete project
        <icon-fa-trash
          class="ml-2 cursor-pointer"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

import IconIInfo from '../icon-i-info.vue'

defineEmits<{(e: 'emitProjectDelete'): void}>()

</script>
