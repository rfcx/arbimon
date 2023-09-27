<template>
  <div
    v-if="!isEditing"
    class="inline-flex"
    :class="canEdit ? 'cursor-pointer' : ''"
    @mouseover="isHovering = canEdit"
    @mouseleave="isHovering = false"
    @click="enterEditingMode"
  >
    <h6
      class="text-insight text-sm pb-4 max-w-100"
    >
      {{ defaultText }}
    </h6>
    <button class="w-2 h-2">
      <icon-custom-fi-edit
        v-if="isHovering && !isEditing && canEdit"
        @click="isEditing = true"
      />
    </button>
  </div>
  <div
    v-else
    class="flex flex-col lg:flex-row gap-2 items-start"
  >
    <textarea
      v-model="text"
      class="text-pitch rounded-md p-1 w-100 h-12 border-util-gray-03 text-sm"
    />
    <div class="flex gap-2">
      <button
        class="btn btn-primary py-1 flex-0"
        @click="exitEdittingMode"
      >
        Save
      </button>
      <button
        class="btn btn-secondary py-1 flex-0"
        @click="exitEdittingMode"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  defaultText: string
  canEdit: boolean
}>()

const isEditing = ref(false)
const isHovering = ref(false)

const text = ref(props.defaultText)

const enterEditingMode = () => {
  if (!props.canEdit) { return }
  isEditing.value = true
  isHovering.value = false
}

const exitEdittingMode = () => {
  isEditing.value = false
  isHovering.value = false
}
</script>
