<template>
  <div :class="$attrs.class">
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
        class="block w-full p-4 pl-10 text-md text-white/80 border border-white rounded-lg bg-transparent focus:ring-frequency focus:border-frequency dark:bg-transparent dark:border-white/80 dark:placeholder-white/80 dark:text-white/80 dark:focus:ring-frequency dark:focus:border-frequency"
        type="search"
        placeholder="Search for author, topic, title, etc."
        :value="search"
        @input="onInputEnter"
      >
    </div>
    <h2 class="text-white text-2xl font-medium leading-loose mt-6">
      Paper published by
    </h2>
    <ul>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0">
        <button
          type="button"
          :class="paperPublishedBy === 'rfcx' ? 'underline underline-offset-4 decoration-frequency text-frequency text-left' : 'text-left'"
          @click="$emit('update:paperPublishedBy', 'rfcx')"
        >
          Arbimon science team
        </button>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0">
        <button
          type="button"
          :class="paperPublishedBy === 'all' ? 'underline underline-offset-4 decoration-frequency text-frequency text-left' : 'text-left'"
          @click="$emit('update:paperPublishedBy', 'all')"
        >
          ALL
        </button>
      </li>
    </ul>
    <h2 class="text-white text-2xl font-medium leading-loose mt-6">
      Publications by year
    </h2>
    <ul>
      <li
        v-for="year in years"
        :key="year"
        class="mb-2 last:mb-0 mt-0 first:mt-2"
      >
        <button
          type="button"
          :class="publicationsByYear === year ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
          @click="onPublicationsByYearClick(year)"
        >
          {{ year }}
        </button>
      </li>
      <li class="mb-2 last:mb-0 mt-0 first:mt-2">
        <button
          type="button"
          :class="publicationsByYear === 2017 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
          @click="onPublicationsByYearClick(2017)"
        >
          See previous years
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import { type PaperPublishedBy } from '../blocks/types'

defineProps<{ search: string, paperPublishedBy: PaperPublishedBy, publicationsByYear: number | null }>()
const emits = defineEmits<{(e: 'update:search', value: string): void, (e: 'update:paperPublishedBy', value: PaperPublishedBy): void, (e: 'update:publicationsByYear', value: number | null): void}>()

const router = useRouter()

const onInputEnter = (ev: Event): void => {
  const target = ev.target as HTMLInputElement
  emits('update:search', target.value)
}

const onPublicationsByYearClick = (year: number): void => {
  router.push({ name: ROUTE_NAMES.landingPublications, hash: '#' + year.toString() })
  emits('update:publicationsByYear', year)
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2017 }, (_, index) => currentYear - index)

</script>
