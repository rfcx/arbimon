<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl pt-4 md:pt-10">
      <h1 class="mb-6">
        Manage Project and User Tiers
      </h1>
      <div class="mb-5 flex gap-2 border-b border-util-gray-03">
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
      <input
        id="searchInput"
        v-model="searchKeyword"
        name="search"
        type="text"
        class="search-input text-insight shadow-lg shadow-frequency/10"
        :placeholder="activeTab === 'projects' ? 'Search for projects' : 'Search for users'"
        autocomplete="off"
      >
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
          :projects="projects ?? []"
          @select-project="onSelectProject"
        />
        <UserTieringTable
          v-else
          :users="users ?? []"
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

const searchParams = useDebounce(searchKeyword, 500)

const { isError: isProjectError, isLoading: isProjectLoading, error: projectError, data: projects } = useGetSuperProjects(apiClientBio, { keyword: searchParams, limit, offset })
const { isError: isUserError, isLoading: isUserLoading, error: userError, data: users } = useGetSuperUsers(apiClientBio, { keyword: searchParams, limit, offset })

const isActiveTabError = computed(() => activeTab.value === 'projects' ? isProjectError.value : isUserError.value)
const isActiveTabLoading = computed(() => activeTab.value === 'projects' ? isProjectLoading.value : isUserLoading.value)
const activeTabError = computed(() => activeTab.value === 'projects' ? projectError.value : userError.value)

watch(activeTabError, (newError) => {
  if (newError?.response?.status === 401) {
    router.push({ name: ROUTE_NAMES.error })
  }
})

const onSelectProject = (project: SuperProjectSummary): void => {
  superStore.setSelectedProject(project)
}
</script>
