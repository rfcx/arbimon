<template>
  <section class="bg-white dark:bg-pitch">
    <div class="max-w-screen-xl mx-auto grid gap-x-12 md:grid-cols-12">
      <aside class="md:col-span-4 md:(sticky h-screen top-4) mt-4 md:mt-12 pt-8">
        <PublicationsSidebarMenu
          v-model:search="search"
          v-model:paper-published-by="paperPublishedBy"
          v-model:publications-by-year="publicationsByYear"
          class="md:block hidden mx-5"
        />
        <PublicationsSelectorAccordions
          v-model:search="search"
          v-model:paper-published-by="paperPublishedBy"
          v-model:publications-by-year="publicationsByYear"
          class="md:hidden block mx-5"
        />
      </aside>
      <main class="md:col-span-8 mt-8 md:mt-20 mx-5">
        <icon-custom-ic-loading
          v-if="isLoading"
          class="block bg-none w-8 h-8 mx-auto mt-6"
        />
        <div
          v-else-if="searchTermAppliedPublications.length === 0"
          class="flex flex-col text-center"
        >
          <span class="text-base font-header text-center text-2xl mt-4">
            No Results Found.
          </span>
          <span>
            Your search did not return any matches. <br>
            Please double-check the spelling, or consider using alternative keywords,<br>
            such as specific species names or project titles.
          </span>
        </div>
        <div
          v-for="(publicationYear, idx) in publicationYearsList"
          v-else
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
import uFuzzy from '@leeoniya/ufuzzy'
import { groupBy } from 'lodash-es'
import { type Ref, computed, ref } from 'vue'

import type { LandingPublicationsResponse } from '@rfcx-bio/common/api-bio/landing/landing-publications'

import PublicationCard from '../components/publication-card.vue'
import PublicationsSelectorAccordions from '../components/publications-selector-accordions.vue'
import PublicationsSidebarMenu from '../components/publications-sidebar-menu.vue'
import type { Publication } from '../data/types'
import { type PaperPublishedBy } from './types'

// eslint-disable-next-line new-cap
const uf: Ref<uFuzzy> = ref(new uFuzzy())
const search = ref('')
const paperPublishedBy = ref<PaperPublishedBy>(null)
const publicationsByYear = ref<number | null>(null)

const props = withDefaults(defineProps<{ publications: LandingPublicationsResponse | undefined, isLoading: boolean }>(), {
  publications: undefined,
  isLoading: true
})

const paperPublishedByAppliedPublications = computed<Publication[]>(() => {
  if (paperPublishedBy.value === 'rfcx') {
    return props?.publications?.filter(p => p.isRFCxAuthor === true) ?? []
  }

  return props.publications ?? []
})

const searchTermAppliedPublications = computed<Publication[]>(() => {
  if (search.value === '') {
    return paperPublishedByAppliedPublications.value
  }

  // INFO: Check out https://github.com/leeoniya/uFuzzy/issues/7
  const haystack = paperPublishedByAppliedPublications.value.map(paper => {
    return `${paper.title}¦${paper.author}¦${paper.orgMention}¦${paper.journal}`
  })

  const indexes = uf.value.filter(haystack, search.value)
  if (indexes == null) {
    return paperPublishedByAppliedPublications.value
  }

  return indexes.map(i => paperPublishedByAppliedPublications.value[i])
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
