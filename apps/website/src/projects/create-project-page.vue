<template>
  <project-navbar />
  <section class="pt-16 bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-24">
      <h2 class="tracking-tight font-medium text-gray-900 dark:text-white">
        Create a new project
      </h2>
      <div class="mt-4">
        <project-form @emit-update-value="emitUpdateValue" />
      </div>
      <div class="mt-4">
        <project-objective-form @emit-project-objectives="emitUpdateProjectObjectives" />
      </div>
      <div class="mt-4 sm:mt-6">
        <button
          class="inline-flex items-center btn btn-primary"
          :disabled="isCreating"
          @click.prevent="create"
        >
          Create project
        </button>
        <svg
          v-if="isCreating"
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 ml-4 text-white animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>
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

import ProjectNavbar from '@/_layout/components/project-navbar/project-navbar.vue'
import { apiClientBioKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ProjectForm from './components/form/project-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import type { ProjectDefault, ProjectObjective } from './types'

const router = useRouter()
const store = useStore()

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const name = ref<string>('')
const objectives = ref<ProjectObjective[]>([])
const isCreating = ref<boolean>(false)

// error
const DEFAULT_ERROR_MSG = 'Give us a moment to get things straight and try submitting again.'
const hasFailed = ref<boolean>(false)
const errorMessage = ref<string>(DEFAULT_ERROR_MSG)

watch(name, () => { hasFailed.value = false })

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
  const objectiveTexts = objectives.value.map(o => o.id !== 999 ? o.slug : o.description)
  const project = { name: name.value, objectives: objectiveTexts }
  try {
    const response = await apiBioPostProjectCreate(apiClientBio, project)
    await store.refreshProjects()
    await router.push({ name: ROUTE_NAMES.overview, params: { projectSlug: response?.slug } })
  } catch (e) {
    if (e instanceof Error) console.error(e.message)
    hasFailed.value = true
    errorMessage.value = (e as Error)?.message ?? DEFAULT_ERROR_MSG
  }
  isCreating.value = false
}

const emitUpdateValue = (project: ProjectDefault) => {
  name.value = project.name
}

const emitUpdateProjectObjectives = (projectObjectives: ProjectObjective[]) => {
  objectives.value = projectObjectives
}
</script>
