<template>
  <div
    v-if="!isEditing"
    class="inline-flex cursor-pointer"
    @mouseover="isHovering = true"
    @mouseleave="isHovering = false"
    @click="isEditing = true"
  >
    <h6
      class="text-insight text-sm pb-4 max-w-100"
    >
      {{ text }}
    </h6>
    <button class="w-2 h-2">
      <icon-custom-fi-edit
        v-if="isHovering && !isEditing"
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
        @click="isEditing = false"
      >
        Save
      </button>
      <button
        class="btn btn-secondary py-1 flex-0"
        @click="isEditing = false"
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
}>()

const isEditing = ref(false)
const isHovering = ref(false)

const text = ref(props.defaultText)
</script>
