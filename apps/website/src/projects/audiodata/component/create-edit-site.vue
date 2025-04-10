<template>
  <div class="border-1 bg-echo border-util-gray-03 p-3 rounded-lg">
    <div>
      <div>Site name:</div>
      <div>
        <input
          v-model="siteName"
          placeholder="Site name"
          class="text-white w-full form-control bg-moss border-gray-600 rounded-lg h-34px mt-2"
          type="text"
        >
      </div>
      <div>
        <div class="items-center mt-4">
          <input
            id="exclude-site-checkbox"
            type="checkbox"
            class="w-5 h-5 border-2 rounded dark:bg-echo focus:ring-frequency border-white dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isDisabled"
            :checked="checked"
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
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon text-center edit-site-label bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          ng-disabled="temp.hidden === true"
        >
          Lat
        </div>
        <input
          id="lonInput"
          v-model="lat"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none border-l-0 w-full"
          style="height: 34px"
          name="lat"
          type="text"
          placeholder="Latitude"
          pattern="^-?\d+\.?\d*(\s*)$"
          ng-disabled="temp.hidden === true"
          ng-required="temp.hidden !== true"
        >
      </div>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon text-center edit-site-label bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          ng-disabled="temp.hidden === true"
        >
          <p>Lon</p>
        </div>
        <input
          id="lonInput"
          v-model="lon"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none border-l-0 w-full"
          style="height: 34px"
          name="lon"
          type="text"
          placeholder="Longitude"
          pattern="^-?\d+\.?\d*(\s*)$"
          ng-disabled="temp.hidden === true"
          ng-required="temp.hidden !== true"
        >
      </div>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon text-center edit-site-label bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          ng-disabled="temp.hidden === true"
        >
          El
        </div>
        <input
          id="lonInput"
          v-model="alt"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none border-l-0 w-full"
          style="height: 34px"
          name="alt"
          type="text"
          placeholder="Elevation (optional)"
          pattern="^-?\d+\.?\d*(\s*)$"
          ng-disabled="temp.hidden === true"
          ng-required="temp.hidden !== true"
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
      <button class="btn btn-primary btn-rounded-full btn-small">
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { type SiteResponse } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type LocationProjectWithInfo } from '@rfcx-bio/common/api-bio/project/projects'

import { useStore } from '~/store'
import DropdownComponent from './dropdown-component.vue'
import { type DropdownItem } from './dropdown-component.vue'

const store = useStore()

const props = withDefaults(defineProps<{ creating?: boolean, editing?: boolean, site?: SiteResponse }>(), {
  creating: false,
  editing: false,
  site: undefined
})

const emit = defineEmits<{(e: 'emitClose'): void}>()

const siteName = ref('')
const isDisabled = ref(false)
const checked = ref(false)

const lat = ref('')
const lon = ref('')
const alt = ref('')
const hidden = ref(false)
const projects = ref<LocationProjectWithInfo[]>([])
const projectsItemList = ref<DropdownItem[]>([])

onMounted(() => {
  if (props.editing) {
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
  projects.value = store.myProjects
  projects.value.forEach(p => {
    projectsItemList.value.push({ value: p.idCore, label: p.name, checked: false })
  })
})

const tempHidden = () => {
  hidden.value = true
}

const close = () => { emit('emitClose') }

</script>

<style lang="scss">
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
