<script setup lang="ts">
import { computed, ref } from 'vue'

import SharedLayout from './shared-layout.vue'

const currentTab = ref('projects')
const filterSearch = ref('')
const filterPlan = ref('All Plan')
const filterPrivacy = ref('All Privacy')

const selectedUserId = ref<number | null>(null)

const allUsers = ref([
  { id: 1, name: 'John Doe', email: 'johndoe@rfcx.org', projectsOwned: 3, role: 'Owner', plan: 'Inactive', paidPlan: 'Inactive' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', projectsOwned: 5, role: 'Admin', plan: 'Pro', paidPlan: 'Inactive' }
])

const allProjects = ref([
  { id: 1, name: 'Biodiversity in Thailand', ownerName: 'John Doe', memberCount: 3, minutes: 40000, jobsRun: 20, privacy: 'Public', plan: 'Inactive', paidPlan: 'Inactive' },
  { id: 2, name: 'Northern Monitoring', ownerName: 'John Doe', memberCount: 5, minutes: 1000000, jobsRun: 100, privacy: 'Private', plan: 'Pro', paidPlan: 'Inactive' },
  { id: 3, name: 'Forest Project', ownerName: 'Jane Smith', memberCount: 2, minutes: 5000, jobsRun: 10, privacy: 'Public', plan: 'Free', paidPlan: 'Inactive' }
])

const selectedUser = computed(() => {
  if (selectedUserId.value === null) return null
  return allUsers.value.find(u => u.id === selectedUserId.value)
})

const userProjects = computed(() => {
  if (selectedUser.value === null) return []
  return filteredProjects.value.filter(p => p.ownerName === selectedUser.value?.name)
})

const handleSeeDetails = (id: number) => {
  console.info('Viewing details for user:', id)
  selectedUserId.value = id
  currentTab.value = 'users'
}

const handleTabChange = (newTab: string) => {
  currentTab.value = newTab
  selectedUserId.value = null
}

const activeDropdown = ref<number | null>(null)

const toggleDropdown = (id: number) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const openUserTab = () => {
  selectedUserId.value = null
}

const filteredProjects = computed(() => {
  const search = filterSearch.value.toLowerCase().trim()

  return allProjects.value.filter(item => {
    const searchMatch = !search ||
                        item.name?.toLowerCase().includes(search) ||
                        item.ownerName?.toLowerCase().includes(search)

    const planMatch = filterPlan.value === 'All Plan' ||
                       item.plan === filterPlan.value

    const privacyMatch = filterPrivacy.value === 'All Privacy' ||
                          item.privacy === filterPrivacy.value

    return searchMatch && planMatch && privacyMatch
  })
})

const filteredUsers = computed(() => {
  return allUsers.value.filter(item => {
    return item.name.toLowerCase().includes(filterSearch.value.toLowerCase()) ||
           item.email.toLowerCase().includes(filterSearch.value.toLowerCase())
  })
})

</script>

<template>
  <SharedLayout
    v-model:tab="currentTab"
    :active-tab="currentTab"
    @update:tab="handleTabChange"
    @update:search="(val) => filterSearch = val"
    @update:plan="(val) => filterPlan = val"
    @update:privacy="(val) => filterPrivacy = val"
  >
    <template #title>
      <template v-if="selectedUserId !== null && selectedUser">
        <div class="mb-4">
          <div class="flex items-center gap-3 mb-6">
            <span
              class="text-[24px] font-bold text-[#4e5d78] cursor-pointer hover:text-[#3a465a] transition-colors hover:underline"
              @click="openUserTab"
            >
              User
            </span>

            <span class="text-[24px] font-bold text-[#4e5d78]/50">></span>

            <h2 class="text-[24px] font-bold text-[#4e5d78]">
              Details
            </h2>
          </div>
          <div class="text-[#8a94a6] font-sans">
            <p class="text-sm mb-1">
              {{ selectedUser.name }}
            </p>
            <p class="text-sm">
              {{ selectedUser.email }}
            </p>
          </div>
        </div>
      </template>
      <template v-else-if="currentTab === 'projects'">
        <h2 class="text-xl font-bold text-[#1e293b]">
          All Projects
        </h2>
      </template>
      <template v-else>
        <h2 class="text-xl font-bold text-[#1e293b]">
          All Users
        </h2>
      </template>
    </template>

    <template #thead>
      <template v-if="currentTab === 'projects' || selectedUserId !== null">
        <th class="pb-4 px-2">
          Id
        </th>
        <th class="pb-4 px-2">
          Project name
        </th>
        <th class="pb-4 px-2">
          Owner
        </th>
        <th class="pb-4 px-2 text-center">
          Member
        </th>
        <th class="pb-4 px-2 text-center">
          Minutes
        </th>
        <th class="pb-4 px-2 text-center">
          Jobs run
        </th>
        <th class="pb-4 px-2">
          Privacy
        </th>
        <th class="pb-4 px-2">
          Plan
        </th>
        <th class="pb-4 px-2">
          Paid-Plan
        </th>
        <th class="pb-4 px-2 text-right">
          Action
        </th>
      </template>

      <template v-else>
        <th class="pb-4 px-2">
          Id
        </th>
        <th class="pb-4 px-2">
          Name
        </th>
        <th class="pb-4 px-2">
          Email
        </th>
        <th class="pb-4 px-2 text-center">
          Project Owned
        </th>
        <th class="pb-4 px-2">
          Role
        </th>
        <th class="pb-4 px-2">
          Plan
        </th>
        <th class="pb-4 px-2">
          Paid-Plan
        </th>
        <th class="pb-4 px-2 text-right">
          Action
        </th>
      </template>
    </template>

    <template #tbody>
      <template v-if="currentTab === 'projects' || selectedUserId !== null">
        <template v-if="(selectedUserId !== null ? userProjects : filteredProjects).length > 0">
          <tr
            v-for="item in (selectedUserId !== null ? userProjects : filteredProjects)"
            :key="item.id"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <td class="py-4 px-2 text-gray-400">
              {{ String(item.id).padStart(3, '0') }}
            </td>
            <td class="py-4 px-2 font-medium text-[#1e293b]">
              {{ item.name }}
            </td>
            <td class="py-4 px-2 text-sm text-[#4e5d78]">
              {{ item.ownerName }}
            </td>
            <td class="py-4 px-2 text-sm text-center">
              {{ item.memberCount }}
            </td>
            <td class="py-4 px-2 text-sm text-center font-mono">
              {{ item.minutes?.toLocaleString() }}
            </td>
            <td class="py-4 px-2 text-sm text-center">
              {{ item.jobsRun }}
            </td>
            <td class="py-4 px-2 text-sm">
              {{ item.privacy }}
            </td>
            <td class="py-4 px-2">
              <span :class="[item.plan === 'Pro' ? 'bg-[#c1ff72] text-black' : 'bg-gray-200 text-gray-600', 'px-3 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                {{ item.plan }}
              </span>
            </td>
            <td class="py-4 px-2">
              <span :class="[item.paidPlan === 'Pro' ? 'bg-[#c1ff72] text-black' : 'bg-gray-200 text-gray-600', 'px-3 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                {{ item.paidPlan }}
              </span>
            </td>
            <td class="py-4 px-2 text-right relative">
              <button
                class="font-bold text-gray-400 px-2 text-xl"
                @click="toggleDropdown(item.id)"
              >
                ⋮
              </button>
              <div
                v-if="activeDropdown === item.id"
                class="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-2 text-left"
              >
                <button class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  Change Plans
                </button>
                <button class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  Sync project
                </button>
              </div>
            </td>
          </tr>
        </template>

        <tr v-else>
          <td
            colspan="9"
            class="py-20 text-center"
          >
            <div class="flex flex-col items-center justify-center text-gray-400">
              <p class="text-lg">
                No projects found
              </p>
              <p class="text-sm">
                Try adjusting your filters or search term.
              </p>
            </div>
          </td>
        </tr>
      </template>

      <template v-else>
        <template v-if="filteredUsers.length > 0">
          <tr
            v-for="item in filteredUsers"
            :key="item.id"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <td class="py-4 px-2 text-gray-400">
              {{ String(item.id).padStart(3, '0') }}
            </td>
            <td class="py-4 px-2 font-medium text-[#1e293b]">
              {{ item.name }}
            </td>
            <td class="py-4 px-2 text-sm text-[#4e5d78]">
              {{ item.email }}
            </td>
            <td class="py-4 px-2 text-sm text-center">
              {{ item.projectsOwned }}
            </td>
            <td class="py-4 px-2 text-sm">
              {{ item.role }}
            </td>
            <td class="py-4 px-2">
              <span :class="[item.plan === 'Pro' ? 'bg-[#c1ff72] text-black' : 'bg-gray-200 text-gray-600', 'px-3 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                {{ item.plan }}
              </span>
            </td>
            <td class="py-4 px-2">
              <span :class="[item.paidPlan === 'Pro' ? 'bg-[#c1ff72] text-black' : 'bg-gray-200 text-gray-600', 'px-3 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                {{ item.paidPlan }}
              </span>
            </td>
            <td class="py-4 px-2 text-right">
              <button
                class="text-sm font-medium text-[#4e5d78] hover:underline cursor-pointer"
                @click="handleSeeDetails(item.id)"
              >
                See details
              </button>
            </td>
          </tr>
        </template>

        <tr v-else>
          <td
            colspan="7"
            class="py-20 text-center"
          >
            <div class="flex flex-col items-center justify-center text-gray-400">
              <p class="text-lg">
                No users found
              </p>
              <p class="text-sm">
                Try searching for a different name or email.
              </p>
            </div>
          </td>
        </tr>
      </template>
    </template>
  </SharedLayout>
</template>
