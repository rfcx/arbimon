<template>
  <div class="flex flex-row justify-between items-center">
    <div class="flex flex-row justify-start items-center">
      <img
        :src="user.image"
        class="h-8 w-8 self-center rounded-full"
        alt="User image"
      >
      <div class="ml-3 flex flex-col justify-start">
        <h6
          class="font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
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
    <div class="flex flex-row bg-light-500items-center">
      <p
        v-if="user.roleId === 4"
        class="text-frequency"
      >
        {{ getUserRoleName() }}
      </p>
      <button
        v-else
        :id="`dropdownRoleButton-${user.email}`"
        :data-dropdown-toggle="`dropdownRole-${user.email}`"
        data-dropdown-placement="bottom"
        class="bg-echo text-frequency rounded-lg flex flex-row items-center py-1 px-2"
        type="button"
      >
        {{ getUserRoleName() }}
        <span class="pl-3">
          <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
          <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
        </span>
      </button>
      <button
        v-if="user.roleId !== 4"
        type="button"
        class="bg-echo text-frequency rounded-lg flex flex-row items-center py-1 px-2 ml-2"
        @click="$emit('emitDeleteProjectMember', user.userId)"
      >
        <icon-fa-close class="cursor-pointer h-3 inline" />
      </button>
      <div
        :id="`dropdownRole-${user.email}`"
        class="z-10 hidden bg-echo divide-y rounded-lg shadow w-30"
      >
        <ul
          :aria-labelledby="`dropdownRoleButton-${user.email}`"
          aria-orientation="vertical"
          role="menu"
          tabindex="-1"
        >
          <li
            v-for="role in roles"
            :key="role.id"
            class="flex flex-row justify-start items-center p-2 m-0 cursor-pointer"
            @click="$emit('emitChangeUserRole', user.userId, role.id)"
          >
            <span class="w-8">
              <icon-fa-check
                v-if="role.id === user.roleId"
                class="text-xs"
              />
            </span>
            {{ role.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { onMounted } from 'vue'

import type { ProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'

interface Role {
  id: number
  name: string
  description: string
}

const props = defineProps<{user: ProjectMember, roles: Role[]}>()
defineEmits<{(e: 'emitChangeUserRole', userId: number, roleId: number): void, (e: 'emitDeleteProjectMember', userId: number): void}>()

const getUserRoleName = (): string => {
  const role = props.roles.find(r => r.id === props.user.roleId)
  return role !== undefined ? role.name : 'Not defined'
}

onMounted(() => {
  initDropdowns()
})
</script>
<style lang="scss">
button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-down {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-down {
  display: inline-block;
}
</style>
