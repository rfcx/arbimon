<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 isolate flex items-center justify-center ml-120"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6">
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-2xl font-header">
            Create Template
          </h2>
          <button
            type="button"
            title="Cancel"
            @click="$emit('cancel')"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <div>
          <label
            for="templatetName"
            class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
          >Name</label>
          <input
            id="templateName"
            v-model="templateName"
            name="templateName"
            type="text"
            maxlength="80"
            class="placeholder-style placeholder-util-gray-02 w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
            placeholder="Template Name"
            required
          >
        </div>
        <div class="flex flex-col relative">
          <label
            for="speciesSound"
            class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
          >
            Species Sound
          </label>
          <div
            id="templateDropdownTrigger"
            data-dropdown-toggle="templateDropdown"
            class="input-item search relative w-full"
            @focusin="openDropdown"
          >
            <icon-fa-search class="h-3 w-3 mt-3 fa-search placeholder-util-gray-02" />
            <!-- Search class input -->
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="Search for species sounds"
              class="placeholder-style form-control w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency) placeholder-util-gray-02"
              @input="onSearchInput"
            >
            <icon-fa-close
              v-if="searchKeyword.length > 0"
              class="h-3 text-util-gray-03 absolute top-2.5 right-2"
              @click="clearSearchInput()"
            />
          </div>
          <div
            id="templateDropdown"
            class="absolute hidden w-5/6 left-4 z-60 bg-white rounded-md shadow dark:bg-moss mt-2 border-util-gray-03 border-1"
          >
            <!-- Add existing project species sound -->
            <ul class="overflow-y-auto max-h-80 border-cloud bg-pitch rounded-md">
              <li
                v-if="filteredClass.length === 0 && searchKeyword.length > 0 && toggleSpeciesAdd && !toggleSpeciesSelect"
                class="flex flex-col px-4 py-2 gap-y-2 text-sm"
              >
                We cannot find the species "{{ searchKeyword }}" in the project.
                <a
                  class="flex flex-row items-center text-frequency cursor-pointer"
                  @click="addSpecies()"
                >
                  Add species
                  <icon-custom-ic-plus-icon class="text-frequency ml-1 h-4" />
                </a>
              </li>
              <template v-if="filteredClass.length">
                <!-- Filtered class list -->
                <li
                  v-for="cl in filteredClass"
                  :key="'cl-selector-' + cl.id"
                  :label="cl.species_name"
                  class="flex flex-col cursor-pointer px-4 py-2 hover:bg-util-gray-03"
                  @click="onSelectedClass(cl)"
                >
                  <span class="text-sm">{{ cl.species_name }}</span>
                  <span class="text-util-gray-01 text-xs">{{ cl.songtype_name }}</span>
                </li>
              </template>
            </ul>
            <!-- Show new searched project species -->
            <div
              v-if="filteredClass.length === 0 && !toggleSpeciesAdd && toggleSpeciesSelect"
              class="p-2.5 bg-pitch"
            >
              <div class="support">
                Species
              </div>
              <div class="my-2 border-t-1 border-util-gray-02" />
              <ul v-if="speciesData && speciesData.length">
                <li
                  v-for="cl in speciesData"
                  :key="'cl-selector-' + cl.id"
                  :label="cl.scientific_name"
                  class="flex flex-col cursor-pointer px-4 py-2 rounded-md hover:bg-util-gray-03"
                  @click="selectSpecies(cl)"
                >
                  <span class="text-sm">{{ cl.scientific_name }}</span>
                </li>
              </ul>
              <div
                v-if="!speciesData || !speciesData.length"
                class="px-4 py-2"
              >
                No species found.
              </div>
              <div class="my-2 border-t-1 border-util-gray-02" />
              <div class="pl-2 support">
                <div>Don't see the species you are looking for?</div>
                <a
                  href="https://arbimon.org/contact"
                  class="flex flex-row items-center text-frequency"
                >
                  Contact support
                  <icon-fa-external-link
                    class="cursor-pointer text-frequency ml-2"
                  />
                </a>
              </div>
            </div>
            <div
              v-if="filteredClass.length === 0 && !toggleSpeciesAdd && !toggleSpeciesSelect && toggleSongtypeSelect"
              class="p-2.5 bg-pitch"
            >
              <div
                class="flex flex-row items-center cursor-pointer"
                @click="backToSelectSpecies()"
              >
                <icon-fas-chevron-left class="w-3 h-3 mr-2" />
                Species
              </div>
              <div class="my-2 support pl-2">
                Call
              </div>
              <div class="my-2 border-t-1 border-util-gray-02" />
              <ul
                v-if="songtypesSpecies && songtypesSpecies.length"
                class="mb-2 pl-0"
              >
                <li
                  v-for="song in songtypesSpecies"
                  :key="'song-' + song.id"
                  :label="song.name"
                  class="flex flex-col support relative rounded-md cursor-pointer px-4 py-2 hover:bg-util-gray-03"
                  :class="{'bg-util-gray-03': song.name === classToAdd.songtype}"
                  @click="selectSongtype(song.name)"
                >
                  <span class="text-sm">{{ song.name }}</span>
                  <icon-fa-check
                    v-show="song.name === classToAdd.songtype"
                    class="h-3 text-insight absolute top-2.5 right-2"
                  />
                </li>
              </ul>
              <div class="pl-2 flex flex-row justify-end mt-2">
                <div
                  data-tooltip-target="speciesClassSelect"
                  data-tooltip-style="light"
                >
                  <button
                    class="btn btn-small btn-primary rounded-full flex inline-flex align-middle text-sm px-2.5 disabled:(cursor-not-allowed opacity-50)"
                    :disabled="!classToAdd.songtype?.length"
                    @click="addClass()"
                  >
                    Add species
                    <icon-fa-plus
                      class="ml-3 w-3"
                    />
                  </button>
                </div>
                <div
                  id="speciesClassSelect"
                  role="tooltip"
                  class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
                >
                  {{ (classToAdd.songtype === undefined) ? 'Select a species call' : '' }}
                  <div
                    class="tooltip-arrow"
                    data-popper-arrow
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-between items-center gap-x-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 btn btn-primary btn-medium flex flex-row items-center gap-x-2 disabled:(cursor-not-allowed opacity-50)"
            :disabled="selectedClass === undefined"
            @click="createTemplate()"
          >
            Create Template
            <icon-custom-ic-plus-icon class="h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { type AxiosInstance } from 'axios'
import { initDropdowns } from 'flowbite'
import { computed, inject, nextTick, onMounted, ref } from 'vue'

import type { ClassesRecordingResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SpeciesSearchResponse, apiLegacyAddSpecies } from '@rfcx-bio/common/api-arbimon/audiodata/species'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetClasses } from '../../_composables/use-recordings'
import { useSearchSpecies, useSongtypesSpecies } from '../../_composables/use-species'

interface ClassToAdd {
  species: string | undefined
  songtype: string | undefined
}

export interface TemplateData {
  name: string
  species: number
  songtype: number
}

defineProps<{
  visible: boolean
}>()

const emits = defineEmits<{(e: 'cancel'): void, (e: 'emitTemplateData', value: TemplateData): void}>()

const templateName = ref<string>('')
const searchKeyword = ref<string>('')
const searchTimeout = ref<number | undefined>(undefined)
const toggleSpeciesAdd = ref(false)
const toggleSpeciesSelect = ref(false)
const toggleSongtypeSelect = ref(false)
const classToAdd = ref<ClassToAdd>({ species: undefined, songtype: undefined })
const selectedClass = ref<ClassesRecordingResponse>()
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

const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const selectedProjectSlug = computed(() => store.project?.slug)

const { data: projectClasses, refetch: refetchGetClasses } = useGetClasses(apiClientArbimon, selectedProjectSlug)
const { data: speciesData, refetch: refetchSearchSpecies, isLoading: loadingSearchSpecies } = useSearchSpecies(apiClientArbimon, computed(() => searchKeyword.value))
const { data: songtypesSpecies } = useSongtypesSpecies(apiClientArbimon)

const filteredClass = computed((): ClassesRecordingResponse[] => {
  const prefix = searchKeyword.value.toLocaleLowerCase()
  return (projectClasses.value ?? []).filter(cl => cl.species_name.toLocaleLowerCase().startsWith(prefix))
})

const onSearchInput = () => {
  if (filteredClass.value.length === 0) {
    toggleSpeciesAdd.value = true
    toggleSpeciesSelect.value = false
  } else {
    toggleSpeciesAdd.value = false
    toggleSpeciesSelect.value = false
  }
}

const clearSearchInput = () => {
  searchKeyword.value = ''
}

const addSpecies = () => {
  toggleSpeciesAdd.value = false
  toggleSpeciesSelect.value = true
  if (loadingSearchSpecies.value || searchKeyword.value.length < 2) return
  clearTimeout(searchTimeout.value)
  searchTimeout.value = window.setTimeout(async () => {
    await refetchSearchSpecies()
  }, 1000)
}

const selectSpecies = (specie: SpeciesSearchResponse) => {
  classToAdd.value.species = specie.scientific_name
  toggleSpeciesSelect.value = false
  toggleSongtypeSelect.value = true
}

const selectSongtype = (song: string) => {
  classToAdd.value.songtype = song
}

const backToSelectSpecies = () => {
  toggleSpeciesSelect.value = true
  toggleSongtypeSelect.value = false
}

const onSelectedClass = (cl: ClassesRecordingResponse) => {
  searchKeyword.value = cl.species_name
  selectedClass.value = cl
}

const addClass = async () => {
  if (classToAdd.value.species === undefined && classToAdd.value.songtype === undefined) return
  const opts = {
    species: classToAdd.value.species as string,
    songtype: classToAdd.value.songtype as string
  }
  toggleSpeciesSelect.value = false
  try {
    const result = await apiLegacyAddSpecies(apiClientArbimon, selectedProjectSlug.value ?? '', opts)
    if (result.success) {
      toggleSongtypeSelect.value = false
      searchKeyword.value = ''
      showAlertDialog('success', '', `${opts.species} ${opts.songtype} added to project`)
      await nextTick()
      await refetchGetClasses()
      const selectedClass = projectClasses.value?.find(cl => cl.species_name === classToAdd.value.species && cl.songtype_name === classToAdd.value.songtype)
      if (selectedClass) selectClass(selectedClass)
    } else {
      showAlertDialog('success', '', `${opts.species} ${opts.songtype} already in project`)
      const selectedClass = projectClasses.value?.find(cl => cl.species_name === classToAdd.value.species && cl.songtype_name === classToAdd.value.songtype)
      if (selectedClass) selectClass(selectedClass)
    }
  } catch (e) {
    toggleSongtypeSelect.value = false
    searchKeyword.value = ''
    showAlertDialog('error', 'Error', `Add ${opts.species} ${opts.songtype} to project`)
  }
}

const selectClass = (projectClass: ClassesRecordingResponse) => {
  selectedClass.value = projectClass
  toggleSpeciesAdd.value = false
  toggleSpeciesSelect.value = false
  toggleSongtypeSelect.value = false
  searchKeyword.value = projectClass.species_name
  classToAdd.value = { species: undefined, songtype: undefined }
}

const createTemplate = () => {
  if (selectedClass.value === undefined) return
  emits('emitTemplateData', {
    name: templateName.value,
    species: selectedClass.value.species,
    songtype: selectedClass.value.songtype
  })
}

const openDropdown = async () => {
  await nextTick()
  initDropdowns()
}

onMounted(() => {
  initDropdowns()
})

</script>
