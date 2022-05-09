<template>
  <div class="w-full px-4 pt-3">
    <input
      type="text"
      placeholder="Search"
      class="rounded-lg w-full bg-gray-200 focus:outline-none focus:bg-white focus:border-brand-primary hidden"
    >
  </div>
  <div class="max-h-md">
    <label
      class="select-all-items pl-4 pb-2 align-middle list-item list-none"
    >
      <input
        type="radio"
        class="rounded"
        :checked="isSelectedAllSites"
        @click="selectAllSites()"
      >
      <span class="text-white ml-2">All sites in the project</span>
    </label>

    <el-select
      v-model="selectedSiteGroups"
      value-key="label"
      multiple
      filterable
      popper-class="selector-sites"
      name="input-site"
      fit-input-width
      reserve-keyword
      placeholder="Type to filter sites"
      no-data-text="No matching sites"
      class="search-select ml-4 mt-2"
      :filter-method="onFilterType"
      @blur="onSelectorBlur"
      @input="onSelectorFocus"
      @focus="onSelectorFocus"
    >
      <el-option
        v-if="optionAllMatchingFilter"
        :key="'site-match-' + optionAllMatchingFilter.label"
        :label="'All sites starting with ' + inputFilter.toLocaleUpperCase()"
        :value="optionAllMatchingFilter"
        value-key="sites"
      />
      <el-option
        v-for="item in filtered"
        :key="'site-list-' + item.id"
        :label="item.name"
        :value="{ label: item.name, value: [item] }"
      />
    </el-select>
    <div class="ml-2 mt-3">
      <el-tag
        v-for="site in selectedSiteGroups"
        :key="'site-tag-'+ site.label"
        class="ml-2 mb-2 select-none"
        closable
        type="info"
        effect="dark"
        @close="onRemoveSiteTags(site)"
      >
        {{ site.label }}
      </el-tag>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineEmits, defineProps, onMounted, ref, watch, withDefaults } from 'vue'

import { DetectionFilterSiteGroup } from '~/filters/types'
import { useStore } from '~/store'

const store = useStore()
const props = withDefaults(
  defineProps<{ initialSiteGroups: DetectionFilterSiteGroup[] }>(),
  { initialSiteGroups: () => [] }
)
const inputFilter = ref('')
const selectedSiteGroups = ref<DetectionFilterSiteGroup[]>([])

const emit = defineEmits<{(e: 'emitSelectedSiteGroup', selectedSiteGroups: DetectionFilterSiteGroup[]): void}>()

onMounted(() => {
  if (props.initialSiteGroups.values.length > 0) {
    selectedSiteGroups.value = props.initialSiteGroups
  }
})

watch(() => selectedSiteGroups.value, () => {
  emit('emitSelectedSiteGroup', selectedSiteGroups.value)
})

const isSelectedAllSites = computed(() => {
  return selectedSiteGroups.value.length === 0
})

const filtered = computed(() => {
  if (!store.projectData.value.isData) return []

  const prefix = inputFilter.value.toLocaleLowerCase()
  return store.projectData.value.data.locationSites
    .filter(site => site.name.toLocaleLowerCase().startsWith(prefix))
})

const optionAllMatchingFilter = computed(() => {
  return inputFilter.value && filtered.value.length > 0
      ? {
        label: `${inputFilter.value}*`,
        sites: filtered
      }
      : undefined
})

const onSelectorBlur = () => {
  const inputEl = document.querySelector('[name="input-site"]') as HTMLInputElement
  const searchSelector = document.querySelector('.search-select')
  const getClass = searchSelector?.querySelector('.el-input--suffix')
  const isFocusSiteSelector = getClass?.classList.contains('is-focus') ?? false

  if (isFocusSiteSelector ?? false) {
    inputEl.removeAttribute('placeholder')
    inputEl.setAttribute('placeholder', 'Type to filter sites')
  }
}

const onSelectorFocus = () => {
  const inputEl = document.querySelector('[name="input-site"]') as HTMLInputElement
  inputEl.removeAttribute('placeholder')
}

const onFilterType = (query: string) => {
  inputFilter.value = query
}

const selectAllSites = () => {
  selectedSiteGroups.value = []
}

const onRemoveSiteTags = (item: DetectionFilterSiteGroup) => {
  const index = selectedSiteGroups.value.findIndex(sg => sg.label === item.label)
  selectedSiteGroups.value.splice(index, 1)
}

</script>
<style lang="scss">

</style>
