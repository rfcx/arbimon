<template>
  <div class="relative w-full my-6 px-4">
    <form class="flex flex-col gap-4">
      <div>
        <input
          type="radio"
          class="rounded bg-util-gray-04 text-frequency focus:ring-frequency"
          :checked="selectedSiteGroups.length === 0"
          @click="onSelectAllSites"
        >
        <span class="text-insight ml-2">All sites in the project</span>
      </div>
      <div
        id="siteResultDropdownTrigger"
        class="flex relative items-center"
        data-dropdown-toggle="siteResultDropdown"
      >
        <input
          v-model="keyword"
          class="block bg-moss border-util-gray-03 text-sm rounded-md w-full placeholder:text-insight focus:(border-frequency ring-frequency)"
          type="text"
          placeholder="Type to filter sites"
          @focus="hasFocusInput = true"
          @blur="hasFocusInput = false"
        >
        <span class="absolute right-4 cursor-pointer pointer-events-none">
          <icon-fa-chevron-down
            class="w-3 h-3 fa-chevron-down text-util-gray-03"
            :class="hasFocusInput ? 'transform rotate-180' : ''"
          />
        </span>
      </div>
    </form>
    <div
      id="siteResultDropdown"
      class="absolute hidden w-5/6 left-4 z-60 bg-white rounded-md shadow dark:bg-moss mt-2 border-util-gray-03 border-1"
    >
      <ul class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md">
        <template v-if="filteredSites.length === 0">
          <li
            v-if="filteredSites.length === 0"
            class="rounded-lg p-4 text-center text-sm"
          >
            No matching sites
          </li>
        </template>
        <template v-else>
          <li
            v-if="filteredSiteGroupWithKeyword"
            class="cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-sm"
            @click="onSelectedSiteGroup(filteredSiteGroupWithKeyword)"
          >
            All sites start with {{ keyword }}
          </li>
          <li
            v-for="site in filteredSites"
            :key="'site-selector-' + site.id"
            :label="site.name"
            class="cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-sm"
            @click="onSelectedSite(site)"
          >
            {{ site.name }}
          </li>
        </template>
      </ul>
    </div>
    <div class="mt-4">
      <filter-tag
        v-for="sg in selectedSiteGroups"
        :key="sg.label"
        :text="sg.label"
        @emit-delete="onRemoveSiteGroup"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

import { type Site } from '@rfcx-bio/common/dao/types'

import { type SiteGroup } from '~/filters'
import { useStore } from '~/store'
import FilterTag from './components/filter-tag.vue'

const store = useStore()

const props = defineProps<{
  initialSiteGroups: SiteGroup[]
}>()
const emit = defineEmits<{(event: 'emitSelectedSites', sites: SiteGroup[]): void}>()

const selectedSiteGroups = ref<SiteGroup[]>(props.initialSiteGroups)

// search
const keyword = ref('')

const hasFocusInput = ref(false)

onMounted(() => {
  initDropdowns()
})

// keyword
const filteredSites = computed((): Site[] => {
  const prefix = keyword.value.toLocaleLowerCase()
  return (store.projectFilters?.locationSites ?? []).filter(site => site.name.toLocaleLowerCase().startsWith(prefix))
})

const filteredSiteGroupWithKeyword = computed((): SiteGroup | undefined => {
  if (!(keyword.value && filteredSites.value.length > 0)) return undefined
  return { label: `${keyword.value}*`, value: filteredSites.value }
})

const onSelectedSite = (site: Site) => {
  const sg = { label: site.name, value: [site] }
  onSelectedSiteGroup(sg)
}

const onSelectedSiteGroup = (siteGroup: SiteGroup) => {
  if (selectedSiteGroups.value.find(sg => sg.label === siteGroup.label)) return
  selectedSiteGroups.value.push(siteGroup)
  emit('emitSelectedSites', selectedSiteGroups.value)
}

const onSelectAllSites = () => {
  selectedSiteGroups.value = []
  emit('emitSelectedSites', selectedSiteGroups.value)
}

const onRemoveSiteGroup = (text: string) => {
  selectedSiteGroups.value = selectedSiteGroups.value.filter(sg => sg.label !== text)
  emit('emitSelectedSites', selectedSiteGroups.value)
}

</script>
