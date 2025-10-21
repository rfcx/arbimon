<template>
  <section class="py-20 bg-white dark:bg-pitch pl-18 site-page">
    <div class="flex items-center px-8 bg-white dark:bg-pitch">
      <h1 class="ml-1 text-gray-900 dark:text-insight">
        Species
      </h1>
      <button
        class="btn btn-primary btn-medium ml-2 btn-small text-[14px] h-[34px] items-center inline-flex px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsDataEntryMember"
        data-tooltip-style="light"
        data-tooltip-target="newSpeciesTooltip"
        @click="clickCreateSpecies()"
      >
        <span>New species</span>
        <icon-custom-ic-plus-icon class="ml-2 w-4 h-4" />
      </button>
      <div
        id="newSpeciesTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ store.userIsDataEntryMember ? 'Add a new species + call type' : 'You do not have permission to add species' }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <button
        class="btn btn-primary btn-medium ml-2 btn-small items-center inline-flex text-[14px] h-[34px] px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsDataEntryMember"
        data-tooltip-style="light"
        data-tooltip-target="importSpeciesTooltip"
        @click="bulkImport()"
      >
        <span>Bulk import species</span>
        <icon-custom-cloud-upload-dark class="ml-2 w-4 h-4" />
      </button>
    </div>
    <div
      id="importSpeciesTooltip"
      role="tooltip"
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
    >
      {{ store.userIsDataEntryMember ? 'Import species' : 'You do not have permission to add species' }}
      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
    <div class="flex mt-5 px-8">
      <button
        class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex text-[14px] h-[34px] px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsDataEntryMember"
        data-tooltip-style="light"
        data-tooltip-target="exportSpecieTooltip"
        @click="exportSpecies()"
      >
        <span>Export species list</span>
      </button>
      <div
        id="exportSpecieTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ store.userIsDataEntryMember ? 'Export species list' : 'You do not have permission to export species' }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <button
        class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex text-[14px] h-[34px] px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsExpertMember || selectedRows.length === 0"
        data-tooltip-style="light"
        data-tooltip-target="deleteSpeciesTooltip"
        @click="deleteSpecies()"
      >
        <span>Delete species</span>
      </button>
      <div
        id="deleteSpeciesTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ store.userIsExpertMember ? 'Select species sound' : 'You do not have permission to remove species' }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
    <div class="flex mt-5 px-9">
      <div class="input-item search form-element">
        <icon-fa-search class="h-3 w-3 mt-3 fa-search text-insight" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Search species by scientific name or family"
          class="form-control placeholder-style rounded px-3 py-2 h-[34px] w-[470px] items-center inline-flex rounded border-1 border-util-gray-03 bg-echo"
          @input="onSearchInput"
        >
      </div>
    </div>
    <div class="flex mt-5 px-9">
      <span
        v-if="!isLoadingSpecies && !isRefetchSpecies && !isLoadingProjectTemplates && !isLoadingPublicTemplates && speciesCount !== 0"
        class="ml-1 font-bold text-left text-sm reclist-total text-white"
      >
        {{ speciesCountText }} species
      </span>
    </div>
    <div
      v-show="!isLoadingSpecies && !isRefetchSpecies && !isLoadingProjectTemplates && !isLoadingPublicTemplates"
      class="flex mt-3 px-9"
    >
      <SortableTable
        class="mt-5"
        :columns="columns"
        :rows="mergedSpecies ?? []"
        :selected-row="selectedSpecies"
        :selected-items="selectedRows"
        :project-slug="selectedProjectSlug"
        :project-templates="speciesProjectTemplates"
        :default-sort-order="'desc'"
        :show-checkbox="true"
        :template-added-id="templateAddedId"
        :adding-template-id="addingTemplateId"
        @on-add-templates="onAddTemplates"
        @selected-rows="onSelectedSpecies"
        @on-play-sound-error="onPlaySoundError"
      />
    </div>
    <div
      v-if="!isLoadingSpecies && (speciesCount === 0 || isErrorSpecies) && !isRefetchSpecies"
      class="font-display text-cloud text-[26px] text-center mt-20"
    >
      <span
        v-if="initialSpeciesCount !== 0"
        class="font-display"
      >
        No species found. Please try again.
      </span>
      <span
        v-else
        class="font-display"
      >
        This project does not have any species assigned
      </span>
    </div>
    <div class="flex mt-3">
      <PaginationComponent
        v-show="!isLoadingSpecies && !(speciesCount === 0) && !isErrorSpecies && !isRefetchSpecies && !isLoadingProjectTemplates && !isLoadingPublicTemplates && (initialSpeciesCount ?? 0) > LIMIT"
        class="mt-4 px-8"
        :current-page="currentPage"
        :total-pages="totalPages"
        :hide-jump-page="true"
        @update:current-page="handlePageChange"
      />
    </div>
    <icon-custom-ic-loading
      v-if="isLoadingSpecies || isRefetchSpecies"
      class="animate-spin text-2xl mt-[100px]"
    />
    <CreateSpecies
      ref="createSpecies"
      @species-select="speciesSelect"
    />
    <alert-dialog
      v-if="showAlert"
      :severity="success"
      :title="title"
      :message="message"
    />
    <CustomPopup
      :visible="showPopup"
      :is-for-delete-popup="true"
      :list="selectedDeleteSpecies"
      title="Delete species"
      message="Are you sure you would like to remove the following species call from this project?"
      note="Note: validations for this species call will also be removed from this project."
      btn-ok-text="Delete"
      btn-cancel-text="Cancel"
      max-width="max-w-xl"
      @ok="handleOk"
      @cancel="handleCancel"
    />
    <ImportSpecies
      v-model="isOpen"
      @imported="onImported"
      @close="isOpen = false"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initTooltips } from 'flowbite'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { type ProjectTemplatesResponse, type PublicTemplateResponse, type PublicTemplatesParams, type SpeciesClassesParams, type SpeciesSongtypeRequest, type SpeciesType, type TemplateRequest, apiLegacyAddSpecies, apiLegacyAddTemplates, apiLegacyDeleteSpecies } from '@rfcx-bio/common/api-arbimon/audiodata/species'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetProjectTemplates, useGetPublicTemplates, useGetSpecies } from './api/use-species'
import CreateSpecies from './component/create-species.vue'
import CustomPopup from './component/custom-popup.vue'
import ImportSpecies from './component/import-species.vue'
import PaginationComponent from './component/pagination-component.vue'
import SortableTable from './component/sortable-table.vue'
import { type Row } from './component/sortable-table.vue'

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const createSpecies = ref<InstanceType<typeof CreateSpecies> | null>(null)

const searchKeyword = ref('')
const searchTimeout = ref<number | undefined>(undefined)

const LIMIT = 10
const currentPage = ref(1)

const offset = computed(() => (currentPage.value - 1) * LIMIT)
const speciesParams = computed<SpeciesClassesParams>(() => ({
    limit: LIMIT,
    offset: offset.value,
    q: searchKeyword.value
}))

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const publicTemplatesParams = computed<PublicTemplatesParams | undefined>(() => {
  const ids = speciesData.value?.list?.map(s => s.id).filter(Boolean) ?? []
  return ids.length ? { classIds: ids } : undefined
})

const initialSpeciesCount = ref<number | null>(null)
const initializedSpeciesCount = ref(false)

const { data: speciesData, isLoading: isLoadingSpecies, isError: isErrorSpecies, isRefetching: isRefetchSpecies, refetch: refetchSpecies } = useGetSpecies(apiClientArbimon, selectedProjectSlug, speciesParams)
const { data: speciesProjectTemplates, isLoading: isLoadingProjectTemplates, refetch: refetchProjectTemplates } = useGetProjectTemplates(apiClientArbimon, selectedProjectSlug)
const { data: speciesPublicTemplates, isLoading: isLoadingPublicTemplates, refetch: refetchPublicTemplates } = useGetPublicTemplates(apiClientArbimon, selectedProjectSlug, publicTemplatesParams)

watch(
  () => speciesData.value?.count,
  (count) => {
    if (!initializedSpeciesCount.value && typeof count === 'number') {
      initialSpeciesCount.value = count
      initializedSpeciesCount.value = count !== 0
    }
  },
  { immediate: true }
)

const columns = [
  { label: 'Species', key: 'species_name', maxWidth: 90 },
  { label: 'Taxon', key: 'taxon', maxWidth: 70 },
  { label: 'Sound', key: 'songtype_name', maxWidth: 70 },
  { label: 'Project Templates', key: 'project_templates', maxWidth: 150 },
  { label: 'Public Templates', key: 'public_templates', maxWidth: 150 }
]

const selectedRows = ref<Row[]>([])

const speciesCount = computed(() => { return speciesData.value?.count ?? 0 })
const speciesCountText = computed<string>(() =>
  new Intl.NumberFormat('en-US').format(speciesCount.value)
)
const totalPages = computed(() => Math.ceil(speciesCount.value / LIMIT))

const handlePageChange = async (page: number) => {
  if (currentPage.value === page) return
  currentPage.value = page
  await refetchSpecies()
}

const selectedSpecies = ref<SpeciesType | undefined>(undefined)
const showPopup = ref(false)
const selectedDeleteSpecies = ref<string[]>([])

const speciesSafe = computed<SpeciesType[]>(() => speciesData.value?.list ?? [])
const projSafe = computed<ProjectTemplatesResponse[]>(() => speciesProjectTemplates.value ?? [])
const pubSafe = computed<PublicTemplateResponse[]>(() => speciesPublicTemplates.value ?? [])
type SpeciesSongtypeKey = `${number}|${number}`

const makeKey = (species: number, songtype: number): SpeciesSongtypeKey => `${species}|${songtype}` as `${number}|${number}`

function groupBy<T, K extends PropertyKey> (arr: readonly T[], key: (x: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>()
  for (const it of arr) {
    const k = key(it)
    const b = m.get(k)
    b ? b.push(it) : m.set(k, [it])
  }
  return m
}

function sortByDateCreatedDesc<T extends { date_created: string }> (arr: T[]): T[] {
  return arr.sort(
    (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  )
}

const mergedSpecies = computed(() => {
  const projMap = groupBy<ProjectTemplatesResponse, SpeciesSongtypeKey>(projSafe.value, t => makeKey(t.species, t.songtype))
  const pubMap = groupBy<PublicTemplateResponse, SpeciesSongtypeKey>(pubSafe.value, t => makeKey(t.species, t.songtype))

  return speciesSafe.value.map(s => {
    const key = makeKey(s.species, s.songtype)

    return {
      ...s,
      project_templates: sortByDateCreatedDesc(projMap.get(key) ?? []),
      public_templates: sortByDateCreatedDesc(pubMap.get(key) ?? [])
    }
  })
})

onMounted(() => {
  initTooltips()
})

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  currentPage.value = 1
  searchTimeout.value = window.setTimeout(() => {
    refetchSpecies()
  }, 300)
}

const speciesSelect = async (request: SpeciesSongtypeRequest) => {
  try {
    const addSpecies = await apiLegacyAddSpecies(apiClientArbimon, selectedProjectSlug.value ?? '', request)
    if (addSpecies.success) {
      showAlertDialog('success', '', `${request.species} ${request.songtype} added to project`)
      currentPage.value = 1
      await refetchSpecies()
      await nextTick()
      refetchProjectTemplates()
      refetchPublicTemplates()
      selectedRows.value = []
    } else {
      showAlertDialog('error', 'Error', `Add ${request.species} ${request.songtype} to project`)
    }
  } catch (e) {
    showAlertDialog('error', 'Error', `Add ${request.species} ${request.songtype} to project`)
  }
}

const clickCreateSpecies = () => {
  createSpecies.value?.open()
}

const isOpen = ref(false)
const onImported = async (success: boolean) => {
  if (success) {
    selectedRows.value = []
    currentPage.value = 1
    await refetchSpecies()
    await nextTick()
    refetchProjectTemplates()
    refetchPublicTemplates()
  }
}

const bulkImport = () => {
  isOpen.value = true
}

const templateAddedId = computed(() => templateId.value)
const templateId = ref<number | undefined>(undefined)

const addingTemplateId = ref<number | null>(null)

const onAddTemplates = async (request: TemplateRequest, tplId?: number) => {
  addingTemplateId.value = tplId ?? null
  try {
    const templateResponse = await apiLegacyAddTemplates(apiClientArbimon, selectedProjectSlug.value ?? '', request)
    if (templateResponse.id === 0) {
      showAlertDialog('error', 'Error', 'The template already exists in the project templates.')
    } else {
      showAlertDialog('success', 'Success', 'Add Templates')
      currentPage.value = 1
      await refetchSpecies()
      await nextTick()
      refetchProjectTemplates()
      refetchPublicTemplates()
      templateId.value = templateResponse.id
    }
  } catch (e) {
    showAlertDialog('error', 'Error', 'Add Templates')
  } finally {
    addingTemplateId.value = null
   }
}

const exportSpecies = () => {
  const url = `${window.location.origin}/legacy-api/project/${selectedProjectSlug.value}/species-export.csv`
  window.location.assign(url)
}

const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)

const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

const onSelectedSpecies = (rows?: Row[]) => {
  if (!rows) return
  selectedRows.value = rows === undefined ? [] : rows
}

const onPlaySoundError = () => {
  showAlertDialog('error', '', 'Failed to load audio')
}

onBeforeUnmount(() => {
  if (searchTimeout.value !== undefined) {
    window.clearTimeout(searchTimeout.value)
  }
})

watch(
  selectedRows,
  (rows) => {
    if (rows.length === 0) {
      selectedDeleteSpecies.value = []
      return
    }

    selectedDeleteSpecies.value = rows.map(
      (r) => `"${r.species_name} | ${r.songtype_name}"`
    )
  },
  { immediate: true, deep: true }
)

const deleteSpecies = () => {
  showPopup.value = true
}

async function handleOk () {
  showPopup.value = false
  try {
    await apiLegacyDeleteSpecies(apiClientArbimon, selectedProjectSlug.value ?? '', { project_classes: selectedRows.value.map(r => r.id) })
    selectedRows.value = []
    initializedSpeciesCount.value = false
    refetchSpecies()
    showAlertDialog('success', 'Success', 'Removed')
  } catch (e) {
    showAlertDialog('error', 'Error', 'Remove species')
  }
}

const handleCancel = () => {
  showPopup.value = false
}
</script>

<style lang="scss">
.input-item {
  [type='text']:focus {
    border-color: #ADFF2C;
    --tw-ring-color: transparent;
  }
}
</style>
