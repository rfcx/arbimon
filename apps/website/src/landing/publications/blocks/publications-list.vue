<template>
  <section class="bg-white dark:bg-pitch">
    <div class="max-w-screen-xl mx-auto grid gap-x-12 md:grid-cols-12">
      <aside class="md:col-span-4 md:(sticky h-screen top-4) mt-12 pt-8">
        <label
          for="search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            id="search"
            v-model="search"
            class="block w-full p-4 pl-10 text-md text-white/80 border border-white rounded-lg bg-transparent focus:ring-frequency focus:border-frequency dark:bg-transparent dark:border-white/80 dark:placeholder-white/80 dark:text-white/80 dark:focus:ring-frequency dark:focus:border-frequency"
            type="search"
            placeholder="Search for author, species, etc."
          >
        </div>
        <h2 class="text-white text-2xl font-medium leading-loose mt-6">
          Paper published by
        </h2>
        <ul>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 first:mt-2 mt-0">
            Arbimon Science Team
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 first:mt-2 mt-0">
            ALL
          </li>
        </ul>
        <h2 class="text-white text-2xl font-medium leading-loose mt-6">
          Publications by year
        </h2>
        <ul>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            2023
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            2022
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            2021
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            2020
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            2019
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            2018
          </li>
          <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
            See previous years
          </li>
        </ul>
      </aside>
      <main class="md:col-span-8 mt-20 mx-5">
        <div
          v-for="(publicationYear, idx) in publicationYearsList"
          :key="`${publicationYear}_${idx}`"
        >
          <h1
            :id="publicationYear.toString()"
            class="text-white text-4xl mb-12 lg:mx-0 mx-7 leading-10"
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
import { publications } from '../data'
import type { Publication } from '../data/types'

const search = ref('')

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
