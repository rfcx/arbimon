<template>
  <td
    class="px-2 py-3 <sm:hidden"
  >
    {{ member.firstName }} {{ member.lastName }}
  </td>
  <td class="px-2 py-3">
    {{ member.email }}
  </td>
  <td class="px-2 py-3">
    <div
      class="flex flex-start flex-row items-center gap-2 justify-start"
    >
      <p v-if="selectedRoleId === getIdByRole('owner')">
        Owner
      </p>
      <select
        v-else
        :id="`role-${member.email}`"
        v-model="selectedRoleId"
        class="rounded-md px-2 py-1 w-full lg:w-1/2 capitalize text-base border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
        :disabled="isUpdatingRole"
        @change="updateRole(member.email, selectedRoleId)"
      >
        <option
          v-for="option in roleOptions"
          :key="option.id"
          :value="option.id"
        >
          {{ option.role }}
        </option>
      </select>
      <icon-custom-ic-loading
        v-if="isUpdatingRole"
        class="h-4 w-4"
      />
      <span
        v-else-if="updateRoleErrorMessage"
        class="text-xs text-flamingo"
      >
        {{ updateRoleErrorMessage }}
      </span>
    </div>
  </td>
  <td class="px-2 py-3">
    <span
      v-if="needConfirmToDelete"
      class="text-sm flex flex-col gap-1"
    >
      Are you sure? This action cannot be undone.
      <div class="flex gap-2 sm:(flex-row items-center) flex-col items-start">
        <span
          class="text-sm text-insight bg-ibis rounded-md px-2 py-1 cursor-pointer flex-0"
          @click="deleteMember(member.email)"
        >Delete
        </span>
        <span
          class="text-insight cursor-pointer"
          @click="needConfirmToDelete = false"
        >
          Cancel
        </span>
      </div>

    </span>
    <button
      v-else-if="selectedRoleId !== getIdByRole('owner')"
      class="text-sm text-insight bg-ibis rounded-md px-2 py-1"
      @click="needConfirmToDelete = true"
    >
      Delete
    </button>
  </td>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'

import type { ProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'
import { getIdByRole, getRoleById, orderedRoles } from '@rfcx-bio/common/roles'

import { apiClientKey } from '@/globals'
import type { Error } from '../../error'
import { useSuperUpdateProjectMember } from '../_composables/use-members'

const apiClientBio = inject(apiClientKey) as AxiosInstance

const props = defineProps<{
  member: ProjectMember,
  projectId: number
}>()
const emit = defineEmits<{(e: 'emitDeleteMember', email: string): void }>()

// update role
const roleOptions = orderedRoles.filter(r => !['external', 'owner'].includes(r)).map(r => ({ role: r, id: getIdByRole(r) })).reverse()
const selectedRoleId = ref(props.member.roleId)
const isUpdatingRole = ref(false)
const { mutate: matateUpdateMember } = useSuperUpdateProjectMember(apiClientBio, props.projectId)
const updateRoleErrorMessage = ref('')

const updateRole = (email: string, roleId: number) => {
  updateRoleErrorMessage.value = ''
  if (roleId === props.member.roleId) return
  const role = getRoleById(roleId)
  if (role === 'none') return
  isUpdatingRole.value = true
  matateUpdateMember({ email, role }, {
    onSuccess: () => {
      isUpdatingRole.value = false
      updateRoleErrorMessage.value = ''
    },
    onError: (error: Error) => {
      isUpdatingRole.value = false
      updateRoleErrorMessage.value = `Failed to update role (code: ${error.response?.status})`
    }
  })
}

// delete
const needConfirmToDelete = ref(false)
const isDeleting = ref(false)

const deleteMember = (email: string) => {
  isDeleting.value = true
  emit('emitDeleteMember', email)
}

watch(() => props.member.roleId, (newVal) => {
  selectedRoleId.value = newVal
})

</script>
