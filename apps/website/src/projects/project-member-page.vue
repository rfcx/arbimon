<template>
  <section class="bg-white dark:bg-pitch pl-18">
    <div class="py-10 mx-auto max-w-screen-xl flex flex-col gap-y-6">
      <h1 class="text-gray-900 dark:text-insight">
        Project Users
      </h1>
      <div class="grid lg:(grid-cols-2 gap-10)">
        <div class="flex flex-col gap-y-4">
          <div class="flex flex-row justify-end">
            <input
              ref="userSearchInput"
              v-model="userSearchValue"
              class="block bg-moss border-util-gray-03 text-sm rounded-md border-r-0 rounded-r-none w-60 placeholder:text-insight focus:(border-frequency ring-frequency border border-r-2 rounded)"
              type="text"
              placeholder="Search by user name, email"
              data-dropdown-toggle="dropdown"
              @input="searchUserInputChanged"
              @click="openUserSearch()"
            >
            <div>
              <button
                class="btn bg-moss border border-util-gray-03 rounded-md border-l-0 rounded-l-none dark:hover:bg-util-gray-04 dark:hover:text-pitch dark:focus:ring-util-gray-04"
                data-tooltip-target="projectMembers"
                data-tooltip-style="light"
                @click="addSelectedUser()"
              >
                <icon-fa-plus
                  class="h-3 w-3 text-insight focus:border-none focus:border-transparent ring-moss outline-none"
                />
                <div
                  id="projectMembers"
                  role="tooltip"
                  class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
                >
                  Add new user
                  <div
                    class="tooltip-arrow"
                    data-popper-arrow
                  />
                </div>
              </button>
              <icon-fas-spinner
                v-if="isSearchingUsers"
                class="absolute t-1 r-1 animate-spin h-8 w-8 text-gray-900"
              />
            </div>
            <div
              ref="userSearchResultNotFoundContainer"
              class="z-10 hidden w-[15rem] text-insight bg-echo border-cloud border-b border-l border-r rounded-b-lg shadow flex flex-row justify-between p-3"
            >
              <p class="text-sm font-normal font-sans text-insight leading-tight">
                We are unable to find this user.
              </p>
              <button
                type="button"
                class="text-frequency text-sm font-medium font-display leading-none"
                @click="openInviteNewUserForm"
              >
                Invite
              </button>
            </div>

            <div
              ref="inviteNewUserFormContainer"
              class="z-10 hidden w-[15rem] text-insight bg-echo border-cloud border-b border-l border-r rounded-b-lg shadow flex flex-col gap-y-5 px-2 py-5"
            >
              <div class="flex flex-col gap-y-3">
                <div>
                  <p class="text-insight text-base font-medium font-sans">
                    First name*
                  </p>
                  <input
                    id="new-user-firstName"
                    v-model="newUser.firstName"
                    name="firstName"
                    type="text"
                    class="w-full mt-1 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
                    required
                  >
                </div>
                <div>
                  <p class="text-insight text-base font-medium font-sans">
                    Last name*
                  </p>
                  <input
                    id="new-user-lastName"
                    v-model="newUser.lastName"
                    name="lastName"
                    type="text"
                    class="w-full mt-1 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
                    required
                  >
                </div>
                <div>
                  <p class="text-insight text-base font-medium font-sans">
                    Email*
                  </p>
                  <input
                    id="new-user-email"
                    v-model="newUser.email"
                    name="email"
                    type="text"
                    class="w-full mt-1 border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
                  >
                </div>
              </div>
              <div
                v-if="addNewUserError"
                class="bg-[#FFDADA] border-l-3 border-[#CC1E3D] rounded p-1 text-moss text-sm"
              >
                All fields are required.
              </div>
              <div class="flex w-full flex-row justify-end">
                <button
                  type="submit"
                  class="btn btn-primary px-3 py-1"
                  @click="inviteNewUser"
                >
                  Invite
                </button>
              </div>
            </div>

            <div
              ref="userSearchResultContainer"
              class="z-10 w-[15rem] hidden px-0 mx-auto max-w-screen-md text-insight bg-echo border-cloud border-b-0 border-l border-r rounded-b-lg divide-y divide-gray-100 shadow overflow-y-scroll"
              :class="{'border-b-1 rounded-t-lg border-t-1': userSearchValue && !userSearchResult, 'border-b-1 border-t-1 rounded-t-lg max-h-66': userSearchResult}"
            >
              <ProjectUserSearch
                v-for="u in userSearchResult"
                :id="u.id"
                :key="`${u.email}-search`"
                :user="u"
                @emit-selected-user="onEmitSelectedUser"
              />
            </div>
          </div>
          <div class="flex flex-col gap-y-4">
            <ProjectMember
              v-for="user in users"
              :key="`${user.email}`"
              :user="user"
              :roles="roles"
              @emit-change-user-role="changeUserRole"
              @emit-delete-project-member="deleteProjectMember"
            />
          </div>
        </div>
        <div>
          <div class="border rounded-lg bg-util-gray-04 border-util-gray-03 shadow divide-y divide-util-gray-03">
            <h4 class="p-3">
              Roles
            </h4>
            <div
              v-for="role in roles"
              :key="role.id"
              class="p-3"
            >
              <p class="font-semibold">
                {{ role.name }}
              </p>
              <p>{{ role.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type DropdownOptions, Dropdown, initTooltips } from 'flowbite'
import { type Ref, computed, inject, onMounted, ref } from 'vue'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useDeleteProjectMember, useGetProjectMembers, useSearchUsers } from './_composables/use-project-member'
import ProjectMember from './components/project-member.vue'
import ProjectUserSearch from './components/project-user-search.vue'
import type { UserType } from './types'

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => store.selectedProject?.id)

const searchDropdown = ref() as Ref<Dropdown>
const notFoundDropdown = ref() as Ref<Dropdown>
const dropdownOptions: DropdownOptions = { placement: 'bottom-start', triggerType: 'none', offsetDistance: 1 }

const userSearchInput = ref<HTMLDivElement | null>(null)
const userSearchResultContainer = ref<HTMLDivElement | null>(null)
const userSearchResultNotFoundContainer = ref<HTMLDivElement | null>(null)
const inviteNewUserFormContainer = ref<HTMLDivElement | null>(null)

const isSearchingUsers = ref(false)
const addNewUserError = ref(false)
const userSearchValue = ref('')

const newUser = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const userToAdd = ref({
  firstName: '',
  lastName: '',
  email: '',
  id: -1
})

const roles = [
{
      id: 4,
      name: 'Owner',
      description: 'Project Owner - can manage and delete project, validate species, manage project settings'
  },
  {
      id: 1,
      name: 'Admin',
      description: 'Project Administrator - can view and manage the project, validate species and manage project settings'
  },
  {
      id: 6,
      name: 'Expert',
      description: 'Project Member + Species Validator - can view and manage the project and validate species'
  },
  {
      id: 2,
      name: 'User',
      description: 'Project Member - can view the project, manage project species, manage recordings, view and create playlists and run jobs'
  },
  {
      id: 5,
      name: 'Data Entry',
      description: 'Limited Project Member - can view the project, manage project species, and manage recordings'
  },
  {
      id: 3,
      name: 'Guest',
      description: 'Project Guest - can view the project (and be Citizen Scientist if enabled)'
  }
]

const { data: users, refetch: usersRefetch } = useGetProjectMembers(apiClientBio, selectedProjectId)
const { data: searchedUsers, refetch: searchUsersRefetch } = useSearchUsers(apiClientBio, userSearchValue)
// const { mutate: mutatePostUserRole } = useUpdateUserRole(apiClientBio, store.selectedProject?.id ?? -1)
// const { mutate: mutatePatchUserRole } = useAddUserRole(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateDeleteProjectMember } = useDeleteProjectMember(apiClientBio, store.selectedProject?.id ?? -1)

const userSearchResult = computed(() => {
  return searchedUsers.value
})

onMounted(() => {
  searchDropdown.value = new Dropdown(userSearchResultContainer.value, userSearchInput.value, dropdownOptions)
  notFoundDropdown.value = new Dropdown(userSearchResultNotFoundContainer.value, userSearchInput.value, dropdownOptions)
})

const openUserSearch = async () => {
  userSearchInput.value?.focus()
  if (userSearchResult.value && userSearchResult.value.length !== 0) searchDropdown.value.show()
}

const openInviteNewUserForm = async (): Promise<void> => {
  hideNotFoundContainer()
  new Dropdown(inviteNewUserFormContainer.value, userSearchInput.value, dropdownOptions).show()
}

const showNotFoundContainer = async (): Promise<void> => {
  notFoundDropdown.value.show()
}

const hideNotFoundContainer = async (): Promise<void> => {
  notFoundDropdown.value.hide()
}

const searchUserInputChanged = async () => {
  if (userSearchValue.value.length > 2) await searchUsersRefetch()
  if (userSearchResult.value && userSearchResult.value.length) {
    showNotFoundContainer()
    hideNotFoundContainer()
    searchDropdown.value.show()
  } else showNotFoundContainer()
}

const inviteNewUser = (): void => {
  if (!newUser.value.firstName.length || !newUser.value.lastName.length || !newUser.value.email.length) {
    addNewUserError.value = true
    return
  }
  addNewUserError.value = false
  new Dropdown(inviteNewUserFormContainer.value, userSearchInput.value, dropdownOptions).hide()
  console.info('inviteNewUser', newUser.value)
  // TODO: 1. add a new user 2. refetch data
}

const onEmitSelectedUser = (user: UserType):void => {
  userSearchValue.value = user.email
  userToAdd.value.firstName = user.firstName
  userToAdd.value.lastName = user.lastName
  userToAdd.value.email = user.email
  userToAdd.value.id = user.id
  searchDropdown.value.hide()
}

const addSelectedUser = ():void => {
  console.info('addSelectedUser', selectedProjectId.value, userToAdd.value)
  // TODO: 1. add the user 2. refetch data
}

const changeUserRole = ():void => {
  console.info('changeUserRole')
}

const deleteProjectMember = (userId: number):void => {
  mutateDeleteProjectMember(userId, {
    onSuccess: () => {
      usersRefetch()
    }
  })
}

onMounted(() => {
  initTooltips()
})

</script>
