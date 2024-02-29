<template>
  <div class="relative my-6">
    <form
      ref="siteResultForm"
      class="relative w-full py-1 px-2 flex flex-row items-center gap-1 flex-wrap border-1 border-frequency rounded-md focus:border-frequency focus:outline-none focus:ring-0"
      @click="openSiteTrigger()"
    >
      <!-- selected sites so far -->
      <ul
        class="flex flex-row flex-wrap gap-2"
      >
        <li
          v-for="site in selectedOptions"
          :key="site.label"
          class="cursor-pointer rounded-sm px-2 py-1 flex flex-row grow items-center text-base bg-util-gray-01 text-black"
        >
          {{ site === ALL_SITES_OPTIONS ? ALL_SITES_OPTIONS.label : site.label }}
          <button
            type="button"
            class="ml-2 p-0.5 hover:bg-util-gray-02 rounded-sm"
            @click="unselectSite(site)"
          >
            <icon-custom-ic-close-black class="w-4 h-4 cursor-pointer" />
          </button>
        </li>
      </ul>
      <input
        ref="siteResultInput"
        v-model="inputFilter"
        type="text"
        class="border-transparent px-2 py-1 bg-transparent ring-0 focus:ring-0 focus:border-transparent"
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
      ref="siteResultDropdownContainer"
      class="absolute w-5/6 left-4 z-40 bg-white rounded-md shadow dark:bg-moss border-util-gray-03 border-1 hidden"
    >
      <ul
        v-for="group in groupOptions"
        :key="group.label"
        class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md"
      >
        <li class="rounded-md px-4 py-2 text-base text-subtle font-medium">
          {{ group.label }}
        </li>
        <li
          v-for="item in group.options"
          :key="item.value"
          class="cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-base"
          @click="selectSite(item)"
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

import { Dropdown } from 'flowbite'
import { type Ref, computed, nextTick, onMounted, ref, watch } from 'vue'

import type { Site } from '@rfcx-bio/common/dao/types'

const ALL_SITES_OPTIONS = {
  value: '',
  label: 'All sites in the project'
}
const props = defineProps<{
  initialSites?: Site[]
}>()
const emit = defineEmits<{(e: 'emitSelectSites', value: string | null): void}>()
const inputFilter = ref('')
const hasFocusInput = ref(false)
const hasDeletedSite = ref(false)
const siteSearchDropdown = ref() as Ref<Dropdown>
const siteResultForm = ref<HTMLDivElement | null>(null)
const siteResultInput = ref<HTMLDivElement | null>(null)
const siteResultDropdownContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  siteSearchDropdown.value = new Dropdown(siteResultDropdownContainer.value, siteResultForm.value, { placement: 'bottom', triggerType: 'none', offsetDistance: 1 })
})

const openSiteTrigger = async () => {
  if (hasDeletedSite.value) {
    siteSearchDropdown.value.hide()
    hasDeletedSite.value = false
    return
  }

  await nextTick()
  siteResultInput.value?.focus()
  siteSearchDropdown.value.show()
}
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
const selectedOptions = ref([ALL_SITES_OPTIONS])
const isAllSiteOptionSelected = computed(() => selectedOptions.value.includes(ALL_SITES_OPTIONS))

// emit data to the parent component
// const selectedQuerySites = computed(() => {
//   return isAllSiteOptionSelected.value ? null : selectedOptions.value.join(',')
// })

const selectSite = (site: {value: string, label: string}) => {
  // if selected all sites, then remove all other sites
  if (site.value === ALL_SITES_OPTIONS.value) {
    selectedOptions.value = [ALL_SITES_OPTIONS]
    return
  }

  // if selected filter sites, then remove all sites
  const addOtherSitesWhileAllSitesSelected = (selectedOptions.value.find(s => s.value === ALL_SITES_OPTIONS.value) !== undefined) && site.value !== ALL_SITES_OPTIONS.value
  if (addOtherSitesWhileAllSitesSelected) { selectedOptions.value = [] }

  // if already selected, then do nothing
  if (selectedOptions.value.some(s => s.value === site.value)) { return }

  selectedOptions.value = [...selectedOptions.value, site]
}

const unselectSite = (site: {value: string, label: string}) => {
  // force to default value = all sites
  if (selectedOptions.value.length === 1) {
    selectedOptions.value = [ALL_SITES_OPTIONS]
  } else {
    selectedOptions.value = selectedOptions.value.filter((s) => s.value !== site.value)
  }
  hasDeletedSite.value = true
}

const onKeydownDeleteSiteInput = () => {
  if (inputFilter.value.length === 0 && selectedOptions.value.length > 0) {
    unselectSite(selectedOptions.value[selectedOptions.value.length - 1])
  }
}

const selectedQuerySites = computed(() => {
  const listSite = selectedOptions.value.map(a => a.value)
  return isAllSiteOptionSelected.value ? null : listSite.join(',')
})

watch(selectedQuerySites, () => {
  emit('emitSelectSites', selectedQuerySites.value)
})

</script>
