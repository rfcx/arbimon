<template>
  <div
    class="flex flex-col inset-1/2 w-5vh bg-moss transition-transform -translate-x-full rounded-lg"
    :class="sideBar"
    @click="emit('emitClickSidebar')"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits<{(e: 'emitClickSidebar'): void }>()
const props = defineProps<{ sideBarStatus: string }>()

const sideBar = computed(() => {
  if (props.sideBarStatus === 'all-hide') {
    return 'left-2'
  } else if (props.sideBarStatus === 'projects-show') {
    return 'left-99'
  } else {
    return 'left-199'
  }
})
</script>
