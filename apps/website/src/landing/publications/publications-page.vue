<template>
  <section class="bg-white dark:bg-echo">
    <publication-hero />
    <publication-stat
      :is-loading="isLoading"
      :count-citation="citationCount"
      :count-publication="paperPublishedCount"
    />
    <publication-list
      :publications="publications"
      :is-loading="isLoading"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { sumBy } from 'lodash-es'
import { computed, inject } from 'vue'

import { apiClientBioKey } from '@/globals'
import publicationStat from './blocks/publications-data-stat.vue'
import publicationHero from './blocks/publications-hero.vue'
import publicationList from './blocks/publications-list.vue'
import { usePublications } from './composables/use-publications'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { data: publications, isLoading } = usePublications(apiClientBio)

const paperPublishedCount = computed(() => {
  if (isLoading.value || publications.value == null) {
    return 0
  }

  return publications.value.length
})

const citationCount = computed(() => {
  if (isLoading.value || publications.value == null) {
    return 0
  }

  return sumBy(publications.value, p => p.citations)
})
</script>
