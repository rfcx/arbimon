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
              v-model="searchUserValue"
              class="block bg-moss border-util-gray-03 text-sm rounded-md border-r-0 rounded-r-none w-55 placeholder:text-insight focus:(border-frequency ring-frequency border border-r-2 rounded)"
              type="text"
              placeholder="Search by user name, email"
              data-dropdown-toggle="dropdown"
              @input="searchUsers"
              @click="openUserSearch()"
            >
            <div>
              <button
                class="btn bg-moss border border-util-gray-03 rounded-md border-l-0 rounded-l-none"
                @click="addUser()"
              >
                <icon-fa-plus
                  class="h-3 w-3 text-insight"
                  data-tooltip-target="projectMembers"
                  data-tooltip-style="light"
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
              v-if="noResults"
              class="absolute bottom-0 left-1 w-20"
            >
              <span>No users found</span>
              <button
                class="btn btn-primary btn-sm"
                ng-click="invite()"
              >
                Invite
              </button>
            </div>
            <!-- <div
              ref="userSearchResultContainer"
              class="z-10 w-[20.0rem] hidden px-0 mx-auto max-w-screen-md text-insight bg-echo border-cloud border-b-0 border-l border-r rounded-b-lg divide-y divide-gray-100 shadow overflow-y-scroll"
              :class="{'border-b-1 rounded-t-lg border-t-1': searchUserValue && !usersSearchResult, 'border-b-1 border-t-1 rounded-t-lg max-h-66': orgsSearchResult?.length}"
            >
              <UserSearchResultCard
                v-for="u in usersSearchResult"
                :id="u.userId"
                :key="`${u.email}-search`"
                :user="u"
                @emit-add-selected-user="addUser"
              />
            </div> -->
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
import { initTooltips } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useDeleteProjectMember, useGetProjectMembers } from './_composables/use-project-member'
import ProjectMember from './components/project-member.vue'

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => store.selectedProject?.id)

const userSearchInput = ref<HTMLDivElement | null>(null)
const isSearchingUsers = ref(false)
const noResults = ref(false)
const searchUserValue = ref('')
const userToAdd = ref({
  firstName: '',
  lastName: '',
  email: ''
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
// const { mutate: mutatePostUserRole } = useUpdateUserRole(apiClientBio, store.selectedProject?.id ?? -1)
// const { mutate: mutatePatchUserRole } = useAddUserRole(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateDeleteProjectMember } = useDeleteProjectMember(apiClientBio, store.selectedProject?.id ?? -1)

// const userSearchResult = computed(() => {
//   return [] // searchUserValue.value ? [] : []
// })

const openUserSearch = async () => {
  userSearchInput.value?.focus()
  // searchDropdown.value.show()
}

const addUser = ():void => {
  if (userToAdd.value.email) return

  console.info(selectedProjectId, userToAdd.value)
  // TODO: 1.add a new user 2. refetch data
}

const searchUsers = ():void => {
  // await refetchUsersSearch()
  // if (userSearchResult.value && userSearchResult.value.length === 0) {
  //   showNotFoundContainer()
  // } else {
  //   showNotFoundContainer()
  //   hideNotFoundContainer()
  // }
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
