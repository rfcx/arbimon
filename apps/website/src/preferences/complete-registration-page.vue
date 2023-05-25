<template>
  <project-navbar />
  <section class="bg-white dark:bg-mirage-gray">
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-24">
      <div class="text-gray-500 sm:text-lg dark:text-gray-400">
        <h2 class="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">
          Get started
        </h2>
        <p class="mb-4 font-light">
          As well as providing the Arbimon platform for free, we have additional opportunities for partnering on projects and providing support.
        </p>
        <p class="mb-4 font-medium">
          Please tell us a bit more about your Arbimon needs
        </p>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div class="sm:col-span-2">
          <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            1. How do you plan to use Arbimon?
          </p>
          <ul>
            <li
              v-for="option in purposeOptions"
              :key="'purpose-list-' + option.id"
              class="px-4 pb-2 align-middle list-item"
            >
              <input
                type="checkbox"
                class="rounded dark:bg-gray-700 dark:border-gray-300"
                :checked="isSelectedPurpose(option.id)"
                @click="updateSelectedPurpose(option.id)"
              >
              <label class="text-white ml-2">{{ option.label }}</label>
              <input
                v-if="option.id === 6"
                id="extra"
                v-model="extraPurpose"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary-600 focus:border-primary-600 ml-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              >
            </li>
          </ul>
        </div>
        <div class="sm:col-span-2">
          <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            2. What taxonomic groups are you interested in?
          </p>
          <label
            v-for="taxon in taxons"
            :key="'taxon-list-' + taxon.value"
            class="px-2 pb-2 align-middle"
          >
            <input
              type="checkbox"
              class="rounded dark:bg-gray-700 dark:border-gray-300"
              :checked="isSelectedTaxon(taxon.value)"
              @click="updateSelectedTaxon(taxon.value)"
            >
            <span class="text-white ml-2">{{ taxon.label }}</span>
          </label>
        </div>
        <div class="sm:col-span-2">
          <p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            3. What is your affiliation or associated organizations?
          </p>
          <textarea
            id="message"
            rows="2"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Write organizations here..."
          />
        </div>
      </div>
      <button
        class="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
        :disabled="isProcessing"
        @click.prevent="next"
      >
        Continue
      </button>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ProjectNavbar from '@/_layout/components/project-navbar/project-navbar.vue'
import { ROUTE_NAMES } from '~/router'

export interface PurposeType {
  id: number
  label: string
  extra?: string
  checked: boolean
}

export interface TaxonType {
  value: string
  label: string
  checked: boolean
}

const router = useRouter()

const isProcessing = ref<boolean>(false)
const extraPurpose = ref<string>('')

const purposeOptions: PurposeType[] = [
  { id: 1, label: 'Create baseline biodiversity', checked: false },
  { id: 2, label: 'Detect and monitor endangered/rare species', checked: false },
  { id: 3, label: 'Detect and monitor illegal activity', checked: false },
  { id: 4, label: 'Evaluate impact of human activities on biodiversity', checked: false },
  { id: 5, label: 'Evaluate impact of conservation initiatives on biodiversity', checked: false },
  { id: 6, label: 'Others:', checked: false }
]

const taxons: TaxonType[] = [
  { value: 'anurans', label: 'Anurans', checked: false },
  { value: 'bats', label: 'Bats', checked: false },
  { value: 'insects', label: 'Insects', checked: false },
  { value: 'non-flying-mammals', label: 'Non-flying mammals', checked: false },
  { value: 'birds', label: 'Birds', checked: false },
  { value: 'fish', label: 'Fish', checked: false },
  { value: 'others', label: 'Others', checked: false }
]

const selectedPurposes: number[] = []
const selectedTaxons: string[] = []

const isSelectedPurpose = (purposeId: number): boolean => {
  return selectedPurposes.includes(purposeId)
}

const isSelectedTaxon = (taxon: string): boolean => {
  return selectedTaxons.includes(taxon)
}

const updateSelectedPurpose = (purposeId: number): void => {
  const purposeIdx = selectedPurposes.findIndex(p => p === purposeId)
  if (purposeIdx === -1) {
    selectedPurposes.push(purposeIdx)
  } else {
    selectedPurposes.splice(purposeIdx, 1)
  }
}

const updateSelectedTaxon = (taxon: string): void => {
  const taxonIdx = selectedTaxons.findIndex(p => p === taxon)
  if (taxonIdx === -1) {
    selectedTaxons.push(taxon)
  } else {
    selectedTaxons.splice(taxonIdx, 1)
  }
}

async function next () {
  await router.push({ name: ROUTE_NAMES.createProject, query: { first: 1 } })
}
</script>
