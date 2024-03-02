<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl">
      <div class="mt-20 flex flex-row gap-x-2 text-xs font-medium items-center">
        <router-link :to="{ name: ROUTE_NAMES.adminProject }">
          Projects
        </router-link>
        <icon-fa-chevron-right class="self-center text-xxs" />
        <router-link
          :to="{ name: ROUTE_NAMES.adminMember, params: { projectId: project.id } }"
          class="font-bold"
        >
          {{ project.slug ?? project.id }}
        </router-link>
      </div>
      <h2 class="mt-2 mb-10">
        Manage project members
      </h2>
      <table class="w-full text-left rtl:text-right table-auto">
        <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
          <tr>
            <th class="px-2 py-3">
              Name
            </th>
            <th>
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
              class="py-3"
            >
              <input
                type="email"
                class="border-0 w-full rounded-md px-2 py-1 input-field"
                placeholder="+ Add new member by email"
              >
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr
            v-for="member in members"
            :key="member.userId"
            class="border-y-1 border-util-gray-03"
          >
            <td class="px-2 py-3">
              {{ member.firstName }} {{ member.lastName }}
            </td>
            <td class="px-2 py-3">
              {{ member.email }}
            </td>
            <td class="px-2 py-3">
              {{ getRoleById(member.roleId) }}
            </td>
            <td class="px-2 py-3">
              <button class="text-sm text-insight bg-ibis rounded-md px-2 py-1">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'

import { getRoleById } from '@rfcx-bio/common/roles'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useGetSuperProjectMembers } from './composables/use-members'

const route = useRoute()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const project = computed(() => {
  return { id: Number(route.params.projectId), slug: route.params.projectSlug }
})

const { data: members } = useGetSuperProjectMembers(apiClientBio, project.value.id)

</script>
