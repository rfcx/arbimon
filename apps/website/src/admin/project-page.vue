<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl">
      <h1 class="mt-20 mb-6">
        Projects
      </h1>
      <div
        v-if="isError"
        class="text-insight"
      >
        <span v-if="[401, 403].includes(error?.response?.status ?? 401)">
          You do not have permission to view this page
        </span>
      </div>
      <div
        v-else-if="isLoading"
        class="flex items-center justify-center h-96"
      >
        <icon-custom-ic-loading class="h-10 w-10" />
      </div>
      <div v-else>
        <input
          id="searchInput"
          v-model="searchKeyword"
          name="search"
          type="text"
          class="input-field text-insight shadow-lg shadow-frequency/10"
          placeholder="Search for projects"
          autocomplete="off"
        >
        <table class="w-full text-left rtl:text-right table-auto mt-6">
          <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
            <tr>
              <th class="py-3">
                Name
              </th>
              <th>
                Url
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tfoot>
            <tr colspan="3">
              <td class="py-3 text-sm text-subtle">
                Can't find the project you want? Try searching for it by name or keyword.
              </td>
            </tr>
          </tfoot>
          <tbody>
            <tr
              v-for="project in projects"
              :key="project.id"
              class="border-y-1 border-util-gray-03"
            >
              <td class="py-3">
                {{ project.name }}
              </td>
              <td>
                {{ project.slug }}
              </td>
              <td>
                <router-link
                  :to=" { name: ROUTE_NAMES.adminMember, params: { projectId: project.id } }"
                  class="text-frequency text-sm"
                >
                  Manage members
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounce } from '@vueuse/core'
import { type AxiosInstance } from 'axios'
import { inject, onBeforeUnmount, ref } from 'vue'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useGetSuperProjects } from './composables/use-projects'

const apiClientBio = inject(apiClientKey) as AxiosInstance

const searchKeyword = ref('')
const limit = ref(200)
const offset = ref(0)

const searchParams = useDebounce(searchKeyword, 500)

onBeforeUnmount(() => {
  offset.value = 0
  projects.value = []
})

const { isError, isLoading, error, data: projects } = useGetSuperProjects(apiClientBio, { keyword: searchParams, limit, offset })

</script>
