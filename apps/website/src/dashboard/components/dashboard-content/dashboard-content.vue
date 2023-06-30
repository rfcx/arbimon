<template>
  <page-title
    :page-title="store?.selectedProject?.name ?? ''"
    :page-subtitle="content?.summary"
  />
  <markdown
    class="markdown-container mt-5"
    :source="content?.readme"
  />
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Markdown from 'vue3-markdown-it'

import { apiBioGetDashboardContent } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

import PageTitle from '@/_components/page-title.vue'
import { apiClientBioKey, storeKey } from '@/globals'
import type { BiodiversityStore } from '~/store'

const store = inject(storeKey) as BiodiversityStore
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const route = useRoute()

const content = ref(await apiBioGetDashboardContent(apiClientBio, store?.selectedProject?.id ?? -1))

watch(() => route.params.projectSlug, async (newRoute, oldRoute) => {
  if (newRoute !== oldRoute) {
    content.value = await apiBioGetDashboardContent(apiClientBio, store?.selectedProject?.id ?? -1)
  }
})
</script>

<style lang="scss">
.markdown-container {
  h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  h2:not(:first-child) {
    margin-top: 1.25rem;
  }
  p {
    margin-top: 0.75rem;
  }
  ul {
    list-style-type: square;
    margin-left: 1.25rem;
  }
  a:hover {
    -webkit-text-decoration-line: underline;
    text-decoration-line: underline;
  }
}
</style>
