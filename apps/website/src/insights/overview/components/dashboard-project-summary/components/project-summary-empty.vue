<template>
  <div class="bg-util-gray-02 border border-insight rounded-md w-fit px-4 py-2 mx-auto">
    <span class="text-insight text-base font-medium font-sans">
      Don't leave this space empty - make it meaningful by adding your content.
      <span
        class="text-frequency cursor-pointer font-display"
        :class="{ 'disabled:cursor-not-allowed': projectUserPermissionsStore.isGuest }"
        :disabled="projectUserPermissionsStore.isGuest"
        @click="onAddContentClicked"
      >
        Add content
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useProjectUserPermissionsStore } from '~/store'

const emit = defineEmits<{(event: 'emit-add-content'): void}>()
const projectUserPermissionsStore = useProjectUserPermissionsStore()

const onAddContentClicked = () => {
  if (!projectUserPermissionsStore.isGuest) {
    emit('emit-add-content')
  }
}
</script>
