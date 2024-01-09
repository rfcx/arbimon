<template>
  <div
    class="flex flex-row justify-start hover:bg-util-gray-03"
    @click="$emit('emitAddSelectedUser', user.userId, 2)"
  >
    <img
      :src="user.image"
      class="rounded-2xl w-7rem h-7rem object-cover object-center h-52 bg-util-gray-03"
      alt="User image"
    >
    <div class="flex flex-col justify-between">
      <h6
        class="mb-2 mt-6 font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
      >
        {{ user.firstName }} {{ user.lastName }}
      </h6>
      <span
        class="text-util-gray-03"
      >
        {{ user.email }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">

import type { ProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'

defineProps<{user: ProjectMember}>()
defineEmits<{(e: 'emitAddSelectedUser', userId: number, roleId: number): void}>()
</script>
