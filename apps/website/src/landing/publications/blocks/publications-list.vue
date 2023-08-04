<template>
  <section class="bg-white dark:bg-pitch">
    <div
      id="publication-list"
      class="max-w-screen-xl mx-auto grid gap-x-12"
    >
      <aside class="lg:w-90 w-full h-20" />
      <main class="grow shrink-0 mt-17">
        <div>
          <div
            v-for="(publicationYear, idx) in publicationYearsList"
            :key="`${publicationYear}_${idx}`"
          >
            <h1 class="text-white text-4xl mb-12 lg:mx-0 mx-7 leading-10">
              {{ publicationYear }}
            </h1>
            <div
              v-for="publication in publicationsGroupedByYear[publicationYear]"
              :key="publication.title"
              class="mb-10 mx-5 lg:mx-0 px-10 pt-6 pb-8 border-1 rounded-2xl border-frequency bg-moss"
            >
              <span class="text-xs text-spoonbill font-eyebrow">
                {{ publication.year }}| {{ publication.journal }}
              </span>
              <p class="text-xl mt-2 leading-7 text-white/80">
                {{ publication.title }}
              </p>
              <p class="text-base text-white/80 mt-2">
                {{ publication.author }}
              </p>
              <a
                :href="publication.doiUrl"
                rel="noreferrer nofollow"
                class="inline-block mt-4 text-frequency"
              >
                Read the paper <icon-fas-arrow-right class="inline-block text-frequency" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { groupBy } from 'lodash-es'
import { computed } from 'vue'

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

<style lang="scss">
div#publication-list {
  grid-template-rows: fit-content(10rem) 1fr;
}

@media (min-width: 1024px) {
  div#publication-list {
    grid-template-columns: 22.5rem 1fr;
  }
}
</style>
