<template>
  <div class="border-1 bg-echo border-util-gray-03 p-3 rounded-lg input-item">
    <div>
      <div>Site name:</div>
      <div>
        <input
          v-model="siteName"
          placeholder="Site name"
          class="text-white w-full form-control bg-moss border-gray-600 rounded-lg h-34px mt-2"
          type="text"
          required
        >
        <p
          v-if="siteNameError"
          class="text-red-500 text-sm mt-1"
        >
          Please fill in the site name to create a site.
        </p>
      </div>
      <div>
        <div class="items-center mt-4">
          <input
            id="exclude-site-checkbox"
            type="checkbox"
            class="w-5 h-5 border-2 rounded dark:bg-echo focus:ring-frequency border-white dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isDisabled"
            :checked="hidden"
            @click="tempHidden()"
          >
          <label
            class="font-light ml-2 cursor-pointer text-secondary"
            @click="tempHidden()"
          >Exclude this site from Arbimon Insights</label>
          <icon-custom-ic-info
            class="inline-block h-4 w-4 cursor-pointer ml-1"
          />
        </div>
      </div>
    </div>
    <div class="mt-5">
      <div> Location:</div>
      <p
        v-if="siteLatLonError && hidden !== true"
        class="text-red-500 text-sm mt-1"
      >
        Please enter latitude and longitude, or check 'Exclude this site from Abrimon Insights' to create a site.
      </p>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon flex items-center justify-center edit-site-label border-r-0 bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          :disabled="hidden"
        >
          Lat
        </div>
        <input
          id="lonInput"
          v-model="lat"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none w-full"
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
        {{ siteLatError ? `Please enter latitude or check 'Exclude this site from Abrimon Insights' to create a site.` : `Please enter latitude number between -85 to 85` }}
      </p>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon flex items-center justify-center edit-site-label border-r-0 bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          :disabled="hidden === true"
        >
          <p>Lon</p>
        </div>
        <input
          id="lonInput"
          v-model="lon"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none w-full"
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
        {{ siteLonError ? `Please enter longitude or check 'Exclude this site from Abrimon Insights' to create a site.` : `Please enter longitude number between -180 to 180` }}
      </p>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon flex items-center justify-center edit-site-label border-r-0 bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          :disabled="hidden === true"
        >
          El
        </div>
        <input
          id="lonInput"
          v-model="alt"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none w-full"
          style="height: 34px"
          name="alt"
          type="text"
          placeholder="Elevation (optional)"
          pattern="^-?\d+\.?\d*(\s*)$"
          :disabled="hidden === true"
          :required="hidden !== true"
        >
      </div>
    </div>
    <div
      v-if="editing"
      class="mt-5"
    >
      <div>Project:</div>
      <DropdownComponent
        :itmes="projectsItemList"
        :selected="selectedProject"
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
import { computed, inject, onMounted, ref, watch } from 'vue'

import { type SiteResponse, apiCorePostCreateSite, apiLegacySiteUpdate } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type LocationProjectWithInfo, apiBioGetMyProjects } from '@rfcx-bio/common/api-bio/project/projects'

import { apiClientArbimonLegacyKey, apiClientCoreKey, apiClientKey } from '@/globals'
import { useStore } from '~/store'
import DropdownComponent from './dropdown-component.vue'
import { type DropdownItem } from './dropdown-component.vue'

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

// API
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const props = withDefaults(defineProps<{ editing?: boolean, site?: SiteResponse }>(), {
  editing: false,
  site: undefined
})

const emit = defineEmits<{(e: 'emitClose', status?: string): void, (e: 'emitReloadSite', status: string): void, }>()

const siteName = ref('')
const isDisabled = ref(false)

const lat = ref('')
const lon = ref('')
const alt = ref('')
const hidden = ref(false)
const projects = ref<LocationProjectWithInfo[]>([])
const projectsItemList = ref<DropdownItem[]>([])
const selectedProject = ref<DropdownItem>()
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
    siteName.value = props.site?.name ?? ''
  } else {
    lat.value = ''
    lon.value = ''
    alt.value = ''
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

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance

watch(() => props.site, (newValue) => {
    if (!props.editing) return
    lat.value = newValue?.lat.toString() ?? ''
    lon.value = newValue?.lon.toString() ?? ''
    alt.value = newValue?.alt.toString() ?? ''
    siteName.value = newValue?.name ?? ''
})

watch(() => props.editing, (newValue) => {
  if (newValue) {
    lat.value = props.site?.lat.toString() ?? ''
    lon.value = props.site?.lon.toString() ?? ''
    alt.value = props.site?.alt.toString() ?? ''
    siteName.value = props.site?.name ?? ''
  } else {
    lat.value = ''
    lon.value = ''
    alt.value = ''
    siteName.value = ''
  }
})

async function create () {
  siteNameError.value = !siteName.value
  siteLatError.value = !lat.value
  siteLonError.value = !lon.value
  if (siteLatError.value && siteLonError.value) {
    siteLonError.value = false
    siteLatError.value = false
    siteLatLonError.value = true
  } else {
    siteLatLonError.value = false
  }

  siteLatFormatError.value = parseFloat(lat.value) > 85 || parseFloat(lat.value) < -85
  siteLonFormatError.value = parseFloat(lon.value) > 180 || parseFloat(lon.value) < -180

  if (siteLonError.value || siteLatError.value || siteNameError.value || siteLatLonError.value || siteLatFormatError.value || siteLonFormatError.value) {
    return
  }

  if (lat.value === '0' && lon.value === '0') {
    hidden.value = true
  }

  const selected = store.myProjects.find(p => p.slug === selectedProjectSlug.value)

  const site = {
    name: siteName.value,
    latitude: hidden.value ? 0 : parseFloat(lat.value),
    longitude: hidden.value ? 0 : parseFloat(lon.value),
    altitude: alt.value,
    project_id: selectedProject.value?.value ?? '',
    is_public: false
  }

  const siteItem = {
    site_id: props.site?.id ?? 0,
    name: siteName.value,
    lat: lat.value,
    lon: lon.value,
    alt: alt.value,
    external_id: props.site?.external_id ?? '',
    project: {
      project_id: 5846, // Should get project_id from legacy
      name: selected?.name ?? '',
      url: selected?.slug ?? '',
      external_id: selected?.idCore ?? ''
    }
  }

  if (props.editing) {
    try {
      const response = await apiLegacySiteUpdate(apiClientArbimon, selectedProjectSlug.value ?? '', siteItem)
      console.info(response)
      emit('emitReloadSite', 'success')
    } catch (e) {
      emit('emitClose', 'error')
     }
  } else {
    try {
      const response = await apiCorePostCreateSite(apiClientCore, site)
      console.info(response)
      emit('emitReloadSite', 'success')
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
</style>
