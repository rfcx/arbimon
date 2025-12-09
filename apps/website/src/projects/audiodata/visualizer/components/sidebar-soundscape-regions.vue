<template>
  <div
    id="accordion-collapse-soundscape-regions"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div
      id="accordion-collapse-heading-soundscape-regions"
      data-accordion="open"
      class="flex justify-between items-center"
    >
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-soundscape-regions"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-soundscape-regions"
      >
        <div>
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span class="ml-1 text-sm font-bold">Soundscape Regions</span>
        </div>
      </button>
      <div class="flex justify-row justify-end items-center gap-x-3">
        <div
          class="min-w-5 flex flex-row justify-center cursor-default items-center gap-x-1 bg-[#D9D9D9] text-pitch rounded-full text-xs px-2 py-0.6"
          data-tooltip-target="tooltipCountSoundscapeRegions"
          data-tooltip-style="light"
        >
          {{ soundscapeRegions?.length ?? 0 }}
        </div>
        <div
          id="tooltipCountSoundscapeRegions"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Count of Soundscape Regions
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <div
          class="cursor-pointer"
          title="Show/hide all Soundscape Regions"
          @click="toggleSoundscapeRegionsVisible()"
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
    </div>
    <div
      id="accordion-collapse-body-soundscape-regions"
      class="hidden w-[95%] flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-soundscape-regions"
    >
      <div v-if="!soundscapeRegions?.length">
        There are no regions defined in this soundscape.
      </div>
      <div v-else>
        <table class="table w-full">
          <thead>
            <tr class="border-t-1 border-util-gray-03">
              <th>
                <div class="flex flex-row items-center gap-x-3 py-2">
                  Name
                  <div
                    class="cursor-pointer"
                    title="Show/hide Soundscape Regions names"
                    @click="toggleSoundscapeRegionNamesVisibility = !toggleSoundscapeRegionNamesVisibility"
                  >
                    <icon-fa-eye
                      v-if="toggleSoundscapeRegionNamesVisibility"
                      class="h-4 w-4 text-util-gray-02"
                    />
                    <icon-fa-eye-slash
                      v-else
                      class="h-4 w-4 text-util-gray-02"
                    />
                  </div>
                </div>
              </th>
              <th>
                <div class="flex flex-row items-center justify-center gap-x-3">
                  Tags
                  <div
                    class="cursor-pointer"
                    title="Show/hide Tags"
                    @click="toggleSoundscapeRegionTagsVisibility = !toggleSoundscapeRegionTagsVisibility"
                  >
                    <icon-fa-eye
                      v-if="toggleSoundscapeRegionTagsVisibility"
                      class="h-4 w-4 text-util-gray-02"
                    />
                    <icon-fa-eye-slash
                      v-else
                      class="h-4 w-4 text-util-gray-02"
                    />
                  </div>
                </div>
              </th>
              <th colspan="2" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="region in soundscapeRegions"
              :key="region.name"
              class="cursor-pointer border-t-1 border-util-gray-03"
            >
              <!-- Name -->
              <td>
                <span @click="toggleSoundscapeRegionName(region.id)">{{ region.name }}</span>
              </td>
              <!-- Tags -->
              <td>
                <div class="flex flex-row items-center justify-center">
                  <span
                    v-if="!region.tags || !region.tags.length"
                  >[None]</span>
                  <template v-else>
                    <span
                      v-for="tag in region.tags"
                      :key="tag.tag"
                      class="inline-block mr-1"
                      @click="toggleSoundscapeRegionTag(tag.id)"
                    >
                      {{ tag.tag }}
                    </span>
                  </template>
                </div>
              </td>

              <!-- Hide/Show region -->
              <td>
                <button
                  class="btn btn-xs"
                  title="Show/hide Soundscape Region"
                  @click="toggleSoundscapeRegionVisibility(region)"
                >
                  <icon-fa-eye
                    v-if="visibleSoundscapes.showBoxes.includes(region.id)"
                    class="h-4 w-4 text-util-gray-02"
                  />
                  <icon-fa-eye-slash
                    v-else
                    class="h-4 w-4 text-util-gray-02"
                  />
                </button>
              </td>

              <!-- Playlist -->
              <td>
                <div
                  v-if="region.playlist"
                  class="cursor-pointer px-2"
                  title="View the Playlist"
                  @click="viewPlaylist(region)"
                >
                  <icon-fa-list class="h-4 w-4 mx-2" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initAccordions, initTooltips } from 'flowbite'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { SoundscapeRegion } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetSoundscapeRegions } from '../../_composables/use-visualizer'

export interface VisibleSoundscapes {
  showAllNames: boolean
  showAllTags: boolean
  showBoxes: number[]
  activeBox: number | null
  activeTag: number | null
  toggleVisible: boolean
}

const emits = defineEmits<{(e: 'emitActiveLayer', isActive: boolean): void,
(e: 'emitVisibleSoundscapes', value: VisibleSoundscapes): void
}>()

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const store = useStore()
const route = useRoute()
const toggleVisible = ref<boolean>(true)
const toggleSoundscapeRegionNamesVisibility = ref<boolean>(true)
const toggleSoundscapeRegionTagsVisibility = ref<boolean>(true)
const selectedProjectSlug = computed(() => store.project?.slug)
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const visibleSoundscapes = ref<VisibleSoundscapes>({
  showAllNames: true,
  showAllTags: true,
  showBoxes: [],
  activeBox: null,
  activeTag: null,
  toggleVisible: true
})

const { data: soundscapeRegions, refetch: refetchGetSoundscapeRegions } = useGetSoundscapeRegions(apiClientArbimon, selectedProjectSlug, browserTypeId)

const toggleSoundscapeRegionsVisible = () => {
  toggleVisible.value = !toggleVisible.value
  visibleSoundscapes.value.toggleVisible = toggleVisible.value
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
  emits('emitActiveLayer', toggleVisible.value)
}

const toggleSoundscapeRegionName = (regionId: number) => {
  visibleSoundscapes.value.activeBox = regionId
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
}

const toggleSoundscapeRegionTag = (tagId: number) => {
  visibleSoundscapes.value.activeTag = tagId
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
}

// show / hide region box
const toggleSoundscapeRegionVisibility = (region: SoundscapeRegion) => {
  if (visibleSoundscapes.value.showBoxes.includes(region.id)) {
    visibleSoundscapes.value.showBoxes = visibleSoundscapes.value.showBoxes.filter(id => id !== region.id)
  } else visibleSoundscapes.value.showBoxes.push(region.id)
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
}

const viewPlaylist = (region: SoundscapeRegion) => {
  // TODO: go to playlist
}

watch(() => browserTypeId.value, () => {
  refetchGetSoundscapeRegions()
  initTooltips()
})

// show / hide all region names text
watch(() => toggleSoundscapeRegionNamesVisibility.value, () => {
  visibleSoundscapes.value.showAllNames = toggleSoundscapeRegionNamesVisibility.value
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
})

// show / hide all region tags text
watch(() => toggleSoundscapeRegionTagsVisibility.value, () => {
  visibleSoundscapes.value.showAllTags = toggleSoundscapeRegionTagsVisibility.value
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
})

watch(() => soundscapeRegions.value, () => {
  if (!soundscapeRegions.value) return
  visibleSoundscapes.value.showBoxes = soundscapeRegions.value?.map(s => s.id)
  emits('emitVisibleSoundscapes', visibleSoundscapes.value)
})

onMounted(() => {
  initAccordions()
  initTooltips()
})
</script>
