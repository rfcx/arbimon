<template>
  <tr class="border-y-1 border-util-gray-03 align-top text-black">
    <td class="<sm:hidden text-sm text-subtle">
      {{ project.id }}
    </td>
    <td class="py-3 pr-3 max-w-[200px]">
      <div
        class="font-medium text-insight flex items-center gap-1.5 min-w-0 mr-3"
        :title="project.name"
      >
        <span class="truncate">
          {{ project.name }}
        </span>

        <div
          v-if="project.isOwner"
          class="relative group flex-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            class="text-amber-500 w-4 h-4"
          >
            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
          </svg>

          <div
            class="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200
             px-2 py-1 text-[10px] font-medium text-black bg-white rounded shadow-sm
             bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            Owned
          </div>
        </div>
      </div>

      <div
        class="text-sm text-subtle truncate mr-3"
        :title="project.slug"
      >
        {{ project.slug }}
      </div>
    </td>
    <td class="py-3">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <div class="relative group inline-block">
            <select
              class="w-25 rounded border border-util-gray-03 bg-white px-2 py-1 text-xs capitalize cursor-pointer disabled:(bg-util-gray-01 cursor-not-allowed)"
              :value="selectedProjectType"
              :disabled="isSavingTier || project.isLocked"
              @change="onProjectTypeChange"
            >
              <option value="free">
                free
              </option>
              <option value="premium">
                premium
              </option>
              <option value="unlimited">
                unlimited
              </option>
            </select>

            <div
              v-if="project.isLocked"
              class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
            >
              Disable View-only before changing tiers
            </div>
          </div>
          <button
            type="button"
            class="rounded bg-frequency px-2 py-1 text-xs font-medium cursor-pointer disabled:(cursor-not-allowed opacity-50)"
            :disabled="isSavingTier || project.isLocked || selectedProjectType === (project.projectType ?? 'free')"
            @click="emit('save-tier', project)"
          >
            {{ isSavingTier ? 'Saving' : 'Save' }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="project.isLocked"
            :class="stateBadgeClass(project)"
          >
            view-only
          </span>
          <span
            v-else
            :class="tierBadgeClass(project.projectType)"
          >
            {{ project.projectType ?? 'free' }}
          </span>
        </div>
      </div>
    </td>
    <td class="py-3 text-sm text-insight">
      <div class="flex items-center gap-1">
        <div class="relative group">
          <span
            :class="isOverLimit(usage?.recordingMinutesCount, limits?.recordingMinutesCount) ? 'text-red-500' : 'text-insight'"
            class="font-medium"
          >
            {{ formatNumber(usage?.recordingMinutesCount ?? 0) }}
          </span>

          <div
            class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
          >
            Total mins of recordings in project
          </div>
        </div>

        <span class="text-insight">/</span>
        <div class="relative group">
          <span>
            {{ getLimitText(limits?.recordingMinutesCount) }}
          </span>

          <div
            class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
          >
            Limit of mins of recordings
          </div>
        </div>
      </div>
    </td>
    <td class="py-3 text-sm text-insight">
      <div class="flex items-center gap-1">
        <div class="relative group">
          <span
            :class="isOverLimit(usage?.jobCount, limits?.jobCount) ? 'text-red-500' : 'text-insight'"
          >
            {{ formatUsage(usage?.jobCount) }}
          </span>

          <div
            class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
          >
            Total PM jobs in project
          </div>
        </div>

        <span>/</span>

        <div class="relative group">
          <span>
            {{ getLimitText(limits?.jobCount) }}
          </span>

          <div
            class="absolute z-50 bg-white invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-200 text-black text-[10px] px-2 py-1
                  rounded shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 w-max"
          >
            Total PM jobs limit
          </div>
        </div>
      </div>
    </td>
    <td class="py-3 pr-4 text-sm text-insight">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <span class="font-medium">Collabs</span>
          <span
            :class="isOverLimit(usage?.collaboratorCount, limits?.collaboratorCount) ? 'text-red-500' : 'text-insight'"
          >
            {{ usage?.collaboratorCount ?? 0 }}
          </span>
          <span>/</span>
          <span>{{ getLimitText(limits?.collaboratorCount) }}</span>
        </div>

        <div class="flex items-center gap-1">
          <span class="font-medium">Guests</span>
          <span
            :class="isOverLimit(usage?.guestCount, limits?.guestCount) ? 'text-red-500' : 'text-insight'"
          >
            {{ usage?.guestCount ?? 0 }}
          </span>
          <span>/</span>
          <span>{{ getLimitText(limits?.guestCount) }}</span>
        </div>
      </div>
    </td>
    <td
      v-if="showActions"
      class="py-3"
    >
      <div class="flex flex-col gap-2 text-sm">
        <button
          type="button"
          class="text-left text-frequency"
          @click="emit('toggle-lock', project)"
        >
          {{ project.isLocked ? 'Disable view-only' : 'Enable view-only' }}
        </button>
        <button
          type="button"
          class="text-left text-frequency"
          @click="emit('toggle-members', project)"
        >
          {{ isExpanded ? 'Hide members' : 'Show members' }}
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

import { type SuperProjectSummary, type SuperUserProjectSummary } from '@rfcx-bio/common/api-bio/super/projects'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useProjectTieringUsage } from '../_composables/use-project-tiering-usage'

const props = withDefaults(defineProps<{
  project: SuperUserProjectSummary
  showActions?: boolean
  selectedProjectType: string
  isSavingTier?: boolean
  isExpanded?: boolean
}>(), {
  showActions: true,
  isSavingTier: false,
  isExpanded: false
})

const emit = defineEmits(['select-project', 'toggle-members', 'save-tier', 'toggle-lock', 'update:selectedProjectType'])

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const slug = computed(() => props.project.slug)
const { data: usageResponse } = useProjectTieringUsage(apiClientArbimon, slug)
const limits = computed(() => props.project.limits)
const usage = computed(() => usageResponse.value)

const tierBadgeClass = (projectType: SuperUserProjectSummary['projectType'] | undefined): string => {
  const base = 'inline-flex items-center justify-center w-fit rounded-full px-2 py-1 text-xs font-bold capitalize tracking-wide leading-none'

  if (projectType === 'premium') {
    return `${base} bg-amber-100 text-amber-700`
  }
  if (projectType === 'unlimited') {
    return `${base} bg-rose-100 text-rose-700`
  }
  return `${base} bg-emerald-100 text-emerald-700`
}

const stateBadgeClass = (project: SuperProjectSummary): string => {
  return 'inline-flex items-center justify-center w-fit rounded-full px-2 py-1 text-xs capitalize tracking-wide leading-none bg-stone-200 font-semibold'
}

const formatNumber = (num: number) => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  })
}

const formatUsage = (val: number | undefined | null): string => {
  if (val === null || val === undefined) return '0'
  return val.toLocaleString()
}

const getLimitText = (limit: number | null | undefined): string => {
  if (limit === null || limit === undefined) return 'No cap'
  return limit.toLocaleString()
}
const isOverLimit = (used: number | undefined, limit: number | null | undefined) => {
  if (limit === null || limit === undefined) return false

  return (used ?? 0) > limit
}
const onProjectTypeChange = (event: Event): void => {
  emit('update:selectedProjectType', (event.target as HTMLSelectElement).value)
}
</script>
