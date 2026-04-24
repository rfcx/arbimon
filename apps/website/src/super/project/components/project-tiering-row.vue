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
          <select
            class="w-25 rounded border border-util-gray-03 bg-white px-2 py-1 text-xs capitalize"
            :value="selectedProjectType"
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
          <button
            type="button"
            class="rounded bg-frequency px-2 py-1 text-xs font-medium disabled:(cursor-not-allowed opacity-50)"
            :disabled="isSavingTier || selectedProjectType === (project.projectType ?? 'free')"
            @click="emit('save-tier', project)"
          >
            {{ isSavingTier ? 'Saving' : 'Save' }}
          </button>
        </div>
        <span :class="tierBadgeClass(project.projectType)">
          {{ project.projectType ?? 'free' }}
        </span>
        <!-- <span :class="stateBadgeClass(project)">
          {{ project.isLocked ? 'view-only' : 'active' }}
        </span> -->
      </div>
    </td>
    <td class="py-3 text-sm text-insight">
      {{ formatUsage(usage?.recordingMinutesCount, limits.recordingMinutesCount, 'mins') }}
    </td>
    <td class="py-3 text-sm text-insight">
      {{ formatUsage(usage?.jobCount, limits.jobCount) }}
    </td>
    <td class="py-3 text-sm text-insight">
      {{ formatUsage(usage?.collaboratorCount, limits.collaboratorCount) }}
    </td>
    <td class="py-3 text-sm text-insight">
      {{ formatUsage(usage?.guestCount, limits.guestCount) }}
    </td>
    <td
      v-if="showActions"
      class="py-3"
    >
      <div class="flex flex-col gap-2 text-sm">
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

const emit = defineEmits(['select-project', 'toggle-members', 'save-tier', 'update:selectedProjectType'])

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

// const stateBadgeClass = (project: SuperProjectSummary): string => {
//   if (project.isLocked === true) return 'inline-flex rounded-full bg-stone-200 px-2 py-1 text-xs font-semibold capitalize tracking-wide text-stone-700'
//   return 'inline-flex rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold capitalize tracking-wide text-sky-700'
// }

// const formatUsage = (used: number | undefined, limit: number | null, suffix?: string): string => {
//   const usedText = (used ?? 0).toLocaleString()
//   const limitText = limit === null ? 'No cap' : limit.toLocaleString()
//   return suffix === undefined ? `${usedText} / ${limitText}` : `${usedText} / ${limitText} ${suffix}`
// }

const formatUsage = (used: number | undefined, limit: number | null, suffix?: string): string => {
  const usedText = (used ?? 0).toLocaleString()
  return suffix === undefined ? `${usedText}` : `${usedText}`
}

const onProjectTypeChange = (event: Event): void => {
  emit('update:selectedProjectType', (event.target as HTMLSelectElement).value)
}
</script>
