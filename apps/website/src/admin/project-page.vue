<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl">
      <h1 class="mt-20 mb-6">
        Projects
      </h1>
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
              {{ project.url }}
            </td>
            <td>
              <router-link
                :to="`/admin/${project.url}/members`"
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
</template>

<script setup lang="ts">

import { ref } from 'vue'

interface Project {
  id: number
  name: string
  url: string
}
const projects: Project[] = [
  { id: 1, name: 'Arbimon 2024', url: 'arbimon-2024' }
]

const searchKeyword = ref('')

</script>
