<template>
  <el-select
    v-model="selectedOptions"
    name="input-site"
    value-key="value"
    multiple
    filterable
    clearable
    placeholder="Search or select sites"
    no-data-text="No matching sites"
    class="site-picker w-full"
    size="large"
    :filter-method="onFilter"
    @change="onSelectSites"
    @visible-change="onVisibleChange"
  >
    <el-option-group
      v-for="group in groupOptions"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="item in group.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-option-group>
  </el-select>
</template>

<script setup lang="ts">

import { computed, ref, watch } from 'vue'

import { useStore } from '~/store'

const ALL_SITES_OPTIONS = 'All sites in the project'

const emit = defineEmits<{(e: 'emitSelectSite', value: string): void}>()
const store = useStore()
const projectSiteOptions = computed(() => store.projectFilters?.locationSites ?? [])
const inputFilter = ref('')

watch(projectSiteOptions, async () => {
  const onlySelectedAllOption = selectedOptions.value.length === 1 && isAllSiteOptionSelected.value
  if (!onlySelectedAllOption) {
    selectedOptions.value = [] // clear value when the user change to other project
  }
})

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
    options: [{
      value: ALL_SITES_OPTIONS,
      label: ALL_SITES_OPTIONS
    }]
  }
  const optionFilter = {
    value: 'Filter sites',
    label: 'Filter sites',
    options: siteOptions.value
  }
  return ((siteOptions.value?.length ?? 0) > 0) ? [optionAll, optionFilter] : []
})

// selected values
const selectedOptions = ref<string[]>([])
const isAllSiteOptionSelected = computed(() => selectedOptions.value.includes(ALL_SITES_OPTIONS))

// emit data to the parent component
const selectedQuerySites = computed(() => {
  return isAllSiteOptionSelected.value ? '' : selectedOptions.value.join(',')
})
watch(selectedQuerySites, () => {
  emit('emitSelectSite', selectedQuerySites.value)
})

const onFilter = (query: string) => {
  inputFilter.value = query
}

const onSelectSites = (selectedOpts: string[]) => {
  if (selectedOpts.length <= 1) return
  const newlyAddedItem = selectedOpts.slice(-1)[0]
  if (newlyAddedItem === ALL_SITES_OPTIONS && selectedOpts.length > 1) {
    // clear other selected sites, when all site option is selected
    selectedOptions.value = [newlyAddedItem]
  } else if (isAllSiteOptionSelected.value && newlyAddedItem !== ALL_SITES_OPTIONS) {
    // remove all sites from the selected options when the user choose other sites
    selectedOptions.value = selectedOpts.filter(o => o !== ALL_SITES_OPTIONS)
  }
  // TODO: remove matched selected options, when wildcard option is added
}

const onVisibleChange = (isVisible: boolean) => {
  if (!isVisible) inputFilter.value = ''
}

</script>

<style lang="scss">
.site-picker {
  .select-trigger {
    background-color: #141525;
    border-radius: 0.25rem;

    & .el-input * > .el-icon.el-select__caret {
      display: flex;
    }
  }

  * > input {
    background-color: transparent;
    border-radius: 0.25rem;
  }

  & * > .el-select__input {
    margin: 0 0 0 2px;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
