<template>
  <div class="flex flex-row justify-between items-center border-b-1 border-util-gray-03 pb-4">
    <div class="flex flex-row justify-start items-center whitespace-nowrap text-ellipsis overflow-hidden">
      <img
        v-if="user.image"
        :src="user.image"
        class="h-8 w-8 min-w-8 self-center rounded-full"
        alt="User image"
      >
      <div
        v-else
        class="h-8 w-8 min-w-8 bg-util-gray-03 rounded-full"
      />
      <div class="mx-3 flex flex-col justify-start whitespace-nowrap text-ellipsis overflow-hidden">
        <span
          class="font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
        >
          {{ user.firstName }} {{ user.lastName }}
        </span>
        <span
          class="text-fog whitespace-nowrap text-ellipsis overflow-hidden"
          :title="user.email"
        >
          {{ user.email }}
        </span>
      </div>
    </div>
    <div
      class="flex flex-row bg-light-500items-center"
    >
      <p
        v-if="user.roleId === 4"
        class="text-frequency"
      >
        {{ getUserRoleName() }}
      </p>
      <button
        v-else-if="store.userIsAdminProjectMember"
        :id="`dropdownRoleButton-${user.email}`"
        :data-dropdown-toggle="`dropdownRole-${user.email}`"
        data-dropdown-placement="bottom"
        :data-tooltip-target="!editable && !store.userIsGuest ? `${user.userId}changeUserRoleTooltipId` : null"
        data-tooltip-placement="bottom"
        class="bg-echo text-frequency border-1 border-util-gray-03 rounded-lg flex flex-row items-center py-1 px-2 disabled:hover:btn-disabled disabled:btn-disabled hover:bg-chirp hover:text-pitch hover:border-chirp"
        :disabled="!editable"
        type="button"
      >
        {{ getUserRoleName() }}
        <span class="pl-3">
          <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
          <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
        </span>
      </button>
      <p
        v-else
      >
        {{ getUserRoleName() }}
      </p>
      <div
        v-if="!editable && store.userIsAdminProjectMember"
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
      <MemberDelete
        v-if="user.roleId !== 4 && store.userIsAdminProjectMember"
        :user="user"
        :disabled-delete-button="!editable"
        :is-deleting="isDeleting"
        :is-error="isError"
        :is-success="isSuccess"
        @emit-delete-project-member="$emit('emitDeleteProjectMember', user.email)"
      />
      <div
        :id="`${user.userId}deleteUserTooltipId`"
        role="tooltip"
        class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
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
            class="flex flex-row justify-start items-center p-1 m-0"
            :class="[
              isRoleDisabled(role.id, user.role ?? 'none')
                ? 'opacity-50 cursor-not-allowed grayscale'
                : 'cursor-pointer hover:bg-chirp hover:text-pitch hover:(border-chirp rounded-lg)'
            ]"
            @click="!isRoleDisabled(role.id, user.role ?? 'none') && (handleChangeUserRole(user.email, role.id), closeMenu())"
          >
            <div class="flex flex-col">
              <span :class="{ 'font-medium': role.id === user.roleId }">
                {{ role.name }}
              </span>
              <span
                v-if="isRoleDisabled(role.id, user.role ?? 'none') && role.id !== user.roleId"
                class="text-[10px] text-red-500 italic"
              >
                Limit reached
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <alert-dialog
    v-if="showAlert && success == 'error'"
    severity="error"
    :title="title"
    :message="message"
  />
</template>
<script setup lang="ts">
import { Dropdown, initDropdowns, initTooltips } from 'flowbite'
import { onMounted, ref } from 'vue'

import type { ProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'
import { type ProjectInfoResponse } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type ProjectRole, getRoleById } from '@rfcx-bio/common/roles'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import MemberDelete from '@/projects/components/form/member-delete.vue'
import { useStore } from '~/store'

interface Role {
  id: number
  name: string
  description: string
}

let dropdown: Dropdown

const props = defineProps<{user: ProjectMember, roles: Role[], editable: boolean, isDeleting?: boolean, isError?: boolean, isSuccess?: boolean, projectInfo?: ProjectInfoResponse}>()
const emit = defineEmits<{(e: 'emitChangeUserRole', email: string, role: ProjectRole): void, (e: 'emitDeleteProjectMember', email: string): void}>()

const disableDeleteUserText = ref('Contact your project administrator for permission to delete project member')
const disableChangeUserRoleText = ref('Contact your project administrator for permission to manage project members')

const store = useStore()

const getUserRoleName = (): string => {
  const role = props.roles.find(r => r.id === props.user.roleId)
  return role !== undefined ? role.name : 'Not defined'
}

// Tier rollback follow-up (2026-08-17): this previously HARDCODED the
// April-2026 seed caps (premium 4 collaborators / 3 guests; free = block
// every role change) long after the server limits were rolled back to NULL
// (unlimited) on 2026-07-12 — leaving members stuck as Guest on free
// projects and blocking promotions on larger premium projects, contrary to
// the /pricing page. It now mirrors the server guard
// (assertProjectMemberUpdateAllowed) using the SERVER-PROVIDED
// projectInfo.limits + usage: NULL/undefined limits disable nothing, and if
// limits ever go non-NULL again the pre-warning re-arms automatically with
// the same bucket semantics as the server (same-bucket moves always allowed).
const isRoleDisabled = (targetRoleId: number, currentRole: ProjectRole): boolean => {
  if (props.projectInfo?.isLocked === true) return true

  const limits = props.projectInfo?.limits
  const usage = props.projectInfo?.usage
  if (limits === undefined || usage === undefined) return false

  const targetRoleName = getRoleById(targetRoleId) as ProjectRole
  const collaboratorRoles: ProjectRole[] = ['admin', 'expert', 'user', 'entry']

  const isTargetCollaborator = collaboratorRoles.includes(targetRoleName)
  const isCurrentCollaborator = collaboratorRoles.includes(currentRole)

  const isTargetGuest = targetRoleName === 'viewer'
  const isCurrentGuest = currentRole === 'viewer'

  // Admin cap (team-shape limits 2026-08-17): checked on any transition INTO
  // admin, including collaborator→admin, so it precedes the same-bucket
  // pass-through — mirrors assertProjectMemberUpdateAllowed exactly. The
  // server sends EFFECTIVE limits (Pro-owned projects report NULL caps), so
  // no exemption logic exists client-side.
  const adminLimit = limits.adminCount ?? null
  if (targetRoleName === 'admin' && currentRole !== 'admin' && adminLimit !== null) {
    if ((usage.adminCount ?? 0) >= adminLimit) return true
  }

  if (isTargetCollaborator && !isCurrentCollaborator && limits.collaboratorCount !== null) {
    return usage.collaboratorCount >= limits.collaboratorCount
  }

  if (isTargetGuest && !isCurrentGuest && limits.guestCount !== null) {
    return usage.guestCount >= limits.guestCount
  }

  return false
}

const closeMenu = (): void => {
  dropdown.hide()
}

onMounted(() => {
  try {
    initDropdowns()
    initTooltips()

    dropdown = new Dropdown(
    document.getElementById(`dropdownRole-${props.user.email}`),
    document.getElementById(`dropdownRoleButton-${props.user.email}`)
  )
  } catch (e) { }
})

const handleChangeUserRole = (email: string, roleId: number): void => {
  try {
    const role = getRoleById(roleId)
    emit('emitChangeUserRole', email, role)
    closeMenu()
  } catch (error) {
    showAlertDialog('error', 'A Server Error Occurred.', 'We encountered some issues while saving your changes. Could you please try again?')
  }
}

const success = ref('')
const title = ref('')
const message = ref('')
const showAlert = ref(false)

const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

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
