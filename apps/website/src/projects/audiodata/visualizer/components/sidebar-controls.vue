<template>
  <!-- `only` splits this control cluster across two rows (2026-07-20 operator
       layout): 'freq' = just the frequency-filter button (sits on the transport
       row); 'rest' = color + download (sit on the row below with prev/next).
       Default (undefined) renders all three, back-compatible. -->
  <div class="flex items-center gap-x-[5px]">
    <!-- frequency -->
    <template v-if="only !== 'rest'">
      <button
        class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        :disabled="!store.userIsDataEntryMember"
        data-tooltip-style="light"
        data-tooltip-target="toggleFrequencyFilterTooltip"
        title="Frequency filter"
        @click="toggleFrequencyModal()"
      >
        <icon-custom-fi-filter class="text-frequency text-[10px] h-5" />
      </button>
      <div
        v-show="!store.userIsDataEntryMember"
        id="toggleFrequencyFilterTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        You do not have permission to filter frequency
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <FrequencyFilterModal
        :visobject="visobject"
        :visible="isFrequencyFilterToggled"
        @emit-filter="$emit('emitFreqFilter', $event)"
        @cancel="toggleFrequencyModal"
      />
    </template>
    <!-- Spectrogram color toggle (2026-07-20): only two palettes exist
         (grayscale / color), so this is a simple on/off toggle rather than a
         dropdown. Highlighted when color is ON. -->
    <button
      v-if="only !== 'freq'"
      class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] transition"
      :class="isColorOn ? 'bg-util-gray-04' : 'bg-util-gray-03 hover:bg-util-gray-04'"
      :title="isColorOn ? 'Color spectrogram (on)' : 'Color spectrogram (off)'"
      :aria-pressed="isColorOn"
      @click="toggleColor"
    >
      <icon-custom-fi-droplet class="text-frequency h-5" />
    </button>
    <!-- download -->
    <button
      v-if="only !== 'freq'"
      class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
      :disabled="!store.userIsDataEntryMember"
      data-tooltip-style="light"
      data-tooltip-target="downloadRecTooltip"
      title="Download recording"
      @click="downloadRecording()"
    >
      <icon-custom-download class="text-frequency h-5" />
    </button>
    <div
      v-show="only !== 'freq' && !store.userIsDataEntryMember"
      id="downloadRecTooltip"
      role="tooltip"
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
    >
      You do not have permission to download recording
      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { getIdToken, useAuth0Client } from '@/_services/auth-client'
import { useStore } from '~/store'
import { type FreqFilter } from '../types'
import FrequencyFilterModal from './frequency-filter-modal.vue'

const props = defineProps<{
  visobject: Visobject
  only?: 'freq' | 'rest'
}>()

const emit = defineEmits<{(event: 'emitColorSpectrogram', value: string): void, (e: 'emitFreqFilter', value: FreqFilter): void}>()

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const VITE_ARBIMON_LEGACY_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

// Only two spectrogram tile palettes exist in the self-hosted storage:
// mtrue (grayscale) + mfalse (color). The AWS-era mfalse_p2/_p3/_p4 palettes
// were never regenerated into storage, so those URLs return the identical
// mfalse image (verified on the ingest tile store 2026-07-20). Removed the
// three dead options rather than show palettes that all render the same.
// (Re-add them if/when the extra palette tiles are batch-regenerated.)
const spectroColors = [
  { name: 'Grayscale', value: 'mtrue', uri: '/images/spectro-gray.png' },
  { name: 'Color', value: 'mfalse', uri: '/images/spectro-blue-pink.png' }
]
const selectedSpectroColor = ref(spectroColors[0])

// Two-state color toggle: color ON = 'mfalse', OFF = 'mtrue' (grayscale).
const isColorOn = computed(() => selectedSpectroColor.value.value !== 'mtrue')
const toggleColor = (): void => {
  const next = isColorOn.value
    ? spectroColors.find(c => c.value === 'mtrue')
    : spectroColors.find(c => c.value === 'mfalse')
  if (next === undefined) return
  selectedSpectroColor.value = next
  localStorage.setItem('visualizer.spectro_color', next.value)
  emit('emitColorSpectrogram', next.value)
}
const defaultColor = ref('mtrue')
const isFrequencyFilterToggled = ref(false)

const getSpectroColor = (): string => {
  // mfalse_p2/_p3/_p4 kept in the allow-list so a user's previously-saved
  // palette preference still resolves (falls through to its image, which is
  // the mfalse render); the picker only offers mtrue + mfalse now.
  const colors = ['mtrue', 'mfalse', 'mfalse_p2', 'mfalse_p3', 'mfalse_p4']
    try {
      const selectedColor = localStorage.getItem('visualizer.spectro_color')
      return selectedColor && colors.includes(selectedColor) ? selectedColor : defaultColor.value
    } catch (e) {
      return defaultColor.value
    }
}

// Bearer-authenticated download (2026-07-20): the /download endpoint is
// behind the legacy "Force login" guard (accepts session idToken OR an
// Authorization: Bearer). A plain <a href> click carries only cookies, so on
// any origin whose legacy session lacks idToken (e.g. the demo tier) it 302s
// to /legacy-login and downloads an HTML page. Fetch WITH the SPA's bearer
// then save the blob — works regardless of legacy session state.
const downloadRecording = async (): Promise<void> => {
  const url = `${VITE_ARBIMON_LEGACY_BASE_URL}/legacy-api/project/${selectedProjectSlug.value}/recordings/download/${props.visobject.id}`
  try {
    const authClient = await useAuth0Client()
    const token = await getIdToken(authClient)
    const resp = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' })
    if (!resp.ok || !(resp.headers.get('content-type') ?? '').match(/audio|octet-stream|flac|wav|mpeg/)) {
      // fall back to a raw navigation (works where the cookie session is valid)
      window.open(url, '_blank')
      return
    }
    const blob = await resp.blob()
    // Filename = the ORIGINAL upload filename (visobject.file, e.g.
    // "Core 2_S4A05603_20190411_012402.wav") with the extension forced to
    // .flac (2026-07-20 operator). Fall back to the recording id if `file`
    // is missing. Strip any existing extension before appending .flac.
    const originalName = (props.visobject.file ?? '').trim()
    const baseName = originalName !== ''
      ? originalName.replace(/\.[^./\\]+$/, '')
      : `recording-${props.visobject.id}`
    const filename = `${baseName}.flac`
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch (e) {
    window.open(url, '_blank')
  }
}

const toggleFrequencyModal = () => {
  isFrequencyFilterToggled.value = !isFrequencyFilterToggled.value
}

onMounted(() => {
  initTooltips()
  const spectroColorFromCache = getSpectroColor()
  spectroColors.forEach(color => {
    if (color.value === spectroColorFromCache) {
      selectedSpectroColor.value = color
    }
})
  localStorage.setItem('visualizer.spectro_color', selectedSpectroColor.value.value)
})
</script>
