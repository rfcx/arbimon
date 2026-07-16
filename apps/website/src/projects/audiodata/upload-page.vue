<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) pb-20">
    <h1 class="mt-6">
      Upload recordings <span class="text-sm align-middle rounded bg-frequency/20 px-2 py-1 ml-2">BETA</span>
    </h1>
    <div
      v-if="isProjectViewOnly"
      class="mt-6 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm text-flamingo"
    >
      This project is currently view-only. Uploads are disabled until the project is reactivated.
    </div>
    <upload-panel
      v-else
      :sites="sites"
      :project-slug="store.project?.slug"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'

import { type SiteResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import UploadPanel from '@/_components/upload-panel/upload-panel.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'

const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey)

const isProjectViewOnly = computed(() => store.project?.isLocked === true)

const sites = ref<SiteResponse[]>([])

onMounted(async () => {
  const slug = store.project?.slug
  if (slug === undefined || apiClientArbimon === undefined) return
  const response = await apiArbimonGetSites(apiClientArbimon, slug, {})
  sites.value = (response ?? []).filter(site => site.external_id !== null && site.external_id !== '')
})
</script>
