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
        <span class="text-fog mt-2">
          {{ user.email }}
        </span>
      </div>
    </div>
    <div
      v-if="isProjectMember && !isViewingAsGuest"
      class="flex flex-row bg-light-500items-center"
    >
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
        :data-tooltip-target="`${user.userId}changeUserRoleTooltipId`"
        data-tooltip-placement="bottom"
        class="bg-echo text-frequency rounded-lg flex flex-row items-center py-1 px-2 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!editable"
        type="button"
      >
        {{ getUserRoleName() }}
        <span class="pl-3">
          <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
          <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
        </span>
      </button>
      <div
        v-if="!editable"
        :id="`${user.userId}changeUserRoleTooltipId`"
        role="tooltip"
        class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ disableChangeUserRoleText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <button
        v-if="user.roleId !== 4"
        type="button"
        class="bg-echo text-danger rounded-lg flex flex-row items-center py-1 px-2 ml-2 disabled:hover:btn-disabled disabled:btn-disabled"
        :data-tooltip-target="`${user.userId}deleteUserTooltipId`"
        data-tooltip-placement="bottom"
        :disabled="!editable"
        @click="$emit('emitDeleteProjectMember', user.email)"
      >
        <icon-fa-close class="cursor-pointer h-3 inline" />
      </button>
      <div
        :id="`${user.userId}deleteUserTooltipId`"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ editable ? 'Delete user' : disableDeleteUserText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <div
        :id="`dropdownRole-${user.email}`"
        class="z-10 hidden bg-echo divide-y rounded-lg shadow w-35"
      >
        <ul
          :aria-labelledby="`dropdownRoleButton-${user.email}`"
          aria-orientation="vertical"
          role="menu"
          tabindex="-1"
        >
          <li
            v-for="role in roles.filter(r => r.id !== 4)"
            :key="role.id"
            class="flex flex-row justify-start items-center p-1 m-0 cursor-pointer"
            @click="$emit('emitChangeUserRole', user.email, role.name); closeMenu()"
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
import { Dropdown, initDropdowns, initTooltips } from 'flowbite'
import { onMounted, ref } from 'vue'

import type { ProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'

interface Role {
  id: number
  name: string
  description: string
}

let dropdown: Dropdown

const props = defineProps<{user: ProjectMember, roles: Role[], editable: boolean, isProjectMember: boolean, isViewingAsGuest: boolean}>()
defineEmits<{(e: 'emitChangeUserRole', email: string, role: string): void, (e: 'emitDeleteProjectMember', email: string): void}>()

const disableDeleteUserText = ref('Contact your project administrator for permission to delete project member')
const disableChangeUserRoleText = ref('Contact your project administrator for permission to manage project members')

const getUserRoleName = (): string => {
  const role = props.roles.find(r => r.id === props.user.roleId)
  return role !== undefined ? role.name : 'Not defined'
}

const closeMenu = (): void => {
  dropdown.hide()
}

onMounted(() => {
  initDropdowns()
  initTooltips()
  dropdown = new Dropdown(
    document.getElementById(`dropdownRole-${props.user.email}`),
    document.getElementById(`dropdownRoleButton-${props.user.email}`)
  )
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
