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
        <p class="font-medium">
          Please tell us a bit more about your Arbimon needs
        </p>
      </div>

      <form
        class="py-8 space-y-4 md:space-y-8"
        action="#"
      >
        <div>
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >1. How do you plan to use Arbimon?</label>
          <div class="space-y-2">
            <div
              v-for="option in purposeOptions"
              :key="'purpose-list-' + option.id"
              class="items-center"
            >
              <input
                type="checkbox"
                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                :checked="isSelectedPurpose(option.id)"
                @click="updateSelectedPurpose(option.id)"
              >
              <label class="font-light text-gray-500 dark:text-gray-300 ml-2">{{ option.label }}</label>
            </div>
            <div class="items-center">
              <input
                type="checkbox"
                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
              >
              <label class="font-light text-gray-500 dark:text-gray-300 ml-2">Other</label>
              <input
                id="extra"
                v-model="extraPurpose"
                placeholder="(please specify)"
                class="ml-2 w-1/2 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
            </div>
          </div>
        </div>
        <div>
          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >2. What taxonomic groups are you interested in?</label>
          <div class="items-center">
            <label
              v-for="taxon in taxons"
              :key="'taxon-list-' + taxon.value"
              class="mr-4"
            >
              <input
                type="checkbox"
                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                name="taxonomicgroups"
                :checked="isSelectedTaxon(taxon.value)"
                @click="updateSelectedTaxon(taxon.value)"
              >
              <span class="font-light text-gray-500 dark:text-gray-300 ml-2">{{ taxon.label }}</span>
            </label>
          </div>
        </div>

        <div>
          <label
            for="organizations"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >3. What is your affiliation or associated organization(s)?</label>
          <input
            id="organizations"
            type="text"
            name="organizations"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
        </div>

        <div>
          <label
            for="occupation"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >4. Which of these best describes you?</label>
          <select
            id="occupation"
            name="occupation"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option>Ecologist</option>
            <option>Conservationist</option>
            <option>Data scientist</option>
            <option>Citizen scientist</option>
            <option>Researcher</option>
            <option>Advocate</option>
            <option>Project funder</option>
            <option>Student</option>
            <option>None of these</option>
          </select>
        </div>
      </form>

      <div>
        <button
          class="px-5 py-2.5 font-medium text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
          :disabled="isProcessing"
          @click.prevent="next"
        >
          Continue
        </button>
        <router-link
          :to="{ name: ROUTE_NAMES.createProject, query: { first: 1 } }"
          class="ml-4 px-5 py-2.5 text-gray-600 dark:text-gray-500 hover:underline font-light"
        >
          Skip
        </router-link>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ProjectNavbar from '@/_layout/components/project-navbar/project-navbar.vue'
import { ROUTE_NAMES } from '~/router'

const router = useRouter()

const isProcessing = ref<boolean>(false)
const extraPurpose = ref<string>('')

const purposeOptions = [
  { id: 1, label: 'Create baseline biodiversity', checked: false },
  { id: 2, label: 'Detect and monitor endangered/rare species', checked: false },
  { id: 3, label: 'Detect and monitor illegal activity', checked: false },
  { id: 4, label: 'Evaluate impact of human activities on biodiversity', checked: false },
  { id: 5, label: 'Evaluate impact of conservation initiatives on biodiversity', checked: false }
]

const taxons = [
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
