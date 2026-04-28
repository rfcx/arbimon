<template>
  <tr class="border-y-1 border-util-gray-03 align-top text-black">
    <td class="<sm:hidden text-sm text-subtle">
      {{ project.id }}
    </td>
    <td class="py-3">
      <div class="font-medium text-insight">
        {{ project.name }}
      </div>
      <div class="text-sm text-subtle">
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
              class="absolute w-max z-10 inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm tooltip invisible group-hover:visible opacity-0 group-hover:opacity-100 top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none"
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
          <span :class="tierBadgeClass(project.projectType)">
            {{ project.projectType ?? 'free' }}
          </span>
          <span
            v-if="project.isLocked"
            :class="stateBadgeClass(project)"
          >
            view-only
          </span>
        </div>
      </div>
    </td>
    <td class="py-3 text-sm text-insight">
      {{ formatUsage(usage?.recordingMinutesCount, limits.recordingMinutesCount) }}
    </td>
    <td class="py-3 text-sm text-insight">
      {{ formatUsage(usage?.jobCount, limits.jobCount) }}
    </td>
    <td class="py-3 pr-4 text-sm text-insight">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-1">
          <span class="font-medium min-w-[60px]">Collabs</span>
          <span>
            {{ formatUsage(usage?.collaboratorCount, limits.collaboratorCount) }}
          </span>
        </div>

        <div class="flex items-center gap-1">
          <span class="font-medium min-w-[60px]">Guest</span>
          <span>
            {{ formatUsage(usage?.guestCount, limits.guestCount) }}
          </span>
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

import { type SuperProjectSummary } from '@rfcx-bio/common/api-bio/super/projects'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useProjectTieringUsage } from '../_composables/use-project-tiering-usage'

const props = withDefaults(defineProps<{
  project: SuperProjectSummary
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

const tierBadgeClass = (projectType: SuperProjectSummary['projectType'] | undefined): string => {
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

const formatUsage = (used: number | undefined, limit: number | null): string => {
  const usedText = (used ?? 0).toLocaleString()
  const limitText = limit === null ? 'No cap' : limit.toLocaleString()
  return `${usedText} / ${limitText}`
}

const onProjectTypeChange = (event: Event): void => {
  emit('update:selectedProjectType', (event.target as HTMLSelectElement).value)
}
</script>
