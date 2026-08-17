<template>
  <modal-popup
    title="Create a Site"
    modal-body="sm:(my-8 align-middle max-w-lg w-full)"
    @emit-close="onCancel"
  >
    <div class="p-6">
      <div class="flex items-start justify-between gap-x-4">
        <h3 class="text-lg font-semibold text-insight">
          {{ editing ? 'Edit Site' : 'Create a Site' }}
        </h3>
        <button
          class="shrink-0 -mr-1 -mt-1 p-1 rounded text-cloud hover:(text-insight bg-cloud/10) transition-colors"
          title="Close"
          aria-label="Close"
          @click="onCancel"
        >
          <svg
            viewBox="0 0 16 16"
            class="w-4 h-4 fill-none stroke-current"
            stroke-width="1.8"
          ><path
            d="M4 4l8 8M12 4l-8 8"
            stroke-linecap="round"
          /></svg>
        </button>
      </div>

      <p class="text-sm text-cloud mt-1">
        A site is a recording location. Every recording you upload belongs to one.
      </p>

      <!-- SITE NAME -->
      <div class="mt-5">
        <label
          for="site-form-name"
          class="block text-sm text-insight"
        >Site name</label>
        <input
          id="site-form-name"
          ref="nameInput"
          v-model="siteName"
          type="text"
          placeholder="e.g. Boger Creek North"
          class="mt-1.5 w-full rounded-lg bg-moss border-util-gray-03 text-insight px-3 py-2 text-sm focus:(border-frequency ring-1 ring-frequency outline-none)"
          required
          @keydown.enter.prevent="onSave"
        >
        <p
          v-if="siteNameError"
          class="text-flamingo text-xs mt-1"
        >
          Please fill in the site name.
        </p>
      </div>

      <!-- EXCLUDE FROM INSIGHTS. Mirrors the inline form: when checked, the
           coordinate fields are disabled and no longer required. That coupling
           is the whole reason this checkbox sits ABOVE the location block. -->
      <div class="mt-4">
        <label class="flex items-start gap-x-2 text-sm cursor-pointer select-none">
          <input
            v-model="hidden"
            type="checkbox"
            class="rounded border-cloud/40 bg-pitch shrink-0 mt-0.5"
          >
          <span class="text-insight">Exclude this site from Arbimon Insights</span>
        </label>
        <p class="text-xs text-cloud mt-1 ml-6">
          For test sites, or sites used to import external templates.
          <a
            href="https://help.arbimon.org/article/206-adding-a-site"
            target="_blank"
            rel="noopener"
            class="text-frequency underline"
          >Learn more</a>
        </p>
      </div>

      <!-- LOCATION -->
      <div class="mt-5">
        <div class="text-sm text-insight">
          Location
        </div>
        <p
          v-if="siteLatLonError && !hidden"
          class="text-flamingo text-xs mt-1"
        >
          Please fill in latitude and longitude, or check “Exclude this site from Arbimon Insights”.
        </p>

        <div
          v-for="field in coordinateFields"
          :key="field.key"
          class="mt-2"
        >
          <div class="flex flex-row">
            <div
              class="flex items-center justify-center rounded-l-lg border border-r-0 border-util-gray-03 bg-moss px-3 text-sm text-cloud w-16 shrink-0"
              :class="hidden ? 'opacity-50' : ''"
            >
              {{ field.label }}
            </div>
            <input
              :id="`site-form-${field.key}`"
              v-model="field.model.value"
              type="text"
              :placeholder="field.placeholder"
              :disabled="hidden"
              class="w-full rounded-r-lg border border-util-gray-03 bg-moss text-insight px-3 py-2 text-sm focus:(border-frequency ring-1 ring-frequency outline-none)"
              :class="hidden ? 'opacity-50 cursor-not-allowed' : ''"
              @keydown.enter.prevent="onSave"
            >
          </div>
          <p
            v-if="field.error() && !hidden"
            class="text-flamingo text-xs mt-1"
          >
            {{ field.errorText() }}
          </p>
        </div>
      </div>

      <!-- SERVER-SIDE failure. Shown INSIDE the modal rather than closing it,
           so the user does not lose everything they typed to a transient error
           (the inline form closes on error, which is what this fixes). -->
      <div
        v-if="submitError !== undefined"
        class="mt-4 rounded-lg border border-flamingo/30 bg-flamingo/10 px-3 py-2 text-sm text-flamingo"
      >
        {{ submitError }}
      </div>

      <div class="mt-6 flex items-center justify-end gap-x-3">
        <button
          class="btn btn-secondary text-sm"
          type="button"
          :disabled="saving"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary text-sm disabled:btn-disabled disabled:hover:btn-disabled disabled:cursor-not-allowed"
          type="button"
          :disabled="saving"
          @click="onSave"
        >
          {{ saving ? 'Saving…' : (editing ? 'Save Site' : 'Create Site') }}
        </button>
      </div>
    </div>
  </modal-popup>
</template>

<script setup lang="ts">
/**
 * SITE FORM MODAL — a self-contained, reusable site create/edit dialog.
 *
 * DELIBERATELY INDEPENDENT OF THE UPLOADER (operator 2026-08-14). It lives in
 * `_components/`, imports nothing from `projects/import-recordings/`, and knows
 * nothing about upload queues or sections. Its entire contract is:
 *
 *   props:  projectSlug, projectCoreId, (optional) editing + site
 *   emits:  close                — user dismissed, nothing changed
 *           created(SiteSaved)   — a site was created
 *           updated(SiteSaved)   — an existing site was edited
 *
 * That is what lets the uploader use it today and any other page use it later
 * without either side growing a dependency on the other.
 *
 * FUNCTIONAL MIRROR of `projects/audiodata/component/create-edit-site.vue`
 * (operator: mirror what the inline form does, improve later). Same fields,
 * same validation rules, same API calls:
 *   - name required
 *   - lat/lon required UNLESS "hidden" (exclude from Insights) is checked
 *   - lat within ±85, lon within ±180, alt optional but numeric
 *   - lat === 0 && lon === 0 silently implies hidden (a legacy convention that
 *     is preserved here because the backend relies on it)
 *
 * TWO DELIBERATE IMPROVEMENTS over the inline original, both about not losing
 * the user's work:
 *   1. a SERVER error renders inside the modal instead of closing it — the
 *      inline form emits `close('error')` and the user re-types everything;
 *   2. the save button disables while in flight, so a double-click cannot
 *      create two sites (the inline form has no such guard).
 */
import { type AxiosInstance } from 'axios'
import { computed, nextTick, onMounted, ref } from 'vue'

import { type SiteResponse, apiLegacySiteCreate, apiLegacySiteUpdate } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import ModalPopup from '@/_components/modal-popup.vue'

export interface SiteSaved {
  name: string
  lat?: number
  lon?: number
  alt?: number
  hidden: boolean
}

const props = withDefaults(defineProps<{
  /** Arbimon project slug — the legacy API is scoped by it. */
  projectSlug: string
  /** Core (bio) project id, sent as `project_id` on create. */
  projectCoreId?: string
  /** Legacy Arbimon API client (injected by the host page, not by this file). */
  apiClient: AxiosInstance
  editing?: boolean
  site?: SiteResponse
}>(), {
  projectCoreId: '',
  editing: false,
  site: undefined
})

/* eslint-disable func-call-spacing -- defineEmits is a COMPILER MACRO; the
   call-signature syntax inside its generic is required, and the rule
   misreads each `(e: ...)` signature as a spaced function call. */
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', site: SiteSaved): void
  (e: 'updated', site: SiteSaved): void
}>()
/* eslint-enable func-call-spacing */

const siteName = ref(props.site?.name ?? '')
const lat = ref(props.site?.lat != null ? String(props.site.lat) : '')
const lon = ref(props.site?.lon != null ? String(props.site.lon) : '')
const alt = ref(props.site?.alt != null ? String(props.site.alt) : '')
const hidden = ref(props.site?.hidden === 1)

const siteNameError = ref(false)
const siteLatError = ref(false)
const siteLonError = ref(false)
const siteLatLonError = ref(false)
const siteLatFormatError = ref(false)
const siteLonFormatError = ref(false)
const altFormatError = ref(false)

const saving = ref(false)
const submitError = ref<string | undefined>(undefined)

const nameInput = ref<HTMLInputElement>()

// Focus the first field on open: a modal that appears without focus leaves
// keyboard users stranded outside it.
onMounted(() => { void nextTick(() => nameInput.value?.focus()) })

/**
 * The three coordinate rows are structurally identical, so they are driven by
 * data rather than copy-pasted three times — the inline original repeats the
 * same 20-line block three times, which is how its `id="lonInput"` ended up
 * duplicated onto all three inputs (a real a11y defect: a <label>'s `for`
 * cannot address a duplicated id).
 */
const coordinateFields = computed(() => [
  {
    key: 'lat',
    label: 'Lat',
    placeholder: 'Latitude',
    model: lat,
    error: () => siteLatError.value || siteLatFormatError.value,
    errorText: () => siteLatError.value
      ? 'Please fill in latitude, or check “Exclude this site from Arbimon Insights”.'
      : 'Please enter a latitude between -85 and 85.'
  },
  {
    key: 'lon',
    label: 'Lon',
    placeholder: 'Longitude',
    model: lon,
    error: () => siteLonError.value || siteLonFormatError.value,
    errorText: () => siteLonError.value
      ? 'Please fill in longitude, or check “Exclude this site from Arbimon Insights”.'
      : 'Please enter a longitude between -180 and 180.'
  },
  {
    key: 'alt',
    label: 'El',
    placeholder: 'Elevation (optional)',
    model: alt,
    error: () => altFormatError.value,
    errorText: () => 'Please enter a valid elevation number (e.g. 123.45).'
  }
])

/** Validation — a faithful port of create-edit-site.vue's `create()` guard. */
const validate = (): boolean => {
  const validNumberRegex = /^-?\d+(\.\d+)?$/
  siteLatFormatError.value = false
  siteLonFormatError.value = false
  altFormatError.value = false
  siteNameError.value = siteName.value === ''

  if (!hidden.value) {
    siteLatError.value = lat.value === ''
    siteLonError.value = lon.value === ''
    // Both missing reads as one message about the pair, not two about halves.
    if (siteLatError.value && siteLonError.value) {
      siteLonError.value = false
      siteLatError.value = false
      siteLatLonError.value = true
    } else {
      siteLatLonError.value = false
    }
    if (lat.value !== '') {
      siteLatFormatError.value = !validNumberRegex.test(lat.value) ||
        parseFloat(lat.value) > 85 || parseFloat(lat.value) < -85
    }
    if (lon.value !== '') {
      siteLonFormatError.value = !validNumberRegex.test(lon.value) ||
        parseFloat(lon.value) > 180 || parseFloat(lon.value) < -180
    }
    if (alt.value !== '') {
      altFormatError.value = !validNumberRegex.test(alt.value)
    }
    return !(siteLatError.value || siteLonError.value || siteNameError.value ||
      siteLatLonError.value || siteLatFormatError.value || siteLonFormatError.value ||
      altFormatError.value)
  }
  return !siteNameError.value
}

const onCancel = (): void => {
  if (saving.value) return // never dismiss mid-flight; the request is already out
  emit('close')
}

const onSave = async (): Promise<void> => {
  if (saving.value) return
  submitError.value = undefined
  if (!validate()) return

  // Legacy convention preserved: 0,0 means "no real location", which the
  // backend treats as hidden. Kept because the server relies on it.
  if (lat.value === '0' && lon.value === '0') hidden.value = true

  saving.value = true
  try {
    if (props.editing) {
      await apiLegacySiteUpdate(props.apiClient, props.projectSlug, {
        site_id: props.site?.id ?? 0,
        name: siteName.value,
        lat: lat.value,
        lon: lon.value,
        alt: alt.value,
        external_id: props.site?.external_id ?? '',
        hidden: hidden.value ? 1 : 0
      } as never)
      emit('updated', saved())
      return
    }

    const response = await apiLegacySiteCreate(props.apiClient, props.projectSlug, {
      name: siteName.value,
      project_id: props.projectCoreId,
      hidden: hidden.value ? 1 : 0,
      ...(lat.value !== '' && { lat: parseFloat(lat.value) }),
      ...(lon.value !== '' && { lon: parseFloat(lon.value) }),
      ...(alt.value !== '' && { alt: parseFloat(alt.value) })
    } as never)

    // The legacy endpoint reports failure IN THE BODY with a 200, and the body
    // is sometimes a JSON *string*. Both shapes are handled, exactly as the
    // inline form does — dropping either one turns a real failure into a
    // silent success.
    let body: { error?: string } = {}
    if (typeof response.data === 'string') {
      try { body = JSON.parse(response.data) } catch { body = {} }
    } else if (typeof response.data === 'object' && response.data !== null) {
      body = response.data as { error?: string }
    }
    if (body.error !== undefined && body.error !== '') {
      submitError.value = body.error
      return
    }
    emit('created', saved())
  } catch (e) {
    submitError.value = e instanceof Error && e.message !== ''
      ? e.message
      : 'Could not save this site. Please try again.'
  } finally {
    saving.value = false
  }
}

const saved = (): SiteSaved => ({
  name: siteName.value,
  ...(lat.value !== '' && { lat: parseFloat(lat.value) }),
  ...(lon.value !== '' && { lon: parseFloat(lon.value) }),
  ...(alt.value !== '' && { alt: parseFloat(alt.value) }),
  hidden: hidden.value
})
</script>
