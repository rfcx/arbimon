<template>
  <div
    class="flex flex-row justify-start hover:bg-util-gray-03 p-2 cursor-pointer"
    @click="$emit('emitSelectedUser', user)"
  >
    <img
      :src="user.image"
      class="h-8 w-8 self-center rounded-full"
      alt="User image"
    >
    <div class="ml-3 flex flex-col justify-start text-sm">
      <h6
        class="font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
      >
        {{ user.firstName }} {{ user.lastName }}
      </h6>
      <span class="text-fog mt-2">
        {{ user.email }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { UserTypes } from '@rfcx-bio/common/dao/types'

defineProps<{user: UserTypes['light']}>()
defineEmits<{(e: 'emitSelectedUser', user: UserTypes['light']): void}>()
</script>
