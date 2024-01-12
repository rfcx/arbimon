<template>
  <div class="bg-util-gray-04 p-4 border border-util-gray-02 rounded-md w-full flex flex-col gap-4 md:(flex-row items-center min-h-12)">
    <div class="font-medium flex flex-row gap-2 flex-shrink-0">
      <icon-custom-ic-warning class="h-5 w-5 text-insight" />
      No content
    </div>
    <div class="flex flex-col md:(flex-row items-center) gap-4">
      <span class="text-insight text-base font-medium font-sans flex-1">
        Don't leave this space empty - showcase the people and organizations behind this project.
      </span>
      <span
        class="text-frequency cursor-pointer font-display flex-shrink-0"
        :class="{ 'disabled:cursor-not-allowed': projectUserPermissionsStore.isGuest }"
        :disabled="projectUserPermissionsStore.isGuest"
        @click="onAddStakeholdersClicked"
      >
        Add stakeholders
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectUserPermissionsStore } from '~/store'

const emit = defineEmits<{(event: 'emit-add-stakeholders'): void}>()
const projectUserPermissionsStore = useProjectUserPermissionsStore()

const onAddStakeholdersClicked = () => {
  if (!projectUserPermissionsStore.isGuest) {
    emit('emit-add-stakeholders')
  }
}
</script>
