<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl pt-4 md:pt-10">
      <div class="flex flex-row gap-x-2 text-xs font-medium items-center">
        <router-link :to="{ name: ROUTE_NAMES.adminProject }">
          Projects
        </router-link>
        <icon-fa-chevron-right class="self-center text-xxs" />
        <router-link
          :to="{ name: ROUTE_NAMES.adminMember, params: { projectId: project.id } }"
          class="font-bold"
        >
          {{ project.name ?? project.id }}
        </router-link>
      </div>
      <h2 class="mt-2 mb-10">
        Manage project members
      </h2>
      <table class="w-full text-left rtl:text-right table-auto md:table-fixed">
        <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
          <tr>
            <th class="<sm:hidden">
              Name
            </th>
            <th class="px-2 py-3">
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
              class="py-1"
            >
              <div class="relative py-2">
                <form
                  @submit.prevent="addMember"
                >
                  <input
                    v-model="newMemberEmail"
                    type="email"
                    name="newMemberEmail"
                    autocomplete="off"
                    class="border-0 w-full rounded-md p-2 input-field relative"
                    placeholder="+ Add new member by email"
                    @keydown.delete="errorMessage = ''"
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
            v-for="member in sortedMembers"
            :key="member.userId"
            class="border-y-1 border-util-gray-03"
          >
            <member-item
              :member="member"
              :project-id="project.id"
              @emit-delete-member="deleteMember"
            />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useSuperStore } from '~/store'
import { type Error } from '../error'
import { useSuperAddProjectMember, useSuperDeleteProjectMember, useSuperGetProjectMembers } from './_composables/use-members'
import MemberItem from './components/member-item.vue'

const route = useRoute()
const router = useRouter()
const store = useSuperStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const project = computed(() => {
  return store.project ?? { id: Number(route.params.projectId), name: route.params.projectSlug }
})

// == get members ==
const { data: members, refetch: refetchMembers, error } = useSuperGetProjectMembers(apiClientBio, project.value.id)

const sortedMembers = computed(() => {
  return members.value?.filter(u => u.roleId === 4).concat(members.value?.filter(u => u.roleId !== 4).sort(function (a, b) {
    if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1
    if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1
    return 0
  }))
})
onMounted(() => {
  refetchMembers()
})

watch(error, (newError) => {
  if (newError?.response?.status === 401) {
    router.push({ name: ROUTE_NAMES.error })
  }
})

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
      errorMessage.value = 'Failed to add member (code: ' + error.response?.status + ')'
    }
  })
}

// == delete member ==
const { mutate: mutateDeleteMember } = useSuperDeleteProjectMember(apiClientBio, project.value.id)

const deleteMember = (email: string) => {
  mutateDeleteMember(
    email,
    {
      onSuccess: () => {
        refetchMembers()
      },
      onError: (error: Error) => {
        errorMessage.value = 'Failed to delete member (code: ' + error.response?.status + ')'
      }
    }
  )
}

</script>
