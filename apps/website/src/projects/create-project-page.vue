<template>
  <landing-navbar />
  <section class="pt-16">
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-24">
      <h1 class="tracking-tight font-medium text-gray-900 dark:text-white">
        Create a new project
      </h1>
      <div class="mt-4">
        <project-form
          :is-disabled="false"
          @emit-update-value="emitUpdateValue"
        />
      </div>
      <div class="mt-4">
        <div class="rounded-lg border border-util-gray-03 bg-util-gray-01 p-4 dark:(bg-moss border-util-gray-04)">
          <p class="text-sm text-insight">
            Current plan
          </p>
          <div class="mt-2 inline-flex rounded-full bg-frequency/10 px-3 py-1 text-sm font-medium text-frequency">
            {{ currentAccountTierLabel }}
          </div>
          <p class="mt-4 text-sm text-insight">
            Choose a project type for this new project.
          </p>
          <div
            v-if="portfolioSummary"
            class="mt-4 grid gap-3 sm:grid-cols-3"
          >
            <div class="rounded-lg border border-util-gray-03 bg-white px-4 py-3 dark:bg-pitch">
              <p class="text-xs uppercase tracking-wide text-insight">
                Free slots
              </p>
              <p class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                {{ portfolioSummary.usage.freeProjects }} / {{ formatLimit(portfolioSummary.limits.freeProjects) }}
              </p>
            </div>
            <div class="rounded-lg border border-util-gray-03 bg-white px-4 py-3 dark:bg-pitch">
              <p class="text-xs uppercase tracking-wide text-insight">
                Premium slots
              </p>
              <p class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                {{ portfolioSummary.usage.premiumProjects }} / {{ formatLimit(portfolioSummary.limits.premiumProjects) }}
              </p>
            </div>
            <div class="rounded-lg border border-util-gray-03 bg-white px-4 py-3 dark:bg-pitch">
              <p class="text-xs uppercase tracking-wide text-insight">
                Unlimited slots
              </p>
              <p class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                {{ portfolioSummary.usage.unlimitedProjects }} / {{ formatLimit(portfolioSummary.limits.unlimitedProjects) }}
              </p>
            </div>
          </div>
          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <button
              v-for="option in projectTypeOptions"
              :key="option.id"
              type="button"
              class="rounded-lg border p-4 text-left transition"
              :class="[
                option.enabled !== true
                  ? 'cursor-not-allowed border-util-gray-03 bg-util-gray-02 text-subtle opacity-70 dark:(border-util-gray-04 bg-moss text-fog/60)'
                  : selectedProjectType === option.id
                    ? 'border-frequency bg-frequency/5'
                    : 'border-util-gray-03 bg-white hover:border-frequency/50 dark:bg-pitch'
              ]"
              :disabled="!option.enabled"
              @click="selectProjectType(option.id)"
            >
              <div class="flex items-center justify-between gap-2">
                <span
                  class="font-medium"
                  :class="option.enabled ? 'text-gray-900 dark:text-white' : 'text-subtle dark:text-fog/60'"
                >
                  {{ option.label }}
                </span>
                <span
                  v-if="option.badgeLabel"
                  class="rounded-full px-2 py-1 text-xs"
                  :class="option.badgeLabel === 'Full'
                    ? 'bg-flamingo/10 text-flamingo'
                    : 'bg-util-gray-03 text-insight'"
                >
                  {{ option.badgeLabel }}
                </span>
              </div>
              <p
                class="mt-2 text-sm"
                :class="option.enabled ? 'text-insight' : 'text-subtle dark:text-fog/60'"
              >
                {{ option.description }}
              </p>
            </button>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <project-objective-form
          :is-disabled="false"
          @emit-project-objectives="emitUpdateProjectObjectives"
        />
      </div>
      <div class="mt-4">
        <project-listed-form
          :is-public="isPublic"
          :is-disabled="selectedProjectType === 'free'"
          :is-create-project="true"
          @emit-project-listed="toggleListedProject"
        />
        <p
          v-if="selectedProjectType === 'free'"
          class="mt-3 text-sm text-insight"
        >
          Free projects must remain public.
        </p>
      </div>
      <div class="mt-4 sm:mt-6">
        <button
          class="inline-flex items-center btn btn-primary disabled:(cursor-not-allowed border-util-gray-03 bg-util-gray-03 text-subtle shadow-none opacity-100 hover:bg-util-gray-03) dark:disabled:(border-util-gray-04 bg-util-gray-04 text-fog/70 hover:bg-util-gray-04)"
          :disabled="isCreating || !isSelectedProjectTypeAvailable"
          @click.prevent="create"
        >
          Create project
        </button>
        <icon-custom-ic-loading
          v-if="isCreating"
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 ml-4 text-white animate-spin"
        />
        <span
          v-if="hasFailed"
          class="p-4 text-sm text-red-800 dark:text-flamingo"
          role="alert"
        >
          <span class="font-medium">Failed!</span> {{ errorMessage }}
        </span>
        <p
          v-else-if="!isSelectedProjectTypeAvailable"
          class="mt-3 text-sm text-insight"
        >
          {{ selectedProjectTypeLabel }} project slots are full for your current plan.
        </p>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { type AxiosError, type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { apiBioPostProjectCreate } from '@rfcx-bio/common/api-bio/project/project-create'
import { type ProjectType } from '@rfcx-bio/common/dao/types'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { ACCOUNT_TIER_LABELS, formatTierLimit, getProjectTypeCreateDescription } from '@/projects/entitlement-helpers'
import { ROUTE_NAMES } from '~/router'
import { useGetProfileData } from '../user/composables/use-patch-user-profile'
import { useGetPortfolioSummary } from '../user/composables/use-tiering'
import { verifyDateFormError } from './components/form/functions'
import ProjectForm from './components/form/project-form.vue'
import ProjectListedForm from './components/form/project-listed-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import type { ProjectDefault } from './types'

const router = useRouter()

const apiClientBio = inject(apiClientKey) as AxiosInstance
const { data: profileData } = useGetProfileData(apiClientBio)
const { data: portfolioSummary } = useGetPortfolioSummary(apiClientBio)

const name = ref<string>('')
const startDate = ref<string | null>('')
const endDate = ref<string | null>('')
const onGoing = ref<boolean>(false)
const objectives = ref<string[]>([])
const isCreating = ref<boolean>(false)
const isPublic = ref<boolean>(true)
const selectedProjectType = ref<ProjectType>('free')

// error
const DEFAULT_ERROR_MSG = 'Give us a moment to get things straight and try submitting again.'
const hasFailed = ref<boolean>(false)
const errorMessage = ref<string>(DEFAULT_ERROR_MSG)

watch(name, () => { hasFailed.value = false })
watch(startDate, () => { hasFailed.value = false })
watch(endDate, () => { hasFailed.value = false })
watch(onGoing, () => { hasFailed.value = false })
watch(selectedProjectType, (newValue) => {
  hasFailed.value = false
  if (newValue === 'free') isPublic.value = true
})

const currentAccountTier = computed(() => portfolioSummary.value?.accountTier ?? profileData.value?.accountTier ?? 'free')

const currentAccountTierLabel = computed(() => {
  return ACCOUNT_TIER_LABELS[currentAccountTier.value]
})

const getProjectUsage = (projectType: ProjectType): number => {
  const summary = portfolioSummary.value
  if (summary === undefined) return 0
  if (projectType === 'premium') return summary.usage.premiumProjects
  if (projectType === 'unlimited') return summary.usage.unlimitedProjects
  return summary.usage.freeProjects
}

const getProjectLimit = (projectType: ProjectType): number | null | undefined => {
  const summary = portfolioSummary.value
  if (summary === undefined) return undefined
  if (projectType === 'premium') return summary.limits.premiumProjects
  if (projectType === 'unlimited') return summary.limits.unlimitedProjects
  return summary.limits.freeProjects
}

const isProjectTypeSlotFull = (projectType: ProjectType): boolean => {
  const limit = getProjectLimit(projectType)
  if (limit === undefined || limit === null) return false
  return getProjectUsage(projectType) >= limit
}

const projectTypeOptions = computed<Array<{ id: ProjectType, label: string, description: string, enabled: boolean, badgeLabel?: string }>>(() => {
  return [
    {
      id: 'free',
      label: 'Free',
      description: getProjectTypeCreateDescription('free'),
      enabled: !isProjectTypeSlotFull('free'),
      badgeLabel: isProjectTypeSlotFull('free') ? 'Full' : undefined
    },
    {
      id: 'premium',
      label: 'Premium',
      description: getProjectTypeCreateDescription('premium'),
      enabled: (currentAccountTier.value === 'pro' || currentAccountTier.value === 'enterprise') && !isProjectTypeSlotFull('premium'),
      badgeLabel: currentAccountTier.value !== 'pro' && currentAccountTier.value !== 'enterprise'
        ? 'Unavailable'
        : (isProjectTypeSlotFull('premium') ? 'Full' : undefined)
    },
    {
      id: 'unlimited',
      label: 'Unlimited',
      description: getProjectTypeCreateDescription('unlimited'),
      enabled: currentAccountTier.value === 'enterprise' && !isProjectTypeSlotFull('unlimited'),
      badgeLabel: currentAccountTier.value !== 'enterprise'
        ? 'Unavailable'
        : (isProjectTypeSlotFull('unlimited') ? 'Full' : undefined)
    }
  ]
})

const isSelectedProjectTypeAvailable = computed(() => {
  return projectTypeOptions.value.some(option => option.id === selectedProjectType.value && option.enabled)
})

const selectedProjectTypeLabel = computed(() => {
  return projectTypeOptions.value.find(option => option.id === selectedProjectType.value)?.label ?? selectedProjectType.value
})

watch(projectTypeOptions, (options) => {
  const selectedOption = options.find(option => option.id === selectedProjectType.value)
  if (selectedOption?.enabled === true) return

  const firstAvailableOption = options.find(option => option.enabled)
  if (firstAvailableOption !== undefined) {
    selectedProjectType.value = firstAvailableOption.id
  }
}, { immediate: true })

const formatLimit = (limit: number | null) => {
  return formatTierLimit(limit)
}

const verifyFields = () => {
  if (!isSelectedProjectTypeAvailable.value) {
    hasFailed.value = true
    errorMessage.value = `${selectedProjectTypeLabel.value} project slots are full for your current plan`
    return false
  }
  if (name.value.length === 0) {
    hasFailed.value = true
    errorMessage.value = 'Please enter a project name'
    return false
  }
  if (objectives.value.length === 0) {
    hasFailed.value = true
    errorMessage.value = 'Please enter at least one objective'
    return false
  }
  const dateError = verifyDateFormError(startDate.value ? startDate.value : undefined, endDate.value ? endDate.value : undefined, onGoing.value)
  if (dateError.length > 0) {
    hasFailed.value = true
    errorMessage.value = dateError
    return false
  }
  return true
}

const resetErrorState = () => {
  hasFailed.value = false
  errorMessage.value = DEFAULT_ERROR_MSG
}

async function create () {
  if (!verifyFields()) return
  resetErrorState()
  isCreating.value = true
  const project = {
    name: name.value,
    projectType: selectedProjectType.value,
    hidden: selectedProjectType.value === 'free' ? false : !isPublic.value,
    objectives: objectives.value,
    dateStart: startDate.value ?? undefined,
    dateEnd: onGoing.value ? undefined : (endDate.value ?? undefined)
  }
  try {
    const response = await apiBioPostProjectCreate(apiClientBio, project)
    await router.push({ name: ROUTE_NAMES.dashboard, params: { projectSlug: response?.slug } })
  } catch (e) {
    const error = e as AxiosError<{ message?: string }>
    if (e instanceof Error) console.error(e.message)
    hasFailed.value = true
    errorMessage.value = error.response?.data?.message ?? error.message ?? DEFAULT_ERROR_MSG
  }
  isCreating.value = false
}

const emitUpdateValue = (project: ProjectDefault) => {
  name.value = project.name
  startDate.value = project.startDate
  endDate.value = project.endDate
  onGoing.value = project.onGoing
}

const emitUpdateProjectObjectives = (projectObjectiveSlugs: string[]) => {
  objectives.value = projectObjectiveSlugs
}

const toggleListedProject = (value: boolean) => {
  isPublic.value = value
}

const selectProjectType = (projectType: ProjectType) => {
  const option = projectTypeOptions.value.find(item => item.id === projectType)
  if (option?.enabled !== true) return
  selectedProjectType.value = projectType
}
</script>
