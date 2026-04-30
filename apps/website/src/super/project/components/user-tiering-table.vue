<template>
  <div>
    <table class="w-full text-left rtl:text-right table-auto text-black">
      <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
        <tr>
          <th class="py-3 min-w-16">
            Id
          </th>
          <th class="min-w-64">
            User
          </th>
          <th class="min-w-24">
            Tier
          </th>
          <th class="min-w-28">
            Premium Add-ons
          </th>
          <th class="min-w-28">
            All Projects
          </th>
          <th class="min-w-24">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="user in users"
          :key="user.id"
        >
          <tr class="border-y-1 border-util-gray-03 align-top">
            <td class="py-3 text-sm text-subtle">
              {{ user.id }}
            </td>
            <td class="py-3">
              <div class="font-medium text-insight">
                {{ user.firstName }} {{ user.lastName }}
              </div>
              <div class="text-sm text-subtle">
                {{ user.email }}
              </div>
            </td>
            <td class="py-3">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <select
                    class="w-25 rounded border border-util-gray-03 bg-white px-2 py-1 text-xs capitalize"
                    :value="userTierDrafts[user.id] ?? user.accountTier"
                    @change="onUserTierChange(user.id, $event)"
                  >
                    <option value="free">
                      free
                    </option>
                    <option value="pro">
                      pro
                    </option>
                    <option value="enterprise">
                      enterprise
                    </option>
                  </select>
                  <button
                    type="button"
                    class="rounded bg-frequency px-2 py-1 text-xs font-medium disabled:(cursor-not-allowed opacity-50)"
                    :disabled="savingUserId === user.id || !hasUserChanges(user)"
                    @click="saveUserTier(user)"
                  >
                    {{ savingUserId === user.id && hasUserChanges(user) ? 'Saving' : 'Save' }}
                  </button>
                </div>
                <span :class="tierBadgeClass(user.accountTier)">
                  {{ user.accountTier }}
                </span>
              </div>
            </td>
            <td class="py-3 text-sm text-insight">
              <input
                type="number"
                min="0"
                class="w-22 rounded border border-util-gray-03 bg-white px-2 py-1 text-xs text-black"
                :value="userAdditionalPremiumSlotDrafts[user.id] ?? user.additionalPremiumProjectSlots"
                @input="onAdditionalPremiumSlotsChange(user.id, $event)"
              >
              <button
                type="button"
                class="rounded bg-frequency px-2 py-1 text-xs font-medium disabled:(cursor-not-allowed opacity-50) text-black ml-2"
                :disabled="savingUserId === user.id || !hasAdditionalSlotsChanges(user)"
                @click="saveAdditional(user)"
              >
                {{ savingUserId === user.id && hasAdditionalSlotsChanges(user) ? 'Saving' : 'Save' }}
              </button>
            </td>
            <td class="py-3 text-sm text-insight">
              <div class="flex justify-between md:justify-start md:gap-2 mb-1">
                <span class="font-medium">View-only</span>
                <span
                  class="font-medium text-insight"
                >
                  {{ user.viewOnlyProjectCount.toLocaleString() }}
                </span>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex justify-between md:justify-start md:gap-2">
                  <span class="font-medium">Free</span>
                  <div class="flex gap-1">
                    <div class="relative group">
                      <span
                        :class="isOverLimit(user.usage.freeProjects, user.limits.freeProjects) ? 'text-red-500' : 'text-insight'"
                        class="font-medium"
                      >
                        {{ user.usage.freeProjects.toLocaleString() }}
                      </span>

                      <div
                        class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
                      >
                        Projects owned
                      </div>
                    </div>
                    <span>/</span>
                    <div class="relative group">
                      <span>
                        {{ getLimitText(user.limits.freeProjects) }}
                      </span>

                      <div
                        class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
                      >
                        Limit projects
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between md:justify-start md:gap-2">
                  <span class="font-medium">Premium</span>
                  <div class="flex gap-1">
                    <div class="relative group">
                      <span
                        :class="isOverLimit(user.usage.premiumProjects, user.limits.premiumProjects) ? 'text-red-500' : 'text-insight'"
                        class="font-medium"
                      >
                        {{ user.usage.premiumProjects.toLocaleString() }}
                      </span>

                      <div
                        class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
                      >
                        Projects owned
                      </div>
                    </div>
                    <span>/</span>
                    <div class="relative group">
                      <span>
                        {{ getLimitText(user.limits.premiumProjects) }}
                      </span>

                      <div
                        class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
                      >
                        Limit projects
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between md:justify-start md:gap-2">
                  <span class="font-medium">Unlimited</span>
                  <div class="flex gap-1">
                    <div class="relative group">
                      <span
                        :class="isOverLimit(user.usage.unlimitedProjects, user.limits.unlimitedProjects) ? 'text-red-500' : 'text-insight'"
                        class="font-medium"
                      >
                        {{ user.usage.unlimitedProjects.toLocaleString() }}
                      </span>

                      <div
                        class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
                      >
                        Projects owned
                      </div>
                    </div>
                    <span>/</span>
                    <div class="relative group">
                      <span>
                        {{ getLimitText(user.limits.unlimitedProjects) }}
                      </span>

                      <div
                        class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
                      >
                        Limit projects
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="py-3">
              <button
                type="button"
                class="text-frequency text-sm"
                @click="toggleExpandedUser(user.id)"
              >
                {{ expandedUserId === user.id ? 'Hide projects' : 'Show projects' }}
              </button>
            </td>
          </tr>
          <tr
            v-if="expandedUserId === user.id"
            class="border-b-1 border-util-gray-03"
          >
            <td
              colspan="9"
              class="bg-echo px-4 py-4"
            >
              <div
                v-if="isLoadingUserProjects"
                class="text-subtle text-sm"
              >
                Loading owned projects...
              </div>
              <div
                v-else-if="isErrorUserProjects"
                class="text-danger text-sm"
              >
                Unable to load owned projects for this user.
              </div>
              <div
                v-else-if="(userProjects?.length ?? 0) === 0"
                class="text-subtle text-sm"
              >
                This user has no owned projects.
              </div>
              <ProjectTieringTable
                v-else
                :projects="userProjects ?? []"
                :show-actions="true"
                @select-project="project => emit('select-project', project)"
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type SuperUserSummary } from '@rfcx-bio/common/api-bio/super/projects'

import { apiClientKey } from '@/globals'
import { useGetSuperUserProjects, useUpdateSuperUserTier } from '../_composables/use-projects'
import ProjectTieringTable from './project-tiering-table.vue'

defineProps<{
  users: SuperUserSummary[]
}>()

const emit = defineEmits(['select-project'])

const apiClientBio = inject(apiClientKey) as AxiosInstance
const queryClient = useQueryClient()
const expandedUserId = ref<number | null>(null)
const selectedUserId = computed(() => expandedUserId.value)
const userTierDrafts = ref<Record<number, SuperUserSummary['accountTier']>>({})
const userAdditionalPremiumSlotDrafts = ref<Record<number, number>>({})
const savingUserId = ref<number | null>(null)

const { data: userProjects, isLoading: isLoadingUserProjects, isError: isErrorUserProjects } = useGetSuperUserProjects(apiClientBio, selectedUserId)
const { mutateAsync: mutateUserTier } = useUpdateSuperUserTier(apiClientBio)

const toggleExpandedUser = (userId: number): void => {
  expandedUserId.value = expandedUserId.value === userId ? null : userId
}

const updateUserTierDraft = (userId: number, tier: string): void => {
  userTierDrafts.value = {
    ...userTierDrafts.value,
    [userId]: tier as SuperUserSummary['accountTier']
  }
}

const onUserTierChange = (userId: number, event: Event): void => {
  updateUserTierDraft(userId, (event.target as HTMLSelectElement).value)
}

const onAdditionalPremiumSlotsChange = (userId: number, event: Event): void => {
  userAdditionalPremiumSlotDrafts.value = {
    ...userAdditionalPremiumSlotDrafts.value,
    [userId]: Math.max(0, Number((event.target as HTMLInputElement).value || 0))
  }
}

const hasUserChanges = (user: SuperUserSummary): boolean => {
  const nextTier = userTierDrafts.value[user.id] ?? user.accountTier
  return nextTier !== user.accountTier
}

const hasAdditionalSlotsChanges = (user: SuperUserSummary): boolean => {
  const nextAdditionalSlots = userAdditionalPremiumSlotDrafts.value[user.id] ?? user.additionalPremiumProjectSlots
  return nextAdditionalSlots !== user.additionalPremiumProjectSlots
}

const saveUserTier = async (user: SuperUserSummary): Promise<void> => {
  const nextTier = userTierDrafts.value[user.id] ?? user.accountTier
  if (!hasUserChanges(user)) return

  savingUserId.value = user.id
  try {
    await mutateUserTier({
      userId: user.id,
      payload: { accountTier: nextTier, additionalPremiumProjectSlots: user.additionalPremiumProjectSlots }
    })
    await queryClient.invalidateQueries({ queryKey: ['get-super-users'] })
    await queryClient.invalidateQueries({ queryKey: ['get-super-user-projects'] })
  } finally {
    savingUserId.value = null
  }
}

const saveAdditional = async (user: SuperUserSummary): Promise<void> => {
  const nextAdditionalPremiumProjectSlots = userAdditionalPremiumSlotDrafts.value[user.id] ?? user.additionalPremiumProjectSlots
  if (!hasAdditionalSlotsChanges(user)) return

  savingUserId.value = user.id
  try {
    await mutateUserTier({
      userId: user.id,
      payload: { accountTier: user.accountTier, additionalPremiumProjectSlots: nextAdditionalPremiumProjectSlots }
    })
    await queryClient.invalidateQueries({ queryKey: ['get-super-users'] })
    await queryClient.invalidateQueries({ queryKey: ['get-super-user-projects'] })
  } finally {
    savingUserId.value = null
  }
}

const tierBadgeClass = (accountTier: SuperUserSummary['accountTier']): string => {
  const base = 'inline-flex items-center w-fit rounded-full px-2 py-1 text-xs font-bold capitalize tracking-wide leading-none'

  if (accountTier === 'enterprise') {
    return `${base} bg-rose-100 text-rose-700`
  }
  if (accountTier === 'pro') {
    return `${base} bg-amber-100 text-amber-700`
  }
  return `${base} bg-emerald-100 text-emerald-700`
}

const getLimitText = (limit: number | null | undefined): string => {
  if (limit === null || limit === undefined) return 'No cap'
  return limit.toLocaleString()
}

const isOverLimit = (used: number | undefined, limit: number | null | undefined): boolean => {
  if (limit === null || limit === undefined) return false
  return (used ?? 0) > limit
}
</script>
