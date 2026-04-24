<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl pt-4 md:pt-10">
      <h1 class="mb-6">
        Manage Project and User Tiers
      </h1>
      <div class="mb-3 flex gap-2 border-b border-util-gray-03">
        <button
          type="button"
          class="px-4 py-3 text-sm font-medium"
          :class="activeTab === 'projects' ? 'text-frequency border-b-2 border-frequency' : 'text-subtle'"
          @click="activeTab = 'projects'"
        >
          Projects
        </button>
        <button
          type="button"
          class="px-4 py-3 text-sm font-medium"
          :class="activeTab === 'users' ? 'text-frequency border-b-2 border-frequency' : 'text-subtle'"
          @click="activeTab = 'users'"
        >
          Users
        </button>
      </div>
      <div class="flex w-full gap-4 items-center mb-3">
        <div class="flex-[7]">
          <input
            id="searchInput"
            v-model="searchKeyword"
            name="search"
            type="text"
            class="search-input w-full text-insight shadow-lg shadow-frequency/10"
            :placeholder="activeTab === 'projects' ? 'Search for projects' : 'Search for users'"
            autocomplete="off"
          >
        </div>

        <div class="flex-[3] relative">
          <select
            v-if="activeTab === 'users'"
            key="select-projects"
            v-model="selectedTier"
            class="search-input w-full text-gray-700 py-2.5 px-4 pr-10 shadow-lg shadow-frequency/10 appearance-none cursor-pointer text-sm focus:outline-none transition-all font-medium bg-white"
          >
            <option value="all">
              All Tier
            </option>
            <option value="free">
              Free
            </option>
            <option value="pro">
              Pro
            </option>
            <option value="enterprise">
              Enterprise
            </option>
          </select>

          <select
            v-else
            key="select-users"
            v-model="selectedTier"
            class="search-input w-full text-gray-700 py-2.5 px-4 pr-10 shadow-lg shadow-frequency/10 appearance-none cursor-pointer text-sm focus:outline-none transition-all font-medium bg-white"
          >
            <option value="all">
              All Tier
            </option>
            <option value="free">
              Free
            </option>
            <option value="pro">
              Premium
            </option>
            <option value="enterprise">
              Unlimited
            </option>
          </select>

          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <svg
              class="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
      <div
        v-if="isActiveTabError"
        class="mt-6 text-insight"
      >
        <span v-if="[401, 403].includes(activeTabError?.response?.status ?? 401)">
          You do not have permission to view this page
        </span>
        <span v-else>
          Unable to load {{ activeTab }}.
        </span>
      </div>
      <div
        v-else-if="isActiveTabLoading"
        class="flex items-center justify-center h-96"
      >
        <icon-custom-ic-loading class="h-10 w-10" />
      </div>
      <div v-else>
        <ProjectTieringTable
          v-if="activeTab === 'projects'"
          :projects="filteredProjects ?? []"
          @select-project="onSelectProject"
        />
        <UserTieringTable
          v-else
          :users="filteredUsers ?? []"
          @select-project="onSelectProject"
        />
        <div class="mt-3 text-sm text-subtle">
          Can't find the {{ activeTab === 'projects' ? 'project' : 'user' }} you want? Try searching by name or keyword.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounce } from '@vueuse/core'
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { type SuperProjectSummary } from '@rfcx-bio/common/api-bio/super/projects'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useSuperStore } from '~/store'
import { useGetSuperProjects, useGetSuperUsers } from './_composables/use-projects'
import ProjectTieringTable from './components/project-tiering-table.vue'
import UserTieringTable from './components/user-tiering-table.vue'

const apiClientBio = inject(apiClientKey) as AxiosInstance
const router = useRouter()
const superStore = useSuperStore()

const activeTab = ref<'projects' | 'users'>('projects')
const searchKeyword = ref('')
const limit = ref(200)
const offset = ref(0)

const selectedTier = ref('all')

const searchParams = useDebounce(searchKeyword, 500)

const { isError: isProjectError, isLoading: isProjectLoading, error: projectError, data: projects } = useGetSuperProjects(apiClientBio, { keyword: searchParams, limit, offset })
const { isError: isUserError, isLoading: isUserLoading, error: userError, data: users } = useGetSuperUsers(apiClientBio, { keyword: searchParams, limit, offset })

const isActiveTabError = computed(() => activeTab.value === 'projects' ? isProjectError.value : isUserError.value)
const isActiveTabLoading = computed(() => activeTab.value === 'projects' ? isProjectLoading.value : isUserLoading.value)
const activeTabError = computed(() => activeTab.value === 'projects' ? projectError.value : userError.value)

const filteredProjects = computed(() => {
  if (!projects.value) return []
  if (selectedTier.value === 'all') return projects.value
  return projects.value.filter((project) => project.projectType === selectedTier.value)
})

const filteredUsers = computed(() => {
  if (!users.value) return []
  if (selectedTier.value === 'all') return users.value
  return users.value.filter((user) => user.accountTier === selectedTier.value)
})

watch(activeTabError, (newError) => {
  if (newError?.response?.status === 401) {
    router.push({ name: ROUTE_NAMES.error })
  }
})

watch(activeTab, (newTab) => {
  searchKeyword.value = ''
  selectedTier.value = 'all'
})

const onSelectProject = (project: SuperProjectSummary): void => {
  superStore.setSelectedProject(project)
}
</script>
