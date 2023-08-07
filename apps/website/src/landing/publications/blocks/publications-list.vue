<template>
  <section class="bg-white dark:bg-pitch">
    <div class="max-w-screen-xl mx-auto grid gap-x-12 md:grid-cols-12">
      <aside class="md:col-span-4 md:(sticky h-screen top-4)" />
      <main class="md:col-span-8 mt-17 mx-5">
        <div
          v-for="(publicationYear, idx) in publicationYearsList"
          :key="`${publicationYear}_${idx}`"
        >
          <h1 class="text-white text-4xl mb-12 lg:mx-0 mx-7 leading-10">
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
import { computed } from 'vue'

import PublicationCard from '../components/publication-card.vue'
import { publications } from '../data'
import type { Publication } from '../data/types'

const publicationsGroupedByYear = computed<Record<number, Publication[]>>(() => {
  return groupBy(publications, p => p.year)
})

/**
 * Return sorted list of available years in all publications sorted descendingly [2023, 2022, 2021].
 */
const publicationYearsList = computed<number[]>(() => {
  return Object.keys(publicationsGroupedByYear.value).map(p => Number(p)).sort((a, b) => b - a)
})
</script>
