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
        placeholder="Search for author, topic, title, etc"
        :value="search"
        @input="onInputEnter"
      >
    </div>
    <div
      id="accordion-flush"
      data-accordion="collapse"
      data-active-classes="dark:bg-transparent text-white border-b-0 border-black dark:border-b-0"
      data-inactive-classes="text-insight"
    >
      <h2 id="accordion-flush-heading-1">
        <button
          type="button"
          class="flex items-center justify-between w-full py-4 text-base font-medium text-left text-black border-b border-black dark:border-white dark:text-white"
          data-accordion-target="#accordion-flush-body-1"
          aria-expanded="true"
          aria-controls="accordion-flush-body-1"
        >
          <span>Publications by year</span>
          <svg
            id="accordion-flush-icon-1"
            data-accordion-icon
            class="transform w-3 h-3 rotate-180 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5 5 1 1 5"
            />
          </svg>
        </button>
      </h2>
      <div
        id="accordion-flush-body-1"
        class="hidden"
        aria-labelledby="accordion-flush-heading-1"
      >
        <div class="py-5 border-b-1 border-white">
          <ul>
            <li class="mb-2 last:mb-0">
              <button
                type="button"
                :class="publicationsByYear === 2023 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
                @click="onPublicationsByYearClick(2023)"
              >
                2023
              </button>
            </li>
            <li class="mb-2 last:mb-0">
              <button
                type="button"
                :class="publicationsByYear === 2022 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
                @click="onPublicationsByYearClick(2022)"
              >
                2022
              </button>
            </li>
            <li class="mb-2 last:mb-0">
              <button
                type="button"
                :class="publicationsByYear === 2021 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
                @click="onPublicationsByYearClick(2021)"
              >
                2021
              </button>
            </li>
            <li class="mb-2 last:mb-0">
              <button
                type="button"
                :class="publicationsByYear === 2020 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
                @click="onPublicationsByYearClick(2020)"
              >
                2020
              </button>
            </li>
            <li class="mb-2 last:mb-0">
              <button
                type="button"
                :class="publicationsByYear === 2019 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
                @click="onPublicationsByYearClick(2019)"
              >
                2019
              </button>
            </li>
            <li class="mb-2 last:mb-0">
              <button
                type="button"
                :class="publicationsByYear === 2018 ? 'text-white text-base font-normal leading-normal underline underline-offset-4 decoration-frequency text-frequency' : 'text-white text-base font-normal leading-normal'"
                @click="onPublicationsByYearClick(2018)"
              >
                2018
              </button>
            </li>
            <li class="mb-2 last:mb-0">
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
      </div>

      <h2 id="accordion-flush-heading-2">
        <button
          type="button"
          class="flex items-center justify-between w-full py-4 text-base font-medium text-left text-black border-b border-black dark:border-white dark:text-white"
          data-accordion-target="#accordion-flush-body-2"
          aria-expanded="true"
          aria-controls="accordion-flush-body-2"
        >
          <span>Paper published by</span>
          <svg
            id="accordion-flush-icon-2"
            data-accordion-icon
            class="transform w-3 h-3 rotate-180 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5 5 1 1 5"
            />
          </svg>
        </button>
      </h2>
      <div
        id="accordion-flush-body-2"
        class="hidden"
        aria-labelledby="accordion-flush-heading-2"
      >
        <div class="py-5 border-b-1 border-white">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AccordionItem, Accordion } from 'flowbite'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import { type PaperPublishedBy } from '../blocks/types'

defineProps<{ search: string, paperPublishedBy: PaperPublishedBy, publicationsByYear: number | null }>()
const emits = defineEmits<{(e: 'update:search', value: string): void, (e: 'update:paperPublishedBy', value: PaperPublishedBy): void, (e: 'update:publicationsByYear', value: number | null): void}>()

const router = useRouter()
const accordions = ref<Accordion | null>(null)

onMounted(() => {
  const items: AccordionItem[] = [
    {
      id: 'accordion-flush-body-1',
      triggerEl: document.querySelector('#accordion-flush-heading-1') as HTMLElement,
      targetEl: document.querySelector('#accordion-flush-body-1') as HTMLElement,
      iconEl: document.querySelector('#accordion-flush-icon-1') as HTMLElement,
      active: true
    },
    {
      id: 'accordion-flush-body-2',
      triggerEl: document.querySelector('#accordion-flush-heading-2') as HTMLElement,
      targetEl: document.querySelector('#accordion-flush-body-2') as HTMLElement,
      iconEl: document.querySelector('#accordion-flush-icon-2') as HTMLElement,
      active: false
    }
  ]

  accordions.value = new Accordion(items, { alwaysOpen: false, activeClasses: 'dark:bg-transparent text-white border-b-0 border-black dark:border-b-0', inactiveClasses: 'text-insight' })
})

const onInputEnter = (ev: Event): void => {
  const target = ev.target as HTMLInputElement
  emits('update:search', target.value)
}

const onPublicationsByYearClick = (year: number): void => {
  router.push({ name: ROUTE_NAMES.landingPublications, hash: '#' + year.toString() })
  emits('update:publicationsByYear', year)
}
</script>
