<template>
  <section class="bg-white dark:bg-pitch pl-18">
    <div class="py-10 mx-auto max-w-screen-xl flex flex-col gap-y-6 pr-4">
      <h1 class="text-gray-900 dark:text-insight">
        Members
      </h1>
      <div class="grid lg:(grid-cols-2 gap-10)">
        <div class="flex flex-col gap-y-10">
          <div
            v-if="isProjectMember && !isViewingAsGuest && !projectUserPermissionsStore.isMemberGuest"
            class="flex flex-row justify-end"
          >
            <input
              ref="userSearchInput"
              v-model="userSearchValue"
              class="mainLoginInput block text-sm bg-pitch border-white rounded-md border-r-0 rounded-r-none w-60 h-9 placeholder:text-insight placeholder-gray-100 focus:(border-frequency ring-frequency border border-r-2 rounded)"
              type="text"
              placeholder="&#61442; Search by user email"
              :data-tooltip-target="!isUserHasFullAccess ? 'userSearchInputTooltipId' : null"
              data-tooltip-placement="bottom"
              :disabled="!isUserHasFullAccess"
              @input="searchUserInputChanged"
              @click="openUserSearch()"
            >
            <div
              v-if="!isUserHasFullAccess"
              id="userSearchInputTooltipId"
              role="tooltip"
              class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
            >
              {{ disableText }}
              <div
                class="tooltip-arrow"
                data-popper-arrow
              />
            </div>
            <div>
              <button
                class="inline-flex py-2 px-3 text-sm btn bg-moss border items-center justify-center text-white rounded-md border-l-1 rounded-l-none group dark:hover:bg-util-gray-04 dark:focus:ring-util-gray-04 disabled:(cursor-not-allowed bg-util-gray-04 text-util-gray-02 btn-border btn-border-l-1)"
                :disabled="!isUserHasFullAccess"
                @click="addSelectedUser()"
              >
                Add member
                <icon-fa-plus
                  class="h-2 w-2 ml-2 text-insight focus:border-none focus:border-transparent ring-moss outline-none group-disabled:text-util-gray-03"
                />
                <div
                  v-if="!isUserHasFullAccess"
                  id="addProjectMemberTooltipId"
                  role="tooltip"
                  class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
                >
                  {{ disableText }}
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
                class="bg-[#FFDADA] border-l-3 border-[#A31A33] rounded p-1 text-moss text-sm"
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
              v-for="user in userSort"
              :key="`${user.email}`"
              :user="user"
              :roles="roles"
              :editable="isUserHasFullAccess"
              :is-project-member="isProjectMember"
              :is-viewing-as-guest="isViewingAsGuest"
              :is-deleting="isDeletingProject"
              :is-error="isErrorDeleteProject"
              :is-success="isSuccessDeleteProject"
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

        <DialogMember
          :show-alert-success="showAlertSuccess"
          :show-alert-error="showAlertError"
          :show-alert-duplicate="showAlertDuplicate"
          @click="closeAlert"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type DropdownOptions, Dropdown, initTooltips } from 'flowbite'
import { type Ref, computed, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import type { UserTypes } from '@rfcx-bio/common/dao/types'
import { type ProjectRole } from '@rfcx-bio/common/roles'

import DialogMember from '@/_components/dialog_member.vue'
import { apiClientKey } from '@/globals'
import { useProjectUserPermissionsStore, useStore } from '~/store'
import { useAddProjectMember, useDeleteProjectMember, useGetProjectMembers, useSearchUsers, useUpdateProjectMember } from './_composables/use-project-member'
import ProjectMember from './components/project-member.vue'
import ProjectUserSearch from './components/project-user-search.vue'

const route = useRoute()
const store = useStore()
const projectUserPermissionsStore = useProjectUserPermissionsStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => store.selectedProject?.id)
const isProjectMember = computed(() => projectUserPermissionsStore.isMember)
const isViewingAsGuest = computed(() => {
  return route.query.guest === '1' || projectUserPermissionsStore.isExternalGuest
})

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

const disableText = ref('Contact your project administrator for permission to manage project members')

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
const { mutate: mutatePatchUserRole } = useUpdateProjectMember(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutatePostProjectMember } = useAddProjectMember(apiClientBio, store.selectedProject?.id ?? -1)
const { isPending: isDeletingProject, isError: isErrorDeleteProject, isSuccess: isSuccessDeleteProject, mutate: mutateDeleteProjectMember } = useDeleteProjectMember(apiClientBio, store.selectedProject?.id ?? -1)

const userSearchResult = computed(() => {
  return searchedUsers.value
})

const userSort = computed(() => {
  return users.value?.filter(u => u.roleId === 4).concat(users.value?.filter(u => u.roleId !== 4).sort(function (a, b) {
    if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1
    if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1
    return 0
  }))
})

const isUserHasFullAccess = computed<boolean>(() => {
  return projectUserPermissionsStore.role === 'admin' || projectUserPermissionsStore.role === 'owner'
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

const onEmitSelectedUser = (user: UserTypes['light']):void => {
  userSearchValue.value = user.email
  userToAdd.value.firstName = user.firstName
  userToAdd.value.lastName = user.lastName
  userToAdd.value.email = user.email
  userToAdd.value.id = user.id
  searchDropdown.value.hide()
}

const addSelectedUser = ():void => {
  if (userSearchValue.value === '') return
  mutatePostProjectMember({
    email: userSearchValue.value,
    role: 'user'
  }, {
    onSuccess: () => {
      usersRefetch()
      showAlertSuccess.value = true
      setTimeout(() => {
        showAlertSuccess.value = false
        console.info('text')
  }, 7000)
    },
    onError: () => {
      showAlertError.value = (true)
      setTimeout(() => {
        showAlertError.value = false
        console.info('text')
  }, 7000)
}
  })
}

const changeUserRole = (email: string, role: ProjectRole):void => {
  mutatePatchUserRole({
    email,
    // castable because the roles are converted from variable `roles` up top which non of it
    // cannot invoke the return value of `none`
    role: role as Exclude<ProjectRole, 'none'>
  }, {
    onSuccess: () => {
      usersRefetch()
    }
  })
}

const deleteProjectMember = (email: string):void => {
  mutateDeleteProjectMember(email, {
    onSuccess: () => {
      usersRefetch()
    }
  })
}

onMounted(() => {
  initTooltips()
})

const showAlertSuccess = ref()
const showAlertError = ref(false)
const showAlertDuplicate = ref(false)

</script>

<style lang="scss" scoped>
@import "//netdna.bootstrapcdn.com/font-awesome/3.0/css/font-awesome.css";
.mainLoginInput::-webkit-input-placeholder {
font-family: Poppins, Roboto, Noto Sans, FontAwesome
}

.mainLoginInput::-moz-placeholder  {
font-family: FontAwesome;
}

.mainLoginInput:-ms-input-placeholder  {
font-family: FontAwesome;
}
</style>
