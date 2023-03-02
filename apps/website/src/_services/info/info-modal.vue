<template>
  <modal-popup
    title="supporting information"
    modal-body="sm:(my-8 align-middle max-w-5xl w-full)"
    @emit-close="$emit('close')"
  >
    <button
      class="mt-4 mr-4 px-2 float-right"
      @click="$emit('close')"
    >
      <icon-fa-close class="cursor-pointer h-8 inline" />
    </button>
    <div class="p-4">
      <InfoPage :selected-topic="topic" />
    </div>
  </modal-popup>
</template>
<script setup lang="ts">
import InfoPage from './info-page.vue'

defineEmits<{(e: 'close'): void}>()

defineProps<{
  topic?: string
}>()
</script>
