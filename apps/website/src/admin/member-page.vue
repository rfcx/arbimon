<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl">
      <div class="mt-20 flex flex-row gap-x-2 text-xs font-medium items-center">
        <router-link :to="{ name: ROUTE_NAMES.adminProject }">
          Projects
        </router-link>
        <icon-fa-chevron-right class="self-center text-xxs" />
        <router-link
          :to="{ name: ROUTE_NAMES.adminMember, params: { projectId: project.id } }"
          class="font-bold"
        >
          {{ project.slug ?? project.id }}
        </router-link>
      </div>
      <h2 class="mt-2 mb-10">
        Manage project members
      </h2>
      <table class="w-full text-left rtl:text-right table-auto">
        <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
          <tr>
            <th class="px-2 py-3">
              Name
            </th>
            <th>
              Email
            </th>
            <th>
              Role
            </th>
            <th>
              Actions
            </th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td
              colspan="4"
              class="py-3"
            >
              <div class="relative py-2">
                <form
                  @submit.prevent="addMember"
                >
                  <input
                    v-model="newMemberEmail"
                    type="email"
                    name="newMemberEmail"
                    autocomplete="on"
                    class="border-0 w-full rounded-md p-2 input-field relative"
                    placeholder="+ Add new member by email"
                  >
                  <button
                    v-if="newMemberEmail.length > 0"
                    class="absolute z-10 rounded-r-md p-2 right-0"
                  >
                    Add
                  </button>
                </form>
              </div>
              <div
                v-if="errorMessage"
                class="text-ibis dark:text-flamingo text-sm px-2"
              >
                {{ errorMessage }}
              </div>
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr
            v-for="member in members"
            :key="member.userId"
            class="border-y-1 border-util-gray-03"
          >
            <td class="px-2 py-3">
              {{ member.firstName }} {{ member.lastName }}
            </td>
            <td class="px-2 py-3">
              {{ member.email }}
            </td>
            <td class="px-2 py-3">
              {{ getRoleById(member.roleId) }}
            </td>
            <td class="px-2 py-3">
              <span
                v-if="needConfirmToDelete.email === member.email && needConfirmToDelete.status"
                class="text-sm"
              >
                Are you sure? This action cannot be undone. <span
                  class="text-flamingo cursor-pointer"
                  @click="deleteMember(member.email)"
                >Delete</span>
                <span
                  class="text-insight cursor-pointer"
                  @click="needConfirmToDelete = { email: member.email, status: false }"
                >
                  Cancel</span>
              </span>
              <button
                v-else
                class="text-sm text-insight bg-ibis rounded-md px-2 py-1"
                @click="needConfirmToDelete = { email: member.email, status: true }"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getRoleById } from '@rfcx-bio/common/roles'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { type Error } from './composables/error'
import { useSuperAddProjectMember, useSuperDeleteProjectMember, useSuperGetProjectMembers } from './composables/use-members'

const route = useRoute()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const project = computed(() => {
  return { id: Number(route.params.projectId), slug: route.params.projectSlug }
})

// == get members ==
const { data: members, refetch: refetchMembers } = useSuperGetProjectMembers(apiClientBio, project.value.id)

// == add member ==
const newMemberEmail = ref('')

// validate
const errorMessage = ref('')

const isValidatEmail = () => {
  const emailIsValid = (email: string) => {
    return email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
  }

  if (newMemberEmail.value !== '' && !emailIsValid(newMemberEmail.value)) {
    errorMessage.value = 'Please enter a valid email'
    return false
  }

  errorMessage.value = ''
  return true
}

// call api

const { mutate: mutateAddMember } = useSuperAddProjectMember(apiClientBio, project.value.id)

const addMember = () => {
  console.info('add member')
  if (!isValidatEmail()) { return }

  mutateAddMember({
    email: newMemberEmail.value,
    role: 'user'
  }, {
    onSuccess: () => {
      newMemberEmail.value = ''
      refetchMembers()
    },
    onError: (error: Error) => {
      console.error('error', error)
      if (error.response?.status === 409) {
        errorMessage.value = 'This user is already a member of this project.'
      } else if (error.response?.status === 404) {
        errorMessage.value = 'This user does not exist.'
      } else {
        errorMessage.value = 'Failed to add member (code: ' + error.response?.status + ')'
      }
    }
  })
}

// == TODO: edit member ==

// == TODO: delete member ==
const { mutate: mutateDeleteMember } = useSuperDeleteProjectMember(apiClientBio, project.value.id)
const needConfirmToDelete = ref({ email: '', status: false })

const deleteMember = (email: string) => {
  console.info('delete member')
  mutateDeleteMember(
    email,
    {
      onSuccess: () => {
        console.info('onSuccess')
        refetchMembers()
      },
      onError: (error: Error) => {
        console.error('error', error)
        errorMessage.value = 'Failed to delete member (code: ' + error.response?.status + ')'
      },
      onSettled: () => {
        needConfirmToDelete.value = { email: '', status: false }
      }
    }
  )
}

</script>
