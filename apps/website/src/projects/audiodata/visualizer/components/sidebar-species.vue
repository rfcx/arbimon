<template>
  <div
    id="accordion-collapse-species"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow text-sm font-medium"
  >
    <div
      id="accordion-collapse-heading-species"
      class="flex justify-between items-center"
    >
      <button
        type="button"
        class="flex justify-between items-center w-full py-2 gap-x-1 text-insight dark:bg-moss dark:active:bg-moss"
        data-accordion-target="#accordion-collapse-body-species"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-species"
      >
        <div class="flex items-start items-center gap-x-1">
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 text-insight fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 text-insight fa-chevron-up hidden"
          />
          <span class="text-sm font-semibold">Species Presence Validation</span>
        </div>
        <div class="flex flex-row justify-center gap-x-3 mr-2">
          <div class="min-w-10 flex flex-row justify-center cursor-default items-center bg-[#D9D9D9] text-pitch rounded-full text-xs font-semibold px-[7px] py-[1px]">
            <icon-fa-check
              class="h-[10px] text-[#1F57CC]"
            />
            <span>{{ getSpeciesPresentCount(visobject.validations) }}</span>
            <span>/</span>
            <icon-fa-close
              class="h-[10px] text-[#E6B900]"
            />
            <span>{{ getSpeciesAbsentCount(visobject.validations) }}</span>
          </div>
        </div>
      </button>
      <div
        class="cursor-pointer"
        @click="toggleSpeciesVisible()"
      >
        <icon-fa-eye
          v-if="toggleVisible"
          class="h-4 w-4"
        />
        <icon-fa-eye-slash
          v-else
          class="h-4 w-4 text-util-gray-02"
        />
      </div>
    </div>
    <div
      id="accordion-collapse-body-species"
      class="hidden flex flex-col gap-y-2"
      aria-labelledby="accordion-collapse-heading-species"
    >
      <div class="flex flex-row items-center">
        <div
          data-dropdown-toggle="speciesSearchDropdown"
          class="input-item search relative w-full"
        >
          <icon-fa-search class="h-3 w-3 mt-3 fa-search placeholder-util-gray-02" />
          <!-- Search class input -->
          <input
            ref="speciesSearchInput"
            v-model="searchKeyword"
            type="text"
            placeholder="Search for species sounds"
            class="form-control rounded-md placeholder-style h-[34px] w-full items-center inline-flex border-1 border-util-gray-02 bg-echo flex-1 min-w-0 placeholder-util-gray-02 focus:border-frequency"
            @input="onSearchInput"
          >
          <icon-fa-close
            v-if="searchKeyword.length > 0"
            class="h-3 text-insight absolute top-2.5 right-2 cursor-pointer"
            @click="clearSearchInput()"
          />
        </div>
        <div
          id="speciesSearchDropdown"
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
      <!-- Accordion by taxon -->
      <div
        v-for="(taxon, index) in taxons"
        :id="'accordion-collapse-taxon-' + taxon"
        :key="taxon"
        data-accordion="collapse"
        class="flex flex-col gap-y-2 pl-2 py-1 bg-moss shadow"
      >
        <!-- Taxon row -->
        <button
          :id="'accordion-collapse-button-' + index"
          type="button"
          class="flex justify-between items-center py-0 gap-x-1 text-insight"
          :data-accordion-target="'#accordion-collapse-body-' + index"
          aria-expanded="false"
          :aria-controls="'accordion-collapse-body-' + index"
          @click="toggleAccordion(taxon)"
        >
          <div class="flex items-start items-center gap-x-1">
            <icon-fa-chevron-right
              data-accordion-icon
              class="w-3 h-3 text-insight fa-chevron-right"
            />
            <icon-fa-chevron-down
              data-accordion-icon
              class="w-3 h-3 text-insight fa-chevron-up hidden"
            />
            <span>{{ taxon }}</span>
          </div>
        </button>
        <!-- Taxon classes -->
        <div
          :id="'accordion-collapse-body-' + index"
          class="w-full flex flex-col gap-y-2"
          :class="{ 'hidden': byTaxonOpen[taxon] === false }"
          :aria-labelledby="'accordion-collapse-button-' + index"
        >
          <div class="flex flex-row items-center justify-between">
            <div class="text-sm font-semibold w-[77%]">
              Species validations
            </div>
            <button
              :id="`validationAllDropdownBtn-${taxon}`"
              :data-dropdown-toggle="`validationAllDropdownToggle-${taxon}`"
              data-dropdown-placement="bottom"
              class="w-[23%] flex flex-row justify-center items-center bg-util-gray-04 p-0 rounded-sm w-full hover:bg-[#0a0a0a]"
              :disabled="!store.userIsFullProjectMember"
            >
              {{ "---" }}
              <icon-fa-chevron-down class="text-xxs mb-1" />
            </button>
            <div
              :id="`validationAllDropdownToggle-${taxon}`"
              class="z-10 hidden rounded-lg bg-moss flex flex-col gap-y-3"
            >
              <ul
                :aria-labelledby="`validationAllDropdownBtn-${taxon}`"
                class="flex flex-col gap-y-1 rounded-md shadow bg-moss dark:bg-moss border-util-gray-03 border-1 px-4 py-3 w-70 text-sm"
              >
                <li
                  v-for="opt in valAllOptions"
                  :key="opt.val"
                >
                  <a
                    class="flex flex-row justify-start items-center cursor-pointer gap-x-3"
                    @click="validateAll(opt.val, taxon)"
                  >
                    <icon-fas-minus
                      v-if="opt.val === 2"
                      class="h-3 text-util-gray-03"
                    />
                    <icon-fa-close
                      v-if="opt.val === 0"
                      class="h-3 text-[#E6B900]"
                    />
                    {{ opt.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <ul class="flex flex-row bg-moss">
            <li
              v-for="header in speciesHeader"
              :key="'header-' + header"
              :label="header"
              class="text-sm font-semibold"
              :class="header === 'Annotation' ? 'w-[30%]' : 'w-[40%]'"
            >
              <span>{{ header }}</span>
            </li>
          </ul>
          <!-- Classes -->
          <ul class="overflow-y-auto border-cloud bg-moss rounded-md">
            <li
              v-for="cl in byTaxon[taxon]"
              :id="`speciesClass-${cl.id}`"
              :key="`cl-${cl.id}`"
              :label="cl.species_name"
              class="flex flex-row items-center py-2 text-xs border-t-[0.5px] border-util-gray-03 hover:bg-util-gray-02"
              :class="isSelected[cl.id] ? 'bg-util-gray-03' : ''"
              @click="addSelectedClass(cl)"
            >
              <span
                class="w-[40%] text-wrap ml-1"
                :title="cl.species_name"
              >
                {{ cl.species_name }}
              </span>
              <span class="w-[40%] text-wrap">{{ cl.songtype_name }}</span>
              <div class="w-[23%] flex flex-row justify-center items-center relative">
                <div
                  v-if="valState(cl)?.showValidateOptions"
                  class="flex flex-row justify-center items-center mr-2 hover:bg-[#0a0a0a]"
                >
                  <icon-fas-minus
                    v-if="valState(cl)?.val === 2"
                    class="h-3 text-util-gray-03"
                  />
                  <icon-fa-check
                    v-if="valState(cl)?.val === 1"
                    class="h-3 text-[#1F57CC]"
                  />
                  <icon-fa-close
                    v-if="valState(cl)?.val === 0"
                    class="h-3 text-[#E6B900]"
                  />
                  <span class="ml-1 font-semibold">{{ valState(cl)?.label }}</span>
                </div>
                <button
                  v-else
                  :id="`validationDropdownBtn-${cl.id}`"
                  :data-dropdown-toggle="`validationDropdownToggle-${cl.id}`"
                  class="flex flex-row justify-center items-center bg-util-gray-04 p-1 rounded-sm w-full mr-2 hover:bg-[#0a0a0a]"
                  :disabled="!store.userIsFullProjectMember"
                >
                  <icon-fas-minus
                    v-if="valState(cl)?.val === 2"
                    class="h-3 text-util-gray-03"
                  />
                  <icon-fa-check
                    v-if="valState(cl)?.val === 1"
                    class="h-3 text-[#1F57CC]"
                  />
                  <icon-fa-close
                    v-if="valState(cl)?.val === 0"
                    class="h-3 text-[#E6B900]"
                  />
                  <span class="mx-1 font-semibold">{{ valState(cl)?.label || "---" }}</span>
                  <icon-fa-chevron-down
                    v-show="!valState(cl)?.label"
                    class="text-xxs mb-1"
                  />
                </button>
              </div>
              <div
                :id="`validationDropdownToggle-${cl.id}`"
                class="z-10 hidden rounded-lg bg-moss flex flex-col gap-y-3"
              >
                <!-- Validate menu -->
                <ul
                  :aria-labelledby="`validationDropdownBtn-${cl.id}`"
                  class="flex flex-col gap-y-1 rounded-md shadow dark:bg-moss border-util-gray-03 border-1 px-4 py-3 w-30 text-sm"
                >
                  <li
                    v-for="opt in valOptions"
                    :key="opt.val"
                  >
                    <a
                      class="flex flex-row justify-start items-center cursor-pointer"
                      @click="validate(opt.val, cl.id)"
                    >
                      <icon-fas-minus
                        v-if="opt.val === 2"
                        class="h-3 text-util-gray-03"
                      />
                      <icon-fa-check
                        v-if="opt.val === 1"
                        class="h-3 text-[#1F57CC]"
                      />
                      <icon-fa-close
                        v-if="opt.val === 0"
                        class="h-3 text-[#E6B900]"
                      />
                      {{ opt.label }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <alert-dialog
    v-if="showAlert && success == 'success'"
    severity="success"
    :title="title"
    :message="message"
  />
  <alert-dialog
    v-else-if="showAlert && success == 'error'"
    severity="error"
    :title="title"
    :message="message"
  />
</template>

<script setup lang="ts">

import { type AxiosInstance } from 'axios'
import { Dropdown, initAccordions, initDropdowns, initTooltips } from 'flowbite'
import { orderBy } from 'lodash-es'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'

import type { ClassesRecordingResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SpeciesSearchResponse, apiLegacyAddSpecies } from '@rfcx-bio/common/api-arbimon/audiodata/species'
import type { RecordingValidateParams, RecordingValidateResponse, Validation, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { type AlertDialogType } from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetClasses } from '../../_composables/use-recordings'
import { useSearchSpecies, useSongtypesSpecies } from '../../_composables/use-species'
import { useRecordingValidate } from '../../_composables/use-visualizer'

interface ClassToAdd {
  species: string | undefined
  songtype: string | undefined
}

const props = defineProps<{
  visobject: Visobject
}>()

const emits = defineEmits<{(e: 'emitSpeciesVisibility', value: boolean): void, (e: 'updateValidations'): void}>()

const speciesHeader = ['Species', 'Sound', 'Annotation']
const validations = ref<Record<string, number[]>>({})
const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const selectedProjectSlug = computed(() => store.project?.slug)

const searchKeyword = ref('')
const valOptions = [
  { label: 'Clear', val: 2, showValidateOptions: false },
  { label: 'Present', val: 1, showValidateOptions: false },
  { label: 'Absent', val: 0, showValidateOptions: false }
]

const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)
const searchTimeout = ref<number | undefined>(undefined)
const toggleSpeciesAdd = ref(false)
const toggleSpeciesSelect = ref(false)
const toggleSongtypeSelect = ref(false)
const classToAdd = ref<ClassToAdd>({ species: undefined, songtype: undefined })
const toggleVisible = ref<boolean>(true)

const { data: projectClasses, refetch: refetchGetClasses } = useGetClasses(apiClientArbimon, selectedProjectSlug)
const { mutate: mutateRecordingValidate } = useRecordingValidate(apiClientArbimon, selectedProjectSlug, props.visobject.id)
const { data: speciesData, refetch: refetchSearchSpecies, isLoading: loadingSearchSpecies } = useSearchSpecies(apiClientArbimon, computed(() => searchKeyword.value))
const { data: songtypesSpecies } = useSongtypesSpecies(apiClientArbimon)

const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

const valAllOptions = [
  { label: 'Clear all Absent', val: 2 },
  { label: "Mark unvalidated as 'Absent'", val: 0 }
]

const byTaxonOpen = ref<Record<string, boolean>>({})

const isSelected = ref<Record<number, boolean>>({})

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

const filteredClass = computed((): ClassesRecordingResponse[] => {
  const prefix = searchKeyword.value.toLocaleLowerCase()
  return (projectClasses.value ?? []).filter(cl => cl.species_name.toLocaleLowerCase().startsWith(prefix))
})

const byTaxon = computed((): Record<string, ClassesRecordingResponse[]> => {
  if (projectClasses.value === undefined) return {}
  const grouped: Record<string, ClassesRecordingResponse[]> = {}
  for (const c of projectClasses.value) {
    if (grouped[c.taxon] === undefined) {
      grouped[c.taxon] = []
    }
    grouped[c.taxon].push(c)
  }
  for (const t in grouped) {
    grouped[t] = orderBy(grouped[t], ['species_name', 'songtype_name'])
  }
  return grouped
})

const taxons = computed((): string[] => {
  const taxons = Object.keys(byTaxon.value).sort()
  taxons.forEach((taxon: string) => {
    byTaxonOpen.value[taxon] = false
  })
  return taxons
})

const onSelectedClass = (cl: ClassesRecordingResponse) => {
  searchKeyword.value = cl.species_name
  scrollToClass(cl.species_name, cl.songtype_name)
}

const toggleAccordion = (taxon: string) => {
  byTaxonOpen.value[taxon] = true
}

const scrollToClass = (species: string, songtype: string) => {
  if (projectClasses.value === undefined) return
  const taxon = projectClasses.value.find(cl => cl.species_name === species && cl.songtype_name === songtype)
  if (taxon) {
    byTaxonOpen.value[taxon.taxon] = true
    isSelected.value = {}
    isSelected.value[taxon.id] = true
    scrollTo(taxon.id)
  }
}

const scrollTo = (id: number) => {
  setTimeout(() => {
    const bookmark = 'speciesClass-' + id
    scrollToBookmark(bookmark)
  }, 1000)
}

const scrollToBookmark = (bookmark: string) => {
  const element = document.getElementById(bookmark)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const getSpeciesPresentCount = (validations: Validation[]): number => {
  if (!validations.length) return 0
  let count = 0
  for (const validation of validations) {
    if (validation.presentReview > 0 || validation.presentAed > 0 || validation.present === 1) {
      count++
    }
  }
  return count
}

const getSpeciesAbsentCount = (validations: Validation[]): number => {
  if (!validations.length) return 0
  let count = 0
  for (const validation of validations) {
    if (validation.presentReview === 0 && validation.presentAed === 0 && validation.present === 0) {
      count++
    }
  }
  return count
}

const valState = (projectClass: ClassesRecordingResponse) => {
  const cl = class2key(projectClass)
  const val = validations.value[cl]
  if (typeof val === 'undefined') return undefined
  if (val[0] === 1 || val[1] > 0 || val[2] > 0) {
    valOptions[1].showValidateOptions = (val[1] > 0 || val[2] > 0)
    return valOptions[1]
  } if (val[0] === null && val[1] === 0 && val[2] === 0) {
    return undefined
  } else {
    return valOptions[2]
  }
}

const class2key = (projectClass: ClassesRecordingResponse | RecordingValidateResponse | number | string): string => {
  let cls
  if (/number|string/.test(typeof projectClass)) {
    cls = projectClasses.value && projectClasses.value.filter((pc: ClassesRecordingResponse) => { return pc.id === +projectClass }).shift()
  } else cls = projectClass as ClassesRecordingResponse | RecordingValidateResponse
  return [cls?.species, cls?.songtype].join('-')
}

const addValidation = (validation: Validation) => {
  const key = [validation.species, validation.songtype].join('-')
  const value = Object.values({ present: validation.present, presentReview: validation.presentReview, presentAed: validation.presentAed })
  validations.value[key] = value
}

const addSelectedClass = (projectClass: ClassesRecordingResponse) => {
  isSelected.value = {}
  isSelected.value[projectClass.id] = true
}

const selectClass = (projectClass: ClassesRecordingResponse) => {
  isSelected.value = {}
  isSelected.value[projectClass.id] = true
  toggleSpeciesAdd.value = false
  toggleSpeciesSelect.value = false
  toggleSongtypeSelect.value = false
  searchKeyword.value = projectClass.species_name
  scrollToClass(projectClass.species_name, projectClass.songtype_name)
  classToAdd.value = { species: undefined, songtype: undefined }
}

const validateAll = (val: number, taxon: string) => {
  validate(val, null, true, taxon)
}

const validate = async (val: number, dropdownId?: number | null, isClearOrAbsentAll?: boolean, taxon?: string) => {
  if (dropdownId !== null) {
    const validationDropdown = new Dropdown(
      document.getElementById('validationDropdownToggle-' + dropdownId),
      document.getElementById('validationDropdownBtn-' + dropdownId)
    )
    validationDropdown.hide()
  }
  let k
  const keys = []
  const keyIdx = {} as Record<string, boolean>
  if (isClearOrAbsentAll === true && taxon) {
    for (const cl in byTaxon.value[taxon]) {
      k = class2key(byTaxon.value[taxon][cl].id)
      const validationItem = validations.value[k]
      if (typeof validationItem === 'undefined') {
        if (k) keys.push(k)
      } else {
        if (validationItem[0] !== 1) {
          if (k) keys.push(k)
        }
      }
    }
    const validationDropdown = new Dropdown(
      document.getElementById('validationAllDropdownToggle-' + taxon),
      document.getElementById('validationAllDropdownBtn-' + taxon)
    )
    validationDropdown.hide()
  } else {
    for (const selPcId in isSelected.value) {
      if (isSelected.value[selPcId]) {
        k = class2key(selPcId)
        if (k && !keyIdx[k]) {
          keyIdx[k] = true
          keys.push(k)
        }
      }
    }
  }
  if (keys.length > 0) {
    const opts = {
      class: keys.join(','),
      val,
      determinedFrom: 'visualizer'
    } as RecordingValidateParams
    mutateRecordingValidate(opts, {
      onSuccess: async (result: RecordingValidateResponse[] | undefined) => {
        await refetchGetClasses()
        if (result === undefined) {
          showAlertDialog('error', 'Error', `Error to ${val === 1 ? 'validate' : val === 0 ? 'unvalidate' : 'clear'} the detection`)
          return
        }
        result.forEach((res) => {
          const key = class2key(res)
          if (res.val === 2) {
              delete validations.value[key]
          } else {
            validations.value[key] = Object.values({ present: res.val, presentReview: 0 })
          }
        })
        await nextTick()
        initDropdowns()
        emits('updateValidations')
      },
      onError: (err) => {
        console.info('err', err)
        showAlertDialog('error', 'Error', `Error to ${val === 1 ? 'validate' : val === 0 ? 'unvalidate' : 'clear'} the detection`)
      }
    })
  }
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
      await refetchSearchSpecies()
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

const toggleSpeciesVisible = () => {
  toggleVisible.value = !toggleVisible.value
  emits('emitSpeciesVisibility', toggleVisible.value)
}

const backToSelectSpecies = () => {
  toggleSpeciesSelect.value = true
  toggleSongtypeSelect.value = false
}

watch(props.visobject, () => {
  if (props.visobject.validations.length) {
    props.visobject.validations.forEach(addValidation)
  }
})

watch(taxons, async () => {
  await nextTick()
  initAccordions()
  initDropdowns()
  initTooltips()
})

onMounted(async () => {
  await nextTick()
  initAccordions()
  initDropdowns()
  initTooltips()
  if (props.visobject.validations.length) {
    props.visobject.validations.forEach(addValidation)
  }
})
</script>

<style lang="scss">

button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-right {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-right {
  display: inline-block;
}

input::placeholder::-webkit-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
  font-size: 10px !important;
}
input::placeholder::-moz-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder::-ms-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
}
.input-item {
  [type='text']:focus {
    border-color: #ADFF2C;
    --tw-ring-color: transparent;
  }
}

.dark .dark\:bg-gray-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(30, 28, 19, var(--tw-bg-opacity)) !important;
}

.dark .dark\:text-gray-400 {
  color: #FFFEFC !important;
}

.form-control {
  padding: 6px 30px 6px 30px !important;
}

.support {
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}

</style>
