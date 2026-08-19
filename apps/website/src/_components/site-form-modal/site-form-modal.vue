<template>
  <modal-popup
    title="Create a Site"
    modal-body="sm:(my-8 align-middle max-w-4xl w-full)"
    @emit-close="onCancel"
  >
    <!-- TWO-COLUMN layout (workstream C part 2, 2026-08-19): form left, map
         right. The modal doubled max-w-lg → max-w-4xl to make room. On small
         screens the map stacks BELOW the form — the form is the actionable
         half and must stay first in DOM/tab order either way. -->
    <div class="relative p-6 md:(grid grid-cols-2 gap-x-6)">
      <!-- Close [x]: far top-right corner of the MODAL (operator 2026-08-19 #6),
           absolutely positioned on the modal body rather than inside the
           left-column header, so it stays in the corner at every width. -->
      <button
        class="absolute top-3 right-3 z-10 p-1 rounded text-cloud hover:(text-insight bg-cloud/10) transition-colors"
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
      <div>
      <h3 class="text-lg font-semibold text-insight">
        {{ editing ? 'Edit Site' : 'Create a Site' }}
      </h3>

      <p class="text-sm text-cloud mt-1">
        A site is a location on earth. Every recording must belong to one.
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
        <!-- Sub-description deliberately SMALLER than text-xs so it stays on one
             line (operator 2026-08-19 #2). Inline font-size because this
             WindiCSS build has no preset below text-xs and arbitrary-value
             utilities are unreliable here (see §7 traps). -->
        <p
          class="text-cloud mt-1 ml-6 leading-tight whitespace-nowrap"
          style="font-size: 11px"
        >
          For test sites, or sites used to import external templates.
          <a
            href="https://help.arbimon.org/article/206-adding-a-site"
            target="_blank"
            rel="noopener"
            class="text-frequency underline"
          >Learn more</a>
        </p>
      </div>

      <!-- GEO-LOCATION (operator 2026-08-19 #3): Latitude + Longitude as two
           columns on one row, labels ABOVE the fields. Decimal degrees only
           for now — alternate entry formats (DMS etc.) are an agreed LATER
           step; storage stays float either way. -->
      <div class="mt-5">
        <div class="text-sm text-insight">
          Geo-Location
        </div>
        <p
          v-if="siteLatLonError && !hidden"
          class="text-flamingo text-xs mt-1"
        >
          Please fill in latitude and longitude, or check “Exclude this site from Arbimon Insights”.
        </p>

        <div class="mt-2 grid grid-cols-2 gap-x-3">
          <div>
            <label
              for="site-form-lat"
              class="block text-xs text-cloud"
              :class="hidden ? 'opacity-50' : ''"
            >Latitude</label>
            <input
              id="site-form-lat"
              v-model="lat"
              type="text"
              placeholder="e.g. 9.6301"
              :disabled="hidden"
              class="mt-1 w-full rounded-lg border border-util-gray-03 bg-moss text-insight px-3 py-2 text-sm focus:(border-frequency ring-1 ring-frequency outline-none)"
              :class="hidden ? 'opacity-50 cursor-not-allowed' : ''"
              @keydown.enter.prevent="onSave"
            >
            <p
              v-if="(siteLatError || siteLatFormatError) && !hidden"
              class="text-flamingo text-xs mt-1"
            >
              {{ siteLatError ? 'Latitude is required.' : 'Enter a latitude between -85 and 85.' }}
            </p>
          </div>
          <div>
            <label
              for="site-form-lon"
              class="block text-xs text-cloud"
              :class="hidden ? 'opacity-50' : ''"
            >Longitude</label>
            <input
              id="site-form-lon"
              v-model="lon"
              type="text"
              placeholder="e.g. -82.9464"
              :disabled="hidden"
              class="mt-1 w-full rounded-lg border border-util-gray-03 bg-moss text-insight px-3 py-2 text-sm focus:(border-frequency ring-1 ring-frequency outline-none)"
              :class="hidden ? 'opacity-50 cursor-not-allowed' : ''"
              @keydown.enter.prevent="onSave"
            >
            <p
              v-if="(siteLonError || siteLonFormatError) && !hidden"
              class="text-flamingo text-xs mt-1"
            >
              {{ siteLonError ? 'Longitude is required.' : 'Enter a longitude between -180 and 180.' }}
            </p>
          </div>
        </div>

        <!-- ELEVATION (operator 2026-08-19 #4): labelled with units; numeric
             entry stays authoritative, plus a slider spanning ±250 m around
             the API-estimated ground elevation at the current lat/lon
             (open-meteo, no key, failure-tolerant: no estimate ⇒ no slider,
             the numeric field alone). The caption explains exactly what the
             slider is relative to, so the "what is this?" moment is answered
             in place. -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-x-3">
            <label
              for="site-form-alt"
              class="block text-xs text-cloud"
              :class="hidden ? 'opacity-50' : ''"
            >Elevation (meters)</label>
            <input
              id="site-form-alt"
              v-model="alt"
              type="text"
              placeholder="optional"
              :disabled="hidden"
              class="w-28 rounded-lg border border-util-gray-03 bg-moss text-insight px-3 py-1.5 text-sm text-right focus:(border-frequency ring-1 ring-frequency outline-none)"
              :class="hidden ? 'opacity-50 cursor-not-allowed' : ''"
              @keydown.enter.prevent="onSave"
            >
          </div>
          <p
            v-if="altFormatError && !hidden"
            class="text-flamingo text-xs mt-1"
          >
            Please enter a valid elevation number (e.g. 123.45).
          </p>
          <template v-if="groundElevation !== undefined && !hidden">
            <input
              type="range"
              :min="elevSliderMin"
              :max="elevSliderMax"
              step="1"
              :value="elevSliderValue"
              class="w-full mt-2 accent-frequency cursor-pointer"
              aria-label="Elevation slider, within 250 meters of ground level"
              @input="onElevSlider"
            >
            <div
              class="flex justify-between text-cloud/70 leading-tight"
              style="font-size: 10px"
            >
              <span>{{ elevSliderMin }} m</span>
              <span class="text-cloud">ground ≈ {{ groundElevation }} m at this location · slide or type an exact value</span>
              <span>{{ elevSliderMax }} m</span>
            </div>
          </template>
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
        <!-- Primary button (operator 2026-08-19 #5): 'Create Site' for a new
             site, 'Save Changes' when editing; gray/inert until something has
             actually changed (isDirty compares against the opening values, so
             editing a field and reverting it re-disables the button). -->
        <button
          class="btn text-sm"
          :class="(saving || !isDirty) ? 'btn-disabled cursor-not-allowed opacity-60' : 'btn-primary'"
          type="button"
          :disabled="saving || !isDirty"
          @click="onSave"
        >
          {{ saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Site') }}
        </button>
      </div>
      </div>

      <!-- MAP column (workstream C part 2). Centred on a HIGHLIGHTED pin for
           the site being edited/created; the project's OTHER sites appear
           unhighlighted and are deliberately NOT clickable (no click handler
           is registered — this dialog edits ONE site; selecting another here
           would silently retarget the form). The pin follows the lat/lon
           fields as they are edited, and a no-coordinates site (or a fresh
           create) shows the sibling-site overview instead of a pin. -->
      <div class="mt-6 md:mt-0">
        <div
          ref="mapRoot"
          class="w-full h-72 md:h-full min-h-72 rounded-lg overflow-hidden border border-util-gray-03"
        />
        <p
          v-if="!hasValidCoords"
          class="text-xs text-cloud mt-2"
        >
          {{ hidden ? 'This site is excluded from Insights and needs no location.' : 'Enter latitude and longitude to place this site on the map.' }}
        </p>
      </div>

      <!-- SITE FACTS strip (operator 2026-08-19 #7): read-only reference
           across the modal bottom — spans both columns. Only when EDITING: a
           new site has no history. Values come from the SiteResponse the host
           passed (rec_count / recording range need the sites list fetched
           with count:true, which the uploader does). `Created` is rendered
           only when the payload carries it — the legacy sites endpoint does
           NOT return a creation date today (SiteResponse has updated_at
           only); surfacing it needs a small legacy-api addition. -->
      <div
        v-if="editing && site !== undefined"
        class="md:col-span-2 mt-5 border-t border-util-gray-03 pt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-cloud"
      >
        <span><span class="text-cloud/60">Recordings:</span> {{ site.rec_count != null ? site.rec_count.toLocaleString() : '—' }}</span>
        <span><span class="text-cloud/60">Recording range:</span> {{ recordingRangeLabel }}</span>
        <span><span class="text-cloud/60">Timezone:</span> {{ site.timezone !== '' ? site.timezone : '—' }}</span>
        <span v-if="createdLabel !== undefined"><span class="text-cloud/60">Created:</span> {{ createdLabel }}</span>
        <span><span class="text-cloud/60">Last modified:</span> {{ lastModifiedLabel }}</span>
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
import type { FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { type SiteResponse, apiArbimonGetSites, apiLegacySiteCreate, apiLegacySiteUpdate } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import defaultMarkerIcon from '@/_assets/explore/map-marker.png'
import selectedMarkerIcon from '@/_assets/explore/map-marker-selected.png'
import ModalPopup from '@/_components/modal-popup.vue'
import { createMap } from '@/_services/maps'

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

// (The data-driven coordinateFields loop was retired 2026-08-19: the operator
// asked for Latitude/Longitude as two labelled columns on one row and
// Elevation as its own labelled row with a slider — three structurally
// DIFFERENT blocks now, so a shared loop no longer earns its indirection.
// The unique-id-per-input a11y fix it existed for is preserved:
// site-form-lat / site-form-lon / site-form-alt.)

// -- DIRTY TRACKING (operator 2026-08-19 #5) ----------------------------------
// The primary button stays inert until a value has actually changed vs the
// OPENING state, and re-disables if the user reverts their edits. Numeric
// noise ('1.50' vs '1.5') is not normalised deliberately — a re-typed exact
// value that parses identically would still be sent, and treating it as a
// change errs on the harmless side.
const initial = {
  name: siteName.value,
  lat: lat.value,
  lon: lon.value,
  alt: alt.value,
  hidden: hidden.value
}
const isDirty = computed(() =>
  siteName.value !== initial.name ||
  lat.value !== initial.lat ||
  lon.value !== initial.lon ||
  alt.value !== initial.alt ||
  hidden.value !== initial.hidden
)

// -- GROUND ELEVATION + SLIDER (operator 2026-08-19 #4) -----------------------
// The slider spans ±250 m around the API-estimated ground elevation at the
// current lat/lon. Provider: open-meteo elevation API (free, no key, CORS-
// enabled, Copernicus DEM 90 m). Strictly progressive enhancement: any
// failure ⇒ groundElevation stays undefined ⇒ no slider renders and the
// numeric field carries on alone. Fetches are debounced and keyed by the
// rounded coordinate so map-nudge micro-changes don't spam the API.
const groundElevation = ref<number | undefined>(undefined)
let elevFetchTimer: ReturnType<typeof setTimeout> | undefined
let lastElevKey = ''

const fetchGroundElevation = async (): Promise<void> => {
  const coords = liveCoords.value
  if (coords === undefined) { groundElevation.value = undefined; return }
  const key = `${coords[1].toFixed(4)},${coords[0].toFixed(4)}`
  if (key === lastElevKey) return
  lastElevKey = key
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${coords[1]}&longitude=${coords[0]}`)
    if (!res.ok) return
    const body = await res.json() as { elevation?: number[] }
    const elev = body.elevation?.[0]
    if (typeof elev === 'number' && Number.isFinite(elev)) groundElevation.value = Math.round(elev)
  } catch {
    // no estimate ⇒ no slider; the numeric field is unaffected
  }
}

const elevSliderMin = computed(() => (groundElevation.value ?? 0) - 250)
const elevSliderMax = computed(() => (groundElevation.value ?? 0) + 250)
const elevSliderValue = computed(() => {
  const typed = parseFloat(alt.value)
  if (Number.isFinite(typed)) {
    return Math.min(elevSliderMax.value, Math.max(elevSliderMin.value, typed))
  }
  return groundElevation.value ?? 0
})
const onElevSlider = (event: Event): void => {
  alt.value = (event.target as HTMLInputElement).value
}

// -- SITE FACTS strip labels (operator 2026-08-19 #7) -------------------------
const factDate = (value: string | null | undefined): string | undefined => {
  if (typeof value !== 'string' || value === '') return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
const recordingRangeLabel = computed(() => {
  const from = factDate(props.site?.first_recording_at)
  const to = factDate(props.site?.last_recording_at)
  if (from === undefined || to === undefined) return '—'
  return from === to ? from : `${from} – ${to}`
})
// SiteResponse has no created_at today (legacy endpoint gap — see the
// template note); render Created only if a future payload carries one.
const createdLabel = computed(() => factDate((props.site as unknown as { created_at?: string })?.created_at))
const lastModifiedLabel = computed(() => factDate(props.site?.updated_at) ?? '—')

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

// -- MAP (workstream C part 2, 2026-08-19) ------------------------------------
//
// The modal fetches the project's sibling sites ITSELF (operator decision
// 2026-08-19: option b — self-contained over prop-threading). One GET per
// open; a failure degrades to a map with just the edited site's pin — the
// form never depends on the map.
//
// Layer semantics (mirrors map-view.vue's two-source pattern):
//   • 'sibling-sites'  → default-marker, NO event handlers — context only,
//     deliberately unselectable (this dialog edits ONE site).
//   • 'edited-site'    → selected-marker, follows the lat/lon FIELDS live so
//     the user sees where their coordinates actually land.

const mapRoot = ref<HTMLElement | null>(null)
let map: MapboxMap | undefined
const mapLoaded = ref(false)
const siblingSites = ref<SiteResponse[]>([])

const validNum = (value: string): boolean => /^-?\d+(\.\d+)?$/.test(value)

/** The edited site's coordinates AS CURRENTLY TYPED (not as stored). */
const liveCoords = computed((): [number, number] | undefined => {
  if (!validNum(lat.value) || !validNum(lon.value)) return undefined
  const la = parseFloat(lat.value)
  const lo = parseFloat(lon.value)
  if (la > 85 || la < -85 || lo > 180 || lo < -180) return undefined
  if (la === 0 && lo === 0) return undefined // legacy "no real location" convention
  return [lo, la]
})

const hasValidCoords = computed(() => liveCoords.value !== undefined)

/** Siblings = every OTHER site in the project with real coordinates. */
const siblingFeatures = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: siblingSites.value
    .filter(site => site.id !== props.site?.id)
    .filter(site => site.lat != null && site.lon != null && !(site.lat === 0 && site.lon === 0))
    .map(site => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [site.lon, site.lat] },
      properties: { title: site.name }
    }))
})

const editedFeature = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: liveCoords.value === undefined
    ? []
    : [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: liveCoords.value },
        properties: { title: siteName.value }
      }]
})

/** Frame the view: the edited pin when it exists (siblings included when in
 * range), else all siblings, else a world view. fitBounds precedent:
 * projects/audiodata/component/map-view.vue. */
const frameView = (): void => {
  if (map === undefined) return
  const sibs = siblingFeatures().features.map(f => (f.geometry as Point).coordinates as [number, number])
  if (liveCoords.value !== undefined) {
    map.jumpTo({ center: liveCoords.value, zoom: 12 })
  } else if (sibs.length > 0) {
    const lons = sibs.map(c => c[0]); const lats = sibs.map(c => c[1])
    map.fitBounds([Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)], { padding: 48, maxZoom: 12, duration: 0 })
  } else {
    map.jumpTo({ center: [0, 0], zoom: 1 })
  }
}

const syncMapData = (): void => {
  if (map === undefined || !mapLoaded.value) return
  ;(map.getSource('sibling-sites') as GeoJSONSource | undefined)?.setData(siblingFeatures())
  ;(map.getSource('edited-site') as GeoJSONSource | undefined)?.setData(editedFeature())
}

onMounted(() => {
  if (mapRoot.value === null) return
  map = createMap({
    container: mapRoot.value,
    style: 'mapbox://styles/mapbox/satellite-v9',
    attributionControl: false,
    center: liveCoords.value ?? [0, 0],
    zoom: liveCoords.value !== undefined ? 12 : 1,
    maxZoom: 18,
    minZoom: 1
  })
  map.on('load', () => {
    if (map === undefined) return
    const markers: Record<string, string> = {
      'default-marker': defaultMarkerIcon,
      'selected-marker': selectedMarkerIcon
    }
    Object.entries(markers).forEach(([name, imagePath]) => {
      map?.loadImage(imagePath, (error, image) => {
        if (error != null || map === undefined || map.hasImage(name) || image === undefined) return
        map.addImage(name, image)
      })
    })
    map.addSource('sibling-sites', { type: 'geojson', data: siblingFeatures() })
    map.addSource('edited-site', { type: 'geojson', data: editedFeature() })
    // Siblings UNDER the edited pin; icon-allow-overlap so a dense project
    // cannot hide the pin the user is editing.
    map.addLayer({
      id: 'sibling-sites',
      type: 'symbol',
      source: 'sibling-sites',
      layout: { 'icon-image': 'default-marker', 'icon-size': 0.45, 'icon-allow-overlap': true },
      paint: { 'icon-opacity': 0.7 }
    })
    map.addLayer({
      id: 'edited-site',
      type: 'symbol',
      source: 'edited-site',
      layout: { 'icon-image': 'selected-marker', 'icon-size': 0.6, 'icon-allow-overlap': true }
    })
    mapLoaded.value = true
    frameView()
  })

  // Sibling fetch — after map setup so a slow request never delays the dialog.
  void (async () => {
    try {
      const response = await apiArbimonGetSites(props.apiClient, props.projectSlug, {})
      siblingSites.value = response ?? []
      syncMapData()
      if (liveCoords.value === undefined) frameView() // nothing pinned yet → frame the siblings
    } catch {
      // context only — the form (and the edited pin) work without siblings
    }
  })()
})

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
})

// The pin follows the fields as they are edited; re-centre on a NEW valid
// position so the user sees where the coordinates landed. The ground-elevation
// estimate re-fetches on the same signal, debounced 800 ms so per-keystroke
// intermediate coordinates don't each hit the API.
watch(liveCoords, (coords, previous) => {
  syncMapData()
  if (map !== undefined && coords !== undefined && (previous === undefined || coords[0] !== previous[0] || coords[1] !== previous[1])) {
    map.easeTo({ center: coords, zoom: Math.max(map.getZoom(), 10) })
  }
  if (elevFetchTimer !== undefined) clearTimeout(elevFetchTimer)
  elevFetchTimer = setTimeout(() => { void fetchGroundElevation() }, 800)
}, { immediate: true })
</script>
