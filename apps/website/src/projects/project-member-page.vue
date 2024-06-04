<template>
  <section class="bg-white dark:bg-pitch pl-18">
    <div class="py-10 mx-auto max-w-screen-xl flex flex-col gap-y-6 pr-4">
      <h1 class="text-gray-900 dark:text-insight">
        Members
      </h1>
      <div
        v-if="!users"
        class="text-left"
      >
        <span>
          It seems the page didn’t load as expected.<br>
          Please refresh your browser to give it another go.
        </span>
      </div>
      <div
        v-else
        class="grid lg:(grid-cols-2 gap-10)"
      >
        <div class="flex flex-col gap-y-10">
          <div
            class="flex flex-row justify-end"
          >
            <input
              ref="userSearchInput"
              v-model="userSearchValue"
              class="mainLoginInput block text-sm bg-pitch border-white rounded-md border-r-0 rounded-r-none w-60 h-9 placeholder:text-insight placeholder-gray-100 focus:(border-frequency ring-frequency border border-r-2 rounded)"
              type="text"
              placeholder="&#61442; Search by user email"
              :data-tooltip-target="!store.userIsFullProjectMember ? 'userSearchInputTooltipId' : null"
              data-tooltip-placement="bottom"
              :disabled="!store.userIsAdminProjectMember"
              @input="searchUserInputChanged"
              @click="openUserSearch()"
            >
            <div
              v-if="!store.userIsAdminProjectMember"
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
                :disabled="!store.userIsAdminProjectMember"
                @click="addSelectedUser()"
              >
                Add member
                <icon-fa-plus
                  class="h-2 w-2 ml-2 text-insight focus:border-none focus:border-transparent ring-moss outline-none group-disabled:text-util-gray-03"
                />
                <div
                  v-if="!store.userIsAdminProjectMember"
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
              <icon-custom-ic-loading
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
                    class="w-full mt-1 border border-util-gray-03 rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
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
                    class="w-full mt-1 border border-util-gray-03 rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
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
                    class="w-full mt-1 border border-util-gray-03 rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70"
                  >
                </div>
              </div>
              <div
                v-if="addNewUserError"
                class="bg-spoonbill border-l-3 border-ibis rounded p-1 text-moss text-sm"
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
              class="z-10 w-[15rem] hidden px-0 mx-auto max-w-screen-md text-insight bg-echo border-util-gray-03 border-b-0 border-l border-r rounded-b-lg divide-y divide-gray-100 shadow overflow-y-scroll"
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
              :editable="store.userIsAdminProjectMember"
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

        <alert-dialog
          v-if="showAlert && success == 'success'"
          severity="success"
          :title="title"
          :message="message"
        />
        <alert-dialog
          v-else-if="showAlert && success == 'error'"
          severity="error"
          :title="title"
          :message="message"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type DropdownOptions, Dropdown, initTooltips } from 'flowbite'
import debounce from 'lodash.debounce'
import { type Ref, computed, inject, onMounted, ref } from 'vue'

import type { UserTypes } from '@rfcx-bio/common/dao/types'
import { type ProjectRole } from '@rfcx-bio/common/roles'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useAddProjectMember, useDeleteProjectMember, useGetProjectMembers, useSearchUsers, useUpdateProjectMember } from './_composables/use-project-member'
import ProjectMember from './components/project-member.vue'
import ProjectUserSearch from './components/project-user-search.vue'

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => store.project?.id)

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
    description: 'Project Owner - can manage and delete the project, edit project settings, and manage project members'
  },
  {
    id: 1,
    name: 'Admin',
    description: 'Project Administrator - can view and manage the project, edit project settings, and manage project members'
  },
  {
    id: 6,
    name: 'Expert',
    description: 'Project Member + Species Validator - can view and manage the project, run jobs, and validate species'
  },
  {
    id: 2,
    name: 'User',
    description: 'Project Member - can view the project, manage project species, manage recordings, view and create playlists'
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
const { data: searchedUsers, refetch: searchUsersRefetch } = useSearchUsers(apiClientBio, userSearchValue, computed(() => userSearchValue.value !== ''))
const { mutate: mutatePatchUserRole } = useUpdateProjectMember(apiClientBio, store.project?.id ?? -1)
const { mutate: mutatePostProjectMember } = useAddProjectMember(apiClientBio, store.project?.id ?? -1)
const { isPending: isDeletingProject, isError: isErrorDeleteProject, isSuccess: isSuccessDeleteProject, mutate: mutateDeleteProjectMember } = useDeleteProjectMember(apiClientBio, store.project?.id ?? -1)

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

onMounted(() => {
  searchDropdown.value = new Dropdown(userSearchResultContainer.value, userSearchInput.value, dropdownOptions)
  notFoundDropdown.value = new Dropdown(userSearchResultNotFoundContainer.value, userSearchInput.value, dropdownOptions)
})

const openUserSearch = async () => {
  userSearchInput.value?.focus()
  if (userSearchResult.value && userSearchResult.value.length !== 0) searchDropdown.value.show()
}

const showNotFoundContainer = async (): Promise<void> => {
  notFoundDropdown.value.show()
}

const hideNotFoundContainer = async (): Promise<void> => {
  notFoundDropdown.value.hide()
}

const searchUserInputChanged = debounce(async () => {
  await searchUsersRefetch()

  if (userSearchResult.value && userSearchResult.value.length) {
    showNotFoundContainer()
    hideNotFoundContainer()
    searchDropdown.value.show()
  } else showNotFoundContainer()
}, 500)

const inviteNewUser = (): void => {
  if (!newUser.value.firstName.length || !newUser.value.lastName.length || !newUser.value.email.length) {
    addNewUserError.value = true
    return
  }
  addNewUserError.value = false
  new Dropdown(inviteNewUserFormContainer.value, userSearchInput.value, dropdownOptions).hide()
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
  const isDuplicate = users.value?.some(user => user.email === userSearchValue.value) ?? false
  if (isDuplicate) {
    showAlertDialog('error', 'Duplicate Member Detected.', 'This user is already a part of the project. Please invite another member')
  } else {
  mutatePostProjectMember({
    email: userSearchValue.value,
    role: 'user'
  }, {
    onSuccess: () => {
      usersRefetch()
      showAlertDialog('success', 'Success', 'New Project member added successfully')
    },
    onError: () => {
      showAlertDialog('error', 'Verification Needed.', 'We couldn’t add this user as a project member because their account is unverified. Please ensure the user has verified their account before trying again.')
}
  })
}
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

<style lang="scss" scoped>
@import "//netdna.bootstrapcdn.com/font-awesome/3.0/css/font-awesome.css";
.mainLoginInput::-webkit-input-placeholder {
font-family: Poppins, Roboto, Noto Sans, FontAwesome
}

.mainLoginInput::-moz-placeholder  {
  font-family: FontAwesome, Poppins;
}

.mainLoginInput:-ms-input-placeholder  {
font-family: FontAwesome, Poppins;
}
</style>
