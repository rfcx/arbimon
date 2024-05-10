<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl pt-4 md:pt-10">
      <div class="flex flex-row gap-x-2 text-xs font-medium items-center">
        <router-link :to="{ name: ROUTE_NAMES.adminProject }">
          Projects
        </router-link>
        <icon-fa-chevron-right class="self-center text-xxs" />
        <router-link
          :to="{ name: ROUTE_NAMES.adminMember, params: { projectId: project.id } }"
          class="font-bold"
        >
          {{ project.name ?? project.id }}
        </router-link>
      </div>

      <div class="flex items-center justify-between mb-10">
        <h2 class="mt-2 ">
          Syncing History
        </h2>
        <button
          class="bg-transparent border-1 border-frequency rounded-full text-frequency h-10 w-32 px-2 py-2"
          @click="handleSyncNow"
        >
          Sync now
        </button>
      </div>

      <table class="w-full text-left rtl:text-right table-auto md:table-fixed">
        <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
          <tr>
            <th class="<sm:hidden">
              Timestamp
            </th>
            <th class="px-2 py-3">
              Sync From
            </th>
            <th>
              Data type
            </th>
            <th>
              Number of changes (delta)
            </th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td
              colspan="4"
              class="py-3"
            >
              <div
                v-if="errorMessage"
                class="text-ibis dark:text-flamingo text-sm px-2"
              >
                {{ errorMessage }}
              </div>
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr
            v-for="sync in syncHistoryData?.syncs"
            :key="sync.id"
            class="border-y-1 border-util-gray-03"
          >
            <td class="py-3">
              {{ sync.createdAt }}
            </td>
            <td>
              {{ sync.sourceType }}
            </td>
            <td>
              {{ sync.dataType }}
            </td>
            <td>
              {{ sync.delta }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useSuperStore } from '~/store'
import { type Error } from '../../error'
import { useFetchProjectSyncHistory, useStartProjectSync } from './_composables/use-sync.ts'

const route = useRoute()
const store = useSuperStore()
const router = useRouter()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const errorMessage = ref('')

const project = computed(() => {
  return store.project ?? { id: Number(route.params.projectId), name: route.params.projectSlug }
})

const { data: syncHistoryData, refetch: refetchSyncHistory, error } = useFetchProjectSyncHistory(apiClientBio, project.value.id)
const { mutate: mutateSync } = useStartProjectSync(apiClientBio, project.value.id)

watch(error, (newError) => {
  if (newError?.response?.status === 401) {
    router.push({ name: ROUTE_NAMES.error })
  }
})

const handleSyncNow = async () => {
    mutateSync({}, {
      onSuccess: async () => {
        await refetchSyncHistory()
      },
      onError: (error: Error) => {
        errorMessage.value = `Failed ( code: ${error.response?.status} ${error.response?.statusText} )`
      }
    })
  }
</script>
