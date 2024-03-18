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
        <project-objective-form
          :is-disabled="false"
          @emit-project-objectives="emitUpdateProjectObjectives"
        />
      </div>
      <div class="mt-4">
        <project-listed-form
          :is-public="isPublic"
          :is-disabled="false"
          :is-create-project="true"
          @emit-project-listed="toggleListedProject"
        />
      </div>
      <div class="mt-4 sm:mt-6">
        <button
          class="inline-flex items-center btn btn-primary"
          :disabled="isCreating"
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
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { apiBioPostProjectCreate } from '@rfcx-bio/common/api-bio/project/project-create'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { verifyDateFormError } from './components/form/functions'
import ProjectForm from './components/form/project-form.vue'
import ProjectListedForm from './components/form/project-listed-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import type { ProjectDefault } from './types'

const router = useRouter()

const apiClientBio = inject(apiClientKey) as AxiosInstance

const name = ref<string>('')
const startDate = ref<string | null>('')
const endDate = ref<string | null>('')
const onGoing = ref<boolean>(false)
const objectives = ref<string[]>([])
const isCreating = ref<boolean>(false)
const isPublic = ref<boolean>(true)

// error
const DEFAULT_ERROR_MSG = 'Give us a moment to get things straight and try submitting again.'
const hasFailed = ref<boolean>(false)
const errorMessage = ref<string>(DEFAULT_ERROR_MSG)

watch(name, () => { hasFailed.value = false })
watch(startDate, () => { hasFailed.value = false })
watch(endDate, () => { hasFailed.value = false })
watch(onGoing, () => { hasFailed.value = false })

const verifyFields = () => {
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
  const project = { name: name.value, hidden: !isPublic.value, objectives: objectives.value, dateStart: startDate.value ?? undefined, dateEnd: onGoing.value ? undefined : (endDate.value ?? undefined) }
  try {
    const response = await apiBioPostProjectCreate(apiClientBio, project)
    await router.push({ name: ROUTE_NAMES.dashboard, params: { projectSlug: response?.slug } })
  } catch (e) {
    if (e instanceof Error) console.error(e.message)
    hasFailed.value = true
    errorMessage.value = (e as Error)?.message ?? DEFAULT_ERROR_MSG
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
</script>
