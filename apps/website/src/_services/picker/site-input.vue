<template>
  <div class="relative my-6">
    <form
      id="siteResultDropdownTrigger"
      class="relative w-full p-2 border-fog border-1 rounded-lg flex flex-row items-center gap-1 flex-wrap"
      data-dropdown-toggle="siteResultDropdown"
    >
      <!-- selected sites so far -->
      <ul
        class="flex flex-row flex-wrap gap-2"
      >
        <li
          v-for="site in selectedOptions"
          :key="site"
          class="bg-util-gray-04 cursor-pointer rounded-sm px-2 py-1 flex flex-row grow items-center text-sm"
        >
          {{ site === ALL_SITES_OPTIONS.value ? ALL_SITES_OPTIONS.label : site }}
          <button
            type="button"
            class="ml-2 p-0.5 hover:bg-util-gray-03 rounded-sm"
            @click="unselectSite(site)"
          >
            <icon-fa-times class="w-2 h-2" />
          </button>
        </li>
      </ul>
      <input
        v-model="inputFilter"
        type="text"
        class="border-transparent px-2 py-1 bg-transparent ring-0 focus:ring-0 focus:border-transparent"
        placeholder="Search for sites"
        @keydown.delete="onKeydownDeleteSiteInput"
        @focus="hasFocusInput = true"
        @blur="hasFocusInput = false"
      >
      <span class="absolute right-4 cursor-pointer pointer-events-none">
        <icon-fa-chevron-down
          class="w-3 h-3 fa-chevron-down text-util-gray-03"
          :class="hasFocusInput ? 'transform rotate-180' : ''"
        />
      </span>
    </form>
    <div
      id="siteResultDropdown"
      class="absolute w-5/6 left-4 z-40 bg-white rounded-md shadow dark:bg-moss border-util-gray-03 border-1"
    >
      <!-- dropdown (list of sites) -->
      <!-- TODO: use flowbite dropdown -->
      <ul
        v-for="group in groupOptions"
        :key="group.label"
      >
        <li class="rounded-md px-4 py-2 text-sm text-subtle font-medium">
          {{ group.label }}
        </li>
        <li
          v-for="item in group.options"
          :key="item.value"
          class="cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-sm"
          @click="selectSite(item.value)"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">

/** Note: this UI needed to implement further.
 *
 * Reference:
 * All requirements from old component can be fonud at `site-picker.vue` file
 * Implementation detail for search + dropdown at `filter-site.vue` file
 *
 *  */

import { computed, ref } from 'vue'

import type { Site } from '@rfcx-bio/common/dao/types'

const ALL_SITES_OPTIONS = {
  value: '',
  label: 'All sites in the project'
}
const props = defineProps<{
  initialSites?: Site[]
}>()
const inputFilter = ref('')
const hasFocusInput = ref(false)

// TODO: change type to be Site[]
const projectSiteOptions = computed(() => props.initialSites ?? [])

// options
const siteOptions = computed(() => {
  const allSitesOptions = projectSiteOptions.value
    .map(s => ({
      value: s.name,
      label: s.name
    }))
  if (!inputFilter.value) { return allSitesOptions }
  // with filter
  const filtered = allSitesOptions?.filter(s => {
    return s.value.toLocaleLowerCase().startsWith(inputFilter.value.toLocaleLowerCase())
  })
  const special = {
    value: `${inputFilter.value}*`,
    label: `All sites start with ${inputFilter.value}`,
    disabled: isAllSiteOptionSelected.value
  }
  if ((filtered?.length ?? 0) > 0) { filtered?.unshift(special) }
  return filtered
})

const groupOptions = computed(() => {
  const optionAll = {
    value: 'Select all sites',
    label: 'Select all sites',
    options: [ALL_SITES_OPTIONS]
  }
  const optionFilter = {
    value: 'Filter sites',
    label: 'Filter sites',
    options: siteOptions.value
  }
  return ((siteOptions.value?.length ?? 0) > 0) ? [optionAll, optionFilter] : []
})

// selected values
const selectedOptions = ref([ALL_SITES_OPTIONS.value])
const isAllSiteOptionSelected = computed(() => selectedOptions.value.includes(ALL_SITES_OPTIONS.value))

// emit data to the parent component
// const selectedQuerySites = computed(() => {
//   return isAllSiteOptionSelected.value ? null : selectedOptions.value.join(',')
// })

const selectSite = (site: string) => {
  // if selected all sites, then remove all other sites
  if (site === ALL_SITES_OPTIONS.value) {
    selectedOptions.value = [ALL_SITES_OPTIONS.value]
    return
  }
  // if selected filter sites, then remove all sites
  const addOtherSitesWhileAllSitesSelected = (selectedOptions.value.find(s => s === ALL_SITES_OPTIONS.value) !== undefined) && site !== ALL_SITES_OPTIONS.value
  if (addOtherSitesWhileAllSitesSelected) { selectedOptions.value = [] }

  // if already selected, then do nothing
  if (selectedOptions.value.includes(site)) { return }

  selectedOptions.value = [...selectedOptions.value, site]
}

const unselectSite = (site: string) => {
  // force to default value = all sites
  if (selectedOptions.value.length === 1) {
    selectedOptions.value = [ALL_SITES_OPTIONS.value]
  } else {
    selectedOptions.value = selectedOptions.value.filter((s) => s !== site)
  }
}

const onKeydownDeleteSiteInput = () => {
  if (inputFilter.value.length === 0 && selectedOptions.value.length > 0) {
    unselectSite(selectedOptions.value[selectedOptions.value.length - 1])
  }
}

</script>
