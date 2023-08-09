<template>
  <section class="bg-white dark:bg-pitch">
    <div class="max-w-screen-xl mx-auto grid gap-x-12 md:grid-cols-12">
      <aside class="md:col-span-4 md:(sticky h-screen top-4) mt-4 md:mt-12 pt-8">
        <PublicationsSidebarMenu
          v-model="search"
          class="md:block hidden mx-5"
        />
        <PublicationsSelectorAccordions
          v-model="search"
          class="md:hidden block mx-5"
        />
      </aside>
      <main class="md:col-span-8 mt-8 md:mt-20 mx-5">
        <div
          v-for="(publicationYear, idx) in publicationYearsList"
          :key="`${publicationYear}_${idx}`"
        >
          <h1
            :id="publicationYear.toString()"
            class="text-white text-4xl mb-6 md:mb-12 leading-10"
          >
            {{ publicationYear }}
          </h1>
          <PublicationCard
            v-for="publication in publicationsGroupedByYear[publicationYear]"
            :key="publication.title"
            :publication="publication"
          />
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { groupBy } from 'lodash-es'
import { computed, ref } from 'vue'

import PublicationCard from '../components/publication-card.vue'
import PublicationsSelectorAccordions from '../components/publications-selector-accordions.vue'
import PublicationsSidebarMenu from '../components/publications-sidebar-menu.vue'
import { publications } from '../data'
import type { Publication } from '../data/types'

const search = ref('')

const searchTermAppliedPublications = computed<Publication[]>(() => {
  if (search.value === '') {
    return publications
  }

  return publications.filter(p => {
    return p.title.includes(search.value) || p.author.includes(search.value) || p.orgMention.includes(search.value)
  })
})

const publicationsGroupedByYear = computed<Record<number, Publication[]>>(() => {
  return groupBy(searchTermAppliedPublications.value, p => p.year)
})

/**
 * Return sorted list of available years in all publications sorted descendingly [2023, 2022, 2021].
 */
const publicationYearsList = computed<number[]>(() => {
  return Object.keys(publicationsGroupedByYear.value).map(p => Number(p)).sort((a, b) => b - a)
})
</script>
