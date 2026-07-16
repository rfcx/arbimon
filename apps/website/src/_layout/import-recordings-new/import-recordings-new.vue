<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) pb-20">
    <h1 class="mt-6">
      Upload recordings <span class="text-sm align-middle rounded bg-frequency/20 px-2 py-1 ml-2">BETA</span>
    </h1>
    <p class="text-sm text-cloud mt-2">
      Upload audio directly from your browser — no desktop app required. Files are processed automatically and appear in your project when complete.
    </p>

    <!-- Project selection -->
    <div class="mt-6">
      <label class="block text-sm mb-1">Project</label>
      <select
        v-model="selectedProjectSlug"
        class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2 min-w-64"
        @change="onProjectChange"
      >
        <option
          disabled
          value=""
        >
          Select a project…
        </option>
        <option
          v-for="project in projects"
          :key="project.slug"
          :value="project.slug"
        >
          {{ project.name }}
        </option>
      </select>
      <p
        v-if="selectedProjectLocked"
        class="mt-3 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm text-flamingo inline-block"
      >
        This project is view-only and cannot accept uploads.
      </p>
    </div>

    <upload-panel
      v-if="selectedProjectSlug !== '' && !selectedProjectLocked"
      :sites="sites"
      :project-slug="selectedProjectSlug"
    />
  </section>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'

import { type SiteResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type LocationProjectWithInfo, apiBioGetMyProjects, apiBioGetProjectBySlug } from '@rfcx-bio/common/api-bio/project/projects'

import UploadPanel from '@/_components/upload-panel/upload-panel.vue'
import { apiClientArbimonLegacyKey, apiClientKey } from '@/globals'

const apiClientBio = inject(apiClientKey)
const apiClientArbimon = inject(apiClientArbimonLegacyKey)

const projects = ref<LocationProjectWithInfo[]>([])
const selectedProjectSlug = ref('')
const selectedProjectLocked = ref(false)
const sites = ref<SiteResponse[]>([])

const loadProjects = async (): Promise<void> => {
  if (apiClientBio === undefined) return
  const response = await apiBioGetMyProjects(apiClientBio, 500)
  projects.value = (response?.data ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))
}

const onProjectChange = async (): Promise<void> => {
  sites.value = []
  selectedProjectLocked.value = false
  if (apiClientBio === undefined || apiClientArbimon === undefined || selectedProjectSlug.value === '') return
  const project = await apiBioGetProjectBySlug(apiClientBio, selectedProjectSlug.value)
  if (project?.isLocked === true) {
    selectedProjectLocked.value = true
    return
  }
  const response = await apiArbimonGetSites(apiClientArbimon, selectedProjectSlug.value, {})
  sites.value = (response ?? []).filter(site => site.external_id !== null && site.external_id !== '')
}

void loadProjects()
</script>
