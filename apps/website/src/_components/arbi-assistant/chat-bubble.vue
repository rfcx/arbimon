<template>
  <div
    class="flex items-end space-x-2"
    :class="isUser ? 'flex-row-reverse space-x-reverse' : ''"
  >
    <icon-custom-fi-arbi-assistant-icon
      v-if="!isUser"
      class="w-4 h-4"
    />
    <div
      :class="[
        'max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
        isUser
          ? 'bg-[#C9FF74] text-black self-end rounded-br-none'
          : 'bg-util-gray-04 text-insight self-start rounded-bl-none'
      ]"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string,
  isUser: boolean
}>()
</script>
