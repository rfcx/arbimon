<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
  >
    <div
      class="bg-echo text-white rounded-xl p-6 shadow-lg relative
         w-[900px] max-w-[calc(100vw-2rem)]
         max-h-[95vh] overflow-y-auto"
    >
      <button
        class="absolute right-4"
        type="button"
        data-modal-toggle="project-delete-modal"
        title="Cancel"
        @click="emitClose"
      >
        <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
      </button>
      <h2 class="text-2xl font-bold mb-4">
        Import Species
      </h2>
      <div>
        <div class="pt-5">
          <div class="flex items-center">
            <!-- Step 1 -->
            <div
              class="flex items-center text-frequency"
            >
              <div
                class="w-6 h-6 rounded-full border flex items-center justify-center"
                :class="isSelectStepper ? 'bg-frequency text-pitch border-frequency' : 'border-none'"
              >
                <span
                  v-if="isSelectStepper"
                  class="font-medium"
                >1</span>
                <icon-custom-ic-success
                  v-else
                  class="w-10 h-10"
                />
              </div>
              <span
                class="ml-2 font-medium text-frequency"
              >Select file</span>
            </div>
            <div
              class="flex-1 border-t mx-3"
              :class="(isReviewStepper || isUploadStepper) ? 'border-frequency' : 'border-util-gray-02'"
            />

            <!-- Step 2 -->
            <div
              class="flex items-center"
              :class="isReviewStepper ? 'text-frequency' : 'text-insight'"
            >
              <div
                class="w-6 h-6 rounded-full border flex items-center justify-center"
                :class="isReviewStepper || isUploadStepper ? 'bg-frequency text-pitch border-frequency' : 'border-util-gray-02'"
              >
                <span
                  v-if="isSelectStepper || isReviewStepper"
                  class="font-medium"
                >2</span>
                <icon-custom-ic-success
                  v-else
                  class="w-10 h-10"
                />
              </div>
              <span
                class="ml-2 font-medium"
                :class="isReviewStepper || isUploadStepper ? 'text-frequency' : 'text-insight'"
              >Review</span>
            </div>
            <div
              class="flex-1 border-t mx-3"
              :class="isUploadStepper ? 'border-frequency' : 'border-util-gray-02'"
            />

            <!-- Step 3 -->
            <div
              class="flex items-center"
              :class="isUploadStepper ? (isSpeciesBulkError ? 'text-ibis' : 'text-frequency') : 'text-insight'"
            >
              <div
                class="w-6 h-6 rounded-full border flex items-center justify-center"
                :class="isUploadStepper ? (isSpeciesBulkError ? 'bg-ibis text-pitch border-ibis' : 'bg-frequency text-pitch border-frequency') : 'border-util-gray-02'"
              >
                <icon-custom-ic-success
                  v-if="isPercentageFinished"
                  class="w-10 h-10"
                />
                <span
                  v-else
                  class="font-medium"
                >3</span>
              </div>
              <span
                class="ml-2 font-medium"
                :class="isUploadStepper ? 'text-frequency' : 'text-insight'"
              >Upload</span>
            </div>
          </div>
        </div>

        <div class="mt-6 ">
          <h4
            v-if="isSelectStepper"
            class="mt-0 pt-0 text-lg font-medium font-header"
          >
            Upload file
          </h4>
          <h4
            v-if="isUploadStepper"
            class="mt-0 pt-0 text-lg font-medium font-header"
          >
            Import
          </h4>
          <h4
            v-if="isReviewStepper"
            class="mt-0 pt-0 text-lg font-medium font-header"
          >
            Review species data
          </h4>

          <p
            v-if="isSelectStepper"
            class="text-md mt-3"
          >
            Upload a CSV or MS Excel containing a list of species names and sounds.<br>
            See an example of the data we expect under the input file.
          </p>
          <p
            v-if="isReviewStepper"
            class="text-md mt-3"
          >
            Our system matches the row value with our species database. Review the following species before uploading.
          </p>

          <!-- Error callout -->
          <div
            v-if="activeStepper !== 'Upload' && (errorSpecies.length || existedSpecies.length)"
            class="mt-5"
          >
            <div
              class="inline-flex w-fit self-start items-center justify-start gap-x-3 p-4 text-base text-pitch rounded-lg bg-[#FFDADA] border-ibis border-1 border-l-2 my-2"
              role="alert"
            >
              <div class="w-5">
                <icon-custom-alert-triangle class="h-6 w-6 cursor-pointer text-ibis" />
              </div>
              <span class="font-normal">Error</span>
              <div class="text-pitch font-normal">
                <div>{{ errorMessage }}</div>
                <div>{{ existedSpeciesMessage }}</div>
              </div>
            </div>
          </div>

          <div
            v-if="isReviewStepper && (errorSpecies.length || existedSpecies.length)"
            class="flex items-center justify-between mt-5"
          >
            <a
              class="text-link cursor-pointer underline text-md font-medium text-frequency"
              @click="downloadUnrecognizedSpecies"
            >
              Download unrecognized species (csv.)
            </a>
            <div class="flex items-center">
              <label class="inline-flex items-center cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="toggleErrorSpecies"
                  class="relative inline-flex h-5 w-11 flex-shrink-0 cursor-pointer rounded-full
             transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40
             items-center"
                  :class="toggleErrorSpecies ? 'bg-frequency' : 'bg-util-gray-03'"
                  @click="toggleShowErrorOnly"
                >
                  <span
                    aria-hidden="true"
                    class="inline-block h-4 w-4 transform rounded-full shadow ring-1 ring-black/10 transition"
                    :class="toggleErrorSpecies ? 'translate-x-6.5 bg-[#000]' : 'translate-x-0.5 bg-white'"
                  />
                </button>
                <span class="ml-2 text-sm">Show errors only</span>
              </label>
            </div>
          </div>
        </div>

        <div
          v-if="files.length && activeStepper !== 'Upload'"
          class="mt-6"
        >
          <div class="max-h-[300px] overflow-y-auto rounded-lg">
            <table class="w-full text-[13px]">
              <thead class="sticky top-0">
                <tr class="text-left">
                  <th class="px-3 py-2 border-b border-util-gray-03 w-12" />
                  <th class="px-3 py-2 border-b border-util-gray-03 w-2/5">
                    Species
                  </th>
                  <th class="px-3 py-2 border-b border-util-gray-03 w-1/3">
                    Sound
                  </th>
                  <th class="px-3 py-2 border-b border-util-gray-03 w-32">
                    Status
                  </th>
                  <th class="px-3 py-2 border-b border-util-gray-03" />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in files"
                  :key="row.position"
                  class="odd:bg-pitch/10"
                >
                  <td class="px-3 py-2 border-b border-util-gray-03 align-middle">
                    {{ row.position }}
                  </td>
                  <td class="border-b border-util-gray-03 align-middle">
                    <span
                      class="inline-block max-w-full truncate px-3 py-2"
                      :title="row.species"
                    >{{ row.species }}</span>
                  </td>
                  <td class="border-b border-util-gray-03 align-middle">
                    <span
                      class="inline-block max-w-full truncate px-3 py-2"
                      :title="row.sound"
                    >{{ row.sound }}</span>
                  </td>
                  <td class="border-b border-util-gray-03 align-middle">
                    <div class="flex items-center justify-between w-full">
                      <span
                        class="inline-block truncate px-3 py-2"
                        :title="row.status"
                      >{{ row.status }}</span>

                      <div
                        v-if="row.status === 'Success' || row.status === 'Failed'"
                        class="ml-4"
                      >
                        <icon-custom-ic-success
                          v-if="row.status === 'Success'"
                          class="w-4 h-4"
                        />
                        <icon-custom-ic-cancelled
                          v-else
                          class="w-4 h-4"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="border-b border-util-gray-03 align-middle">
                    <span
                      class="inline-block max-w-full truncate px-3 py-2"
                      :title="row.error"
                    >{{ row.error }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="isUploadStepper"
          class="py-5"
        >
          <div class="container-species bg-moss rounded-lg h-[350px] relative border border-util-gray-02 flex flex-col items-center justify-center gap-4">
            <icon-custom-ic-success
              v-if="isPercentageFinished"
              class="w-20 h-20"
            />
            <icon-custom-ic-cancelled
              v-if="isSpeciesBulkError"
              class="w-20 h-20"
            />
            <div
              v-if="isSpeciesBulkError"
              class="text-center px-4"
            >
              A Server Error Occurred. We encountered some issues while importing the species.
            </div>
            <div
              v-if="!isSpeciesBulkError"
              class="text-center"
            >
              {{ isPercentageFinished ? `Successfully imported ${successFiles.length} species.` : percentage >= 80 ? 'Finishing up...' : `Importing ${successFiles.length} species...` }}
            </div>
            <span
              v-if="isSpeciesBulkLoading && !isSpeciesBulkError"
              class="text-sm"
            >{{ percentage }} %</span>
            <div
              v-if="isSpeciesBulkLoading && !isSpeciesBulkError"
              class="w-[300px] h-[10px] bg-util-gray-02 rounded"
            >
              <div
                class="h-full rounded"
                :style="{ width: percentage + '%' }"
                style="background-color:#ADFF2C"
              />
            </div>
            <button
              v-if="isPercentageFinished || isSpeciesBulkError"
              class="btn btn-primary rounded-full mt-2 h-[34px] flex items-center justify-center"
              @click="emitClose"
            >
              Back to Species
            </button>
          </div>
        </div>

        <!-- Empty state / File picker -->
        <div
          v-if="!files.length"
          class="pt-5"
        >
          <div
            class="container-species bg-moss rounded-lg h-[350px] relative border-2 border-dashed border-util-gray-03 flex flex-col items-center justify-center"
            @dragover.prevent
            @drop.prevent="onDrop"
          >
            <div
              v-if="isSpeciesReading"
              class="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <i class="fa fa-spinner fa-spin text-2xl" />
            </div>

            <div
              v-if="!isSpeciesReading"
              class="flex flex-col items-center"
            >
              <icon-custom-cloud-upload class="ml-2 h-[100px] w-[92px]" />

              <div class="mt-5 flex flex-col items-start w-full max-w-[560px]">
                <h4 class="mt-0 ml-0 font-poppins text-lg font-medium">
                  Drag and drop or upload file
                </h4>
                <div class="w-full flex items-stretch mt-2">
                  <input
                    v-model="fileName"
                    type="text"
                    class="flex-1 placeholder-style w-[316px] h-[34px] bg-util-gray-04 border border-util-gray-03 rounded-l-[8px] rounded-r-none px-3 py-2 text-sm focus:(border-util-gray-03 ring-0)"
                    placeholder="Upload a batch species file (csv. xlsx.)"
                    aria-label="Upload a batch species file (csv. xlsx.)"
                  >
                  <label class="btn btn-primary rounded-r-[8px] rounded-l-none font-medium h-[34px] cursor-pointer px-4 py-2 text-sm flex items-center">
                    <span class="text-pitch">Choose file</span>
                    <input
                      accept=".csv,.xlsx,.xls"
                      type="file"
                      class="hidden"
                      @change="onFileChange"
                    >
                  </label>
                </div>
                <button
                  class="text-link underline text-left text-xs mt-3 text-frequency"
                  @click="downloadSpeciesExample"
                >
                  Use our sample batch species file
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Footer (Select/Review) -->
      <div
        v-if="activeStepper !== 'Upload'"
        class="modal-footer bg-surface mt-6"
      >
        <div class="flex items-center justify-between">
          <button
            class="btn btn-secondary btn-sm py-2"
            @click="emitClose"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary btn-sm flex items-center py-2"
            :class="disableUpload ? 'opacity-60 cursor-not-allowed bg-util-gray-03 text-util-gray-05' : ''"
            :disabled="disableUpload"
            @click="uploadSpecies"
          >
            <span v-if="isReviewStepper || isUploadStepper">Next: Upload</span>
            <span v-if="isSelectStepper">Next: Review</span>
            <icon-fa-arrow-right class="h-[12px] w-[14px] ml-2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import * as XLSX from 'xlsx'

import { apiLegacyBulkAddClasses, apiLegacyRecognizeClasses } from '@rfcx-bio/common/api-arbimon/audiodata/species'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', v: boolean): void,
  (e: 'close'): void,
  (e: 'dismiss'): void,
  (e: 'imported', success: boolean): void
}>()
// State
const activeStepper = ref<'Select' | 'Review' | 'Upload'>('Select')
const files = ref<any[]>([])
const originalFiles = ref<any[]>([])
const successFiles = ref<any[]>([])
const errorSpecies = ref<any[]>([])
const existedSpecies = ref<any[]>([])

const isSpeciesReading = ref(false)
const isSpeciesBulkLoading = ref(false)
const isSpeciesBulkError = ref(false)
const toggleErrorSpecies = ref(false)
const fileName = ref('')
const csvFile = ref(false)
const percentage = ref(0)

// Disable Upload button
const disableUpload = computed(() => {
const errSpeciesCount = files.value.filter((f) => f.status === 'Failed').length
  return !fileName.value || activeStepper.value === 'Select' || (errSpeciesCount > 0 && errSpeciesCount === files.value.length)
})

// Messages
const errorMessage = ref('')
const existedSpeciesMessage = ref('')

// Stepper flags
const isSelectStepper = computed(() => activeStepper.value === 'Select')
const isUploadStepper = computed(() => activeStepper.value === 'Upload')
const isReviewStepper = computed(() => activeStepper.value === 'Review')
const isPercentageFinished = computed(() => percentage.value === 100)

function downloadUnrecognizedSpecies () {
  const headers = { species: 'Species', sound: 'Sound' }
  const itemsFormatted = errorSpecies.value.map((item) => ({ species: item.species, sound: item.sound }))
  exportCSVFile(headers, itemsFormatted, 'unrecognized_species')
}

function exportCSVFile (headers: Record<string, string> | null, items: any[], fileTitle: string) {
  const list = headers ? [headers, ...items] : items
  const jsonObject = JSON.stringify(list)
  const csv = convertToCSV(jsonObject)
  const exportedFilename = `${fileTitle}.csv`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = exportedFilename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function convertToCSV (objArray: string | any[]) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray as string) : (objArray as any[])
  let str = ''
  for (let i = 0; i < array.length; i++) {
    let line = ''
    for (const index in array[i]) {
      if (line !== '') line += ','
      line += array[i][index]
    }
    str += line + '\r\n'
  }
  return str
}

async function uploadSpecies () {
  if (activeStepper.value === 'Select') {
    return reviewState()
  }
  uploadState()
  successFiles.value = originalFiles.value.filter((f) => f.status === 'Success')
  percentage.value = 80
  try {
    await apiLegacyBulkAddClasses(apiClientArbimon, selectedProjectSlug.value ?? '', { classes: successFiles.value })
    percentage.value = 100
    isSpeciesBulkLoading.value = false
    emit('imported', true)
  } catch (e) {
    isSpeciesBulkError.value = true
    emit('imported', false)
  }
}

function uploadState () {
  isSpeciesBulkLoading.value = true
  activeStepper.value = 'Upload'
  percentage.value = 10
}

function toggleShowErrorOnly () {
  toggleErrorSpecies.value = !toggleErrorSpecies.value

  if (toggleErrorSpecies.value) {
    const merged = errorSpecies.value.concat(existedSpecies.value)
    files.value = merged.map((sp: any, ind: number) => ({
      species: sp.species,
      sound: sp.sound,
      status: sp.status,
      error: sp.error,
      position: ind + 1
    }))
  } else {
    files.value = originalFiles.value
  }
}

async function onFileChange (e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (!f) return
  isSpeciesReading.value = true
  fileName.value = f.name
  csvFile.value = f.name.toLowerCase().includes('.csv')

  try {
    if (csvFile.value) {
      const text = await f.text()
      const lines = text.split(/\r\n|\n/)
      parseCSVSpeciesBulk(lines)
    } else {
      const data = new Uint8Array(await f.arrayBuffer())
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)
      parseExcelSpeciesBulk(json)
    }
    await recognize()
    reviewState()
  } catch (err) {
    console.error(err)
  } finally {
    isSpeciesReading.value = false
  }
}

function onDrop (ev: DragEvent) {
  const f = ev.dataTransfer?.files?.[0]
  if (!f) return
  const input = document.createElement('input')
  input.type = 'file'
  const dt = new DataTransfer()
  dt.items.add(f)
  input.files = dt.files
  const changeEvent = new Event('change')
  input.addEventListener('change', onFileChange)
  input.dispatchEvent(changeEvent)
}

function parseCSVSpeciesBulk (res: string[]) {
  files.value = []
  let ind = 0
  for (const sp of res) {
    if (!sp?.length) continue
    const cl = sp.split(',')
    if (cl.length < 2) continue
    const species = cl[0].trim()
    const sound = cl[1].trim()
    if (species.toLowerCase() === 'species' || sound.toLowerCase() === 'sound') continue
    files.value.push({ species, sound, status: 'Waiting', position: ind + 1 })
    ind++
  }
}

function parseExcelSpeciesBulk (res: Array<Record<string, any>>) {
  files.value = []
  res.forEach((sp, ind) => {
    const species = sp.species ?? sp.Species
    const sound = sp.sound ?? sp.Sound ?? sp.Songtype ?? sp.songtype
    files.value.push({ species, sound, status: 'Waiting', position: ind + 1 })
  })
}

function reviewState () {
  isSpeciesReading.value = false
  activeStepper.value = 'Review'
}

async function recognize () {
  try {
    const result = await apiLegacyRecognizeClasses(apiClientArbimon, selectedProjectSlug.value ?? '', { classes: files.value })
    files.value = result.classes
    originalFiles.value = result.classes

    const errs = files.value.filter((f: any) => f.status === 'Failed' && f.error !== 'Species class already exists.')
    const exists = files.value.filter((f: any) => f.status === 'Failed' && f.error === 'Species class already exists.')

    errorSpecies.value = errs.map((sp: any, ind: number) => ({
      species: sp.species,
      sound: sp.sound,
      status: sp.status,
      error: sp.error,
      position: ind + 1
    }))

    existedSpecies.value = exists.map((sp: any, ind: number) => ({
      species: sp.species,
      sound: sp.sound,
      status: sp.status,
      error: sp.error,
      position: ind + 1
    }))

    if (errorSpecies.value.length) {
      errorMessage.value = `${errorSpecies.value.length} ${errorSpecies.value.length === 1 ? 'species name is not recognized. Please add it manually.' : 'species names are not recognized. Please add them manually.'}`
    } else {
      errorMessage.value = ''
    }

    if (existedSpecies.value.length) {
      existedSpeciesMessage.value = `${existedSpecies.value.length} ${existedSpecies.value.length === 1 ? 'species is already existed.' : 'species are already existed.'}`
    } else {
      existedSpeciesMessage.value = ''
    }
  } catch (e) {
    console.info(e)
  }
}

function downloadSpeciesExample () {
  const headers = { species: 'Species', sound: 'Sound' }
  const species = [
    { species: 'Eleutherodactylus brittoni', sound: 'Common Song' },
    { species: 'Alophoixus bres', sound: 'Simple Call' },
    { species: 'Electron platyrhynchum', sound: 'Common Song' },
    { species: 'Myrmia micrura', sound: 'Common Song' },
    { species: 'Amazona xanthops', sound: 'Common Song' },
    { species: 'Aramides cajanea', sound: 'Common Song' }
  ]
  exportCSVFile(headers, species, 'species_example')
}

function emitClose () {
  resetAll()
  emit('update:modelValue', false)
  emit('close')
}

watch(() => props.modelValue, (open) => {
  if (open) {
    resetAll()
  }
})

function resetAll () {
  activeStepper.value = 'Select'

  files.value = []
  originalFiles.value = []
  successFiles.value = []
  errorSpecies.value = []
  existedSpecies.value = []

  isSpeciesReading.value = false
  isSpeciesBulkLoading.value = false
  isSpeciesBulkError.value = false
  toggleErrorSpecies.value = false

  fileName.value = ''
  csvFile.value = false
  percentage.value = 0

  errorMessage.value = ''
  existedSpeciesMessage.value = ''
}
</script>

<style lang="scss">
  .rounded-l-item {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .rounded-r-item {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .placeholder-style::placeholder {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }
</style>
