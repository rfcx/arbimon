<template>
  <div class="border-1 bg-echo border-util-gray-03 p-3 rounded-lg input-item">
    <div>
      <div>Site name:</div>
      <div>
        <input
          v-model="siteName"
          placeholder="Site name"
          class="text-white w-full bg-moss border-util-gray-03 rounded-lg h-34px mt-2"
          type="text"
          required
        >
        <p
          v-if="siteNameError"
          class="text-red-500 text-sm mt-1"
        >
          Please fill in the site name.
        </p>
      </div>
      <div>
        <div class="items-center mt-4">
          <input
            id="exclude-site-checkbox"
            type="checkbox"
            class="site-checkbox w-5 h-5 border-2 rounded dark:bg-echo border-white ring-0 ring-offset-0 ring-offset-transparent focus:ring-0 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isDisabled"
            :checked="hidden"
            @click="tempHidden()"
          >
          <label
            class="font-light ml-2 cursor-pointer text-secondary"
            @click="tempHidden()"
          >Exclude this site from Arbimon Insights</label>
          <div
            ref="popoverWrapper"
            class="relative inline-block"
          >
            <icon-custom-ic-info
              class="inline-block h-4 w-4 cursor-pointer ml-1"
              @click="togglePopover"
            />
            <transition name="fade">
              <div
                v-if="showPopover"
                class="absolute z-10 w-58 p-3 text-sm text-white bg-moss rounded-lg shadow-lg right-0 mt-2"
              >
                Hide test sites or sites for <br>
                importing external templates. <br>
                <a
                  href="https://help.arbimon.org/article/206-adding-a-site"
                  target="_blank"
                  class="text-frequency underline cursor-pointer"
                >
                  Learn more
                </a>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-5">
      <div> Location:</div>
      <p
        v-if="siteLatLonError && hidden !== true"
        class="text-red-500 text-sm mt-1"
      >
        Please fill in latitude, longitude, or check Exclude this site from Arbimon Insights.
      </p>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon flex items-center justify-center edit-site-label border-r-0 bg-moss border-util-gray-03 rounded-lg rounded-r-none w-16"
          :disabled="hidden"
        >
          Lat
        </div>
        <input
          id="lonInput"
          v-model="lat"
          class="bg-moss border-util-gray-03 rounded-lg rounded-l-none w-full"
          :class="{ 'opacity-50 cursor-not-allowed': hidden === true }"
          style="height: 34px"
          name="lat"
          type="text"
          placeholder="Latitude"
          pattern="^-?\d+\.?\d*(\s*)$"
          :disabled="hidden === true"
          :required="hidden !== true"
        >
      </div>
      <p
        v-if="(siteLatError || siteLatFormatError) && hidden !== true"
        class="text-red-500 text-sm mt-1"
      >
        {{ siteLatError ? `Please fill in latitude or check Exclude this site from Arbimon Insights` : `Please enter latitude number between -85 to 85` }}
      </p>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon flex items-center justify-center edit-site-label border-r-0 bg-moss border-util-gray-03 rounded-lg rounded-r-none w-16"
          :disabled="hidden === true"
        >
          <p>Lon</p>
        </div>
        <input
          id="lonInput"
          v-model="lon"
          class="bg-moss border-util-gray-03 rounded-lg rounded-l-none w-full"
          :class="{ 'opacity-50 cursor-not-allowed': hidden === true }"
          style="height: 34px"
          name="lon"
          type="text"
          placeholder="Longitude"
          pattern="^-?\d+\.?\d*(\s*)$"
          :disabled="hidden === true"
          :aria-busy="hidden !== true"
        >
      </div>
      <p
        v-if="(siteLonError || siteLonFormatError) && hidden !== true"
        class="text-red-500 text-sm mt-1"
      >
        {{ siteLonError ? `Please fill in longitude, or check Exclude this site from Arbimon Insights.` : `Please enter longitude number between -180 to 180` }}
      </p>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon flex items-center justify-center edit-site-label border-r-0 bg-moss border-util-gray-03 rounded-lg rounded-r-none w-16"
          :disabled="hidden === true"
        >
          El
        </div>
        <input
          id="lonInput"
          v-model="alt"
          class="bg-moss border-util-gray-03 rounded-lg rounded-l-none w-full"
          :class="{ 'opacity-50 cursor-not-allowed': hidden === true }"
          style="height: 34px"
          name="alt"
          type="text"
          placeholder="Elevation (optional)"
          pattern="^-?\d+\.?\d*(\s*)$"
          :disabled="hidden === true"
          :required="hidden !== true"
        >
      </div>
      <p
        v-if="altFormatError && hidden !== true"
        class="text-red-500 text-sm mt-1"
      >
        Please enter a valid elevation number (e.g. 123.45)
      </p>
    </div>
    <div
      v-if="editing"
      class="mt-5"
    >
      <div>Project:</div>
      <DropdownComponent
        :items="projectsItemList"
        :selected="selectedProject"
        @selected-item="onSelectProject"
      />
    </div>
    <div class="flex flex-row justify-between mt-5">
      <button
        class="btn btn-secondary btn-rounded-full btn-small"
        type="button"
        @click="close()"
      >
        Cancel
      </button>
      <button
        class="btn btn-primary btn-rounded-full btn-small"
        @click.prevent="create"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { type SiteResponse, apiLegacySiteCreate, apiLegacySiteUpdate } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type LocationProjectWithInfo, type LocationProjectWithRole, apiBioGetMyProjects, apiBioGetProjectBySlug } from '@rfcx-bio/common/api-bio/project/projects'

import { apiClientArbimonLegacyKey, apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { type SitePayload } from '../sites-page.vue'
import DropdownComponent from './dropdown-component.vue'
import { type DropdownItem } from './dropdown-component.vue'

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const selectedProjectCoreId = computed(() => store.project?.idCore)

// API
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const props = withDefaults(defineProps<{ editing?: boolean, site?: SiteResponse }>(), {
  editing: false,
  site: undefined
})

const emit = defineEmits<{(e: 'emitClose', status?: string, error?: string | undefined): void, (e: 'emitReloadSite', status: string, payload: SitePayload): void, }>()

const siteName = ref('')
const isDisabled = ref(false)

const lat = ref('')
const lon = ref('')
const alt = ref('')
const hidden = ref(false)
const projects = ref<LocationProjectWithInfo[]>([])
const projectsItemList = ref<DropdownItem[]>([])
const selectedProject = ref<DropdownItem>()
const selectedProjecInfo = ref<LocationProjectWithRole>()
const hasFetchedAll = ref(false)
const isLoading = ref(false)
const hasFailed = ref(false)
const apiClientBio = inject(apiClientKey) as AxiosInstance
const LIMIT = 20

const siteNameError = ref(false)
const siteLatError = ref(false)
const siteLonError = ref(false)
const siteLatLonError = ref(false)
const siteLatFormatError = ref(false)
const siteLonFormatError = ref(false)
const altFormatError = ref(false)

const updateSelectedProject = () => {
  const selected = store.myProjects.find(p => p.slug === selectedProjectSlug.value)
  if (selected && selectedProject.value === undefined) {
    selectedProject.value = { value: selected.idCore, label: selected.name }
  }
}

onMounted(() => {
  if (props.editing) {
    lat.value = props.site?.lat?.toString() ?? ''
    lon.value = props.site?.lon?.toString() ?? ''
    alt.value = props.site?.alt?.toString() ?? ''
    hidden.value = props.site?.hidden === 1
    siteName.value = props.site?.name ?? ''
  } else {
    lat.value = ''
    lon.value = ''
    alt.value = ''
    hidden.value = false
    siteName.value = ''
  }

  if (store.myProjects.length === 0) {
    fetchProjects(0, LIMIT)
    return
  }
  projects.value = store.myProjects
  projects.value.forEach(p => {
    projectsItemList.value.push({ value: p.idCore, label: p.name })
  })
  updateSelectedProject()
})

const showPopover = ref(false)
const popoverWrapper = ref<HTMLElement | null>(null)

function togglePopover () {
  showPopover.value = !showPopover.value
}

function closePopover () {
  showPopover.value = false
}

function handleClickOutside (event: MouseEvent) {
  if (popoverWrapper.value && !popoverWrapper.value.contains(event.target as Node)) {
    closePopover()
  }
}

const onSelectProject = async (projectCoreId: string) => {
  const selected = store.myProjects.find(p => p.idCore === projectCoreId)
  const projectResponse = await apiBioGetProjectBySlug(apiClientBio, selected?.slug ?? '')
  selectedProjecInfo.value = projectResponse
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(siteName, (val) => {
  if (val) {
    siteNameError.value = false
  }
})

watch(lat, (val) => {
  if (val) {
    siteLatError.value = false
    siteLatLonError.value = false
    siteLatFormatError.value = false
  }
})

watch(lon, (val) => {
  if (val) {
    siteLonError.value = false
    siteLatLonError.value = false
    siteLonFormatError.value = false
  }
})

watch(alt, (val) => {
  if (val) {
    altFormatError.value = false
  }
})

const fetchProjects = async (offset:number, limit: number): Promise<void> => {
  isLoading.value = true
  hasFailed.value = false

  try {
    const myProjectResponse = await apiBioGetMyProjects(apiClientBio, limit, offset)
    isLoading.value = false
    if (myProjectResponse === undefined) {
      hasFailed.value = true
      return
    }
    hasFetchedAll.value = myProjectResponse.total < myProjectResponse.limit // check if reaching the end
    store.updateMyProject(myProjectResponse?.data)
    projects.value = store.myProjects
    projects.value.forEach(p => {
      projectsItemList.value.push({ value: p.idCore, label: p.name })
    })
    updateSelectedProject()
    if (!hasFetchedAll.value) {
      loadMoreProject()
    }
  } catch (e) {
    isLoading.value = false
    hasFailed.value = true
  }
}

const loadMoreProject = async (): Promise<void> => {
  if (hasFetchedAll.value || isLoading.value || hasFailed.value) return
  fetchProjects(projects.value.length, LIMIT)
}

const tempHidden = () => {
  hidden.value = !hidden.value
}

const close = () => { emit('emitClose') }

watch(() => props.site, (newValue) => {
    if (!props.editing) return
    if (!newValue) {
      emit('emitClose')
      return
    }
    lat.value = newValue?.lat != null ? String(newValue.lat) : ''
    lon.value = newValue?.lon != null ? String(newValue.lon) : ''
    alt.value = newValue?.alt != null ? String(newValue.alt) : ''
    hidden.value = newValue?.hidden === 1
    siteName.value = newValue?.name ?? ''
})

watch(() => props.editing, (newValue) => {
  if (newValue) {
    lat.value = props.site?.lat != null ? String(props.site.lat) : ''
    lon.value = props.site?.lon != null ? String(props.site.lon) : ''
    alt.value = props.site?.alt != null ? String(props.site.alt) : ''
    hidden.value = props.site?.hidden === 1
    siteName.value = props.site?.name ?? ''
  } else {
    lat.value = ''
    lon.value = ''
    alt.value = ''
    hidden.value = false
    siteName.value = ''
  }
})

async function create () {
  const validNumberRegex = /^-?\d+(\.\d+)?$/
  siteLatFormatError.value = false
  siteLonFormatError.value = false
  altFormatError.value = false

  siteNameError.value = !siteName.value
  if (!hidden.value) {
    siteLatError.value = !lat.value
    siteLonError.value = !lon.value
    if (siteLatError.value && siteLonError.value) {
      siteLonError.value = false
      siteLatError.value = false
      siteLatLonError.value = true
    } else {
      siteLatLonError.value = false
    }

    if (lat.value) {
      siteLatFormatError.value = !validNumberRegex.test(lat.value) || parseFloat(lat.value) > 85 || parseFloat(lat.value) < -85
    }

    if (lon.value) {
      siteLonFormatError.value = !validNumberRegex.test(lon.value) || parseFloat(lon.value) > 180 || parseFloat(lon.value) < -180
    }
    if (alt.value !== '') {
      altFormatError.value = !validNumberRegex.test(alt.value)
    }

    if (siteLonError.value || siteLatError.value || siteNameError.value || siteLatLonError.value || siteLatFormatError.value || siteLonFormatError.value || altFormatError.value) {
      return
    }
  } else {
    if (siteNameError.value) return
  }

  if (lat.value === '0' && lon.value === '0') {
    hidden.value = true
  }

  const site = {
    name: siteName.value,
    project_id: selectedProjectCoreId.value ?? '',
    hidden: hidden.value ? 1 : 0,
    ...(lat.value !== '' && { lat: parseFloat(lat.value) }),
    ...(lon.value !== '' && { lon: parseFloat(lon.value) }),
    ...(alt.value !== '' && { alt: parseFloat(alt.value) })
  }

  const siteItem = {
    site_id: props.site?.id ?? 0,
    name: siteName.value,
    lat: lat.value,
    lon: lon.value,
    alt: alt.value,
    external_id: props.site?.external_id ?? '',
    hidden: hidden.value ? 1 : 0,
    project: {
      project_id: selectedProjecInfo.value?.idArbimon ?? 0,
      name: selectedProjecInfo.value?.name ?? '',
      url: selectedProjecInfo.value?.slug ?? '',
      external_id: selectedProjecInfo.value?.idCore ?? ''
    }
  }

  if (props.editing) {
    try {
      await apiLegacySiteUpdate(apiClientArbimon, selectedProjectSlug.value ?? '', siteItem)
      emit('emitReloadSite', 'success', { id: siteItem.site_id, name: siteItem.name, lat: siteItem.lat, lon: siteItem.lon })
    } catch (e) {
      emit('emitClose', 'error')
     }
  } else {
    try {
      const response = await apiLegacySiteCreate(apiClientArbimon, selectedProjectSlug.value ?? '', site)
      let responseObj: { error?: string } = {}

      if (typeof response.data === 'string') {
        responseObj = JSON.parse(response.data)
      } else if (typeof response.data === 'object' && response.data !== null) {
        responseObj = response.data
      }

      if (responseObj.error) {
        emit('emitClose', 'error', responseObj.error)
      } else {
        emit('emitReloadSite', 'success', { id: null, name: site.name, lat: site.lat, lon: site.lon })
      }
    } catch (e) {
      emit('emitClose', 'error')
    }
  }
}

</script>

<style lang="scss">
.input-item {
  [type='text']:focus {
    border-color: #ADFF2C;
    --tw-ring-color: #ADFF2C;
  }
}
.input-group {
  position: relative;
  display: table;
  border-collapse: separate;
}

.text-item {
  color: #fff;
}

.input-group-addon {
    padding: 6px 12px;
    font-size: 14px;
    font-weight: normal;
    line-height: 1;
    color: #FFFEFC;
    text-align: center;
    background-color: #060508;
    border: 1px solid #F9F6F2;
    border-radius: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.site-checkbox {
  --tw-ring-offset-width: 0px !important;
  --tw-ring-offset-color: transparent;
  --tw-ring-color: transparent;
}
</style>
