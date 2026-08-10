import type { AxiosInstance, AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'

dayjs.extend(localeData)

export interface TagParams {
  id?: number
  text?: string
  f0?: number
  f1?: number
  t0?: number
  t1?: number
}

export interface RecordingTagSearchParams {
  q: string
}

export interface RecordingTagResponse {
  datetime: string
  f0: number | null
  f1: number | null
  id: number
  t0: number | null
  t1: number | null
  tag: string
  tag_id: number
  user_id: number
}

export interface TagDeleteResponse {
  affectedRows: number
  changedRows: number
  fieldCount: number
  insertId: number
  message: string
  protocol41: boolean
  serverStatus: number
  warningCount: number
}

export interface RecordingSearchParams {
  limit?: number
  offset?: number
  key: string
  show: string
}

export interface RecordingValidateParams {
  class: string
  val: number
  determinedFrom: string
}

export interface RecordingValidateResponse {
  project_id: number
  recording: number
  songtype: number
  species: number
  user: number
  val: number
}

export interface Recording {
  bit_rate: string
  datetime: string
  datetime_utc: string
  duration: number
  external_id: string
  file: string
  file_size: number
  id: number
  meta: any
  mic: string
  precision: number
  recorder: string
  sample_encoding: string
  sample_rate: number
  samples: number
  site: string
  site_id: number
  thumbnail: string
  timezone: string
  uri: string
  version: string
  isDisabled?: boolean
}

interface TileSet {
  dhz: number
  ds: number
  h: number
  hz: number
  i: number
  j: number
  s: number
  w: number
  x: number
  y: number
  src: string
  crisp?: boolean
  // Signed media-api credential, minted SERVER-SIDE per tile (#99 Track B).
  // Present only for non-legacy recordings when the server has the salt
  // configured; absent => fall back to the session-gated legacy proxy.
  //
  // `mediaStart`/`mediaEnd` are the glued UTC timestamps the filename MUST
  // use verbatim: media-api re-parses the window out of the filename and the
  // token is signed over exactly those integers. Re-deriving them here would
  // reintroduce the 2026-08-10 fractional-millisecond 401 defect.
  mediaStreamId?: string
  mediaStart?: string
  mediaEnd?: string
  mediaToken?: string
  mediaExp?: number
}

interface Tiles {
  set: TileSet[]
  x: number
  y: number
}

export interface Validation {
  id: number
  present: number
  presentAed: number
  presentReview: number
  songtype: number
  species: number
  user: number
}

export interface Visobject extends Recording {
  isDisabled: boolean
  aedValidations: any[]
  audioUrl: string
  contrast: number
  explorerUrl: string
  ext: string
  imageUrl: string
  legacy: boolean
  spectroColor: string
  tiles: Tiles
  validations: Validation[]
  span: number
  max_freq: number
  domain: any
  scale: any
  offset: any
  spectrogram: any
  type: string
  zoom: any
}

export type RecordingResponse = Recording[]
export type VisobjectResponse = Visobject

interface FrequencyCache {
  originalScale: boolean
}

const getSelectedFrequencyCache = (): FrequencyCache => {
  try {
    return JSON.parse(localStorage.getItem('visuilizer.frequencies.cache') ?? '{originalScale: true}')
  } catch (e) {
    return { originalScale: true }
  }
}

const getSpectroColor = (): string => {
  const colors = ['mtrue', 'mfalse', 'mfalse_p2', 'mfalse_p3', 'mfalse_p4']
  try {
    const selectedColor = localStorage.getItem('visualizer.spectro_color')
    return selectedColor && colors.includes(selectedColor) ? selectedColor : 'mtrue'
  } catch (e) {
    return 'mtrue'
  }
}

const khzFormat = function (v: number): number { return (v / 1000) | 0 }

const fetchRecording = (response: AxiosResponse<Visobject, any>): Visobject => {
  const recording = response.data
  const scaleCache = getSelectedFrequencyCache()
  const maxFreq = recording.sample_rate / 2
  const span = scaleCache.originalScale ? maxFreq : (maxFreq > 24000 ? maxFreq : 24000)
  const visobject = {
    ...recording,
    type: 'rec',
    max_freq: recording.sample_rate / 2,
    span,
    domain: {
      x: {
        from: 0,
        to: recording.duration,
        span: recording.duration,
        unit: 'Time ( s )',
        ticks: 60
      },
      y: {
        from: 0,
        to: span,
        span,
        unit: 'Frequency ( kHz )',
        tick_format: khzFormat
      }
    },
    scale: {
      def_sec2px: 100 / 1.0,
      def_hz2px: 100 / 5000.0,
      max_sec2px: 100 / (1.0 / 8),
      max_hz2px: 100 / (5000.0 / 8),
      zoom: { x: 0, y: 0 },
      sec2px: 100 / 1.0,
      hz2px: 100 / 5000.0,
      originalScale: scaleCache.originalScale
    },
    offset: {
      sec: 0,
      hz: 0
    }
  }
  if (!recording.tiles.set.length) {
    visobject.isDisabled = true
    return visobject
  }

  const spectroColoredCache = getSpectroColor()

  // const randomString = Math.round(Math.random() * 100000000)
  visobject.tiles.set.forEach(function (tile) {
    if (recording.legacy) {
      // TODO: update this part for the legacy recordings
      // tile.src = `/legacy-api/project/${Project.getUrl()}/recordings/tiles/${recording.id}/${tile.i}/${tile.j}/${randomString}`
    } else {
      // TILE SOURCE RESOLUTION (2026-08-10). Was `d1023.255`, which did NOT match
      // the shape the tile is actually DISPLAYED at.
      //
      // A tile covers ~5.967 s x 23,906 Hz and renders at ~597 x 478 px at
      // default zoom (sec2px 100, hz2px 100/5000) — a ~1.25:1 box, NOT the ~4:1
      // strip the old source implies. So 1023x255 was being scaled 1.71x DOWN
      // horizontally while being stretched 1.87x UP vertically: we shipped
      // pixels nobody saw on one axis and invented them on the other. The
      // stretch is especially visible because `.crisp-image` sets
      // `image-rendering: pixelated`, so upscaling is NOT smoothed — it blocks.
      //
      // 512x1024 removes the upscale entirely (1.17x up W / 2.14x down H) for
      // ~2x the bytes. Measured over the real 11-tile page against live
      // media-api: 3.54 MiB and 129 ms warm median, vs 1.80 MiB / 113 ms before
      // — and it was the FASTEST cold render of every candidate tested
      // (590 ms median, 754 ms max).
      //
      // Height 1024 is the CEILING: media-api's checkAttrsValidity rejects
      // d>1024 with `Spectrogram height can not be greater than 1024px` (400).
      // Internally sox renders at a power-of-two+1 (1025) and ImageMagick
      // resizes back, so 1024 costs the same as 1020.
      //
      // KNOWN TRADE-OFF: at MAX zoom (sec2px 800) 512px wide is a 9.3x
      // horizontal upscale, worse than the old 4.67x. If zoomed-in inspection
      // becomes a common workflow, 1280x1024 is the balanced alternative
      // (2.15x/2.14x down at default, 3.73x/3.74x up at max) at 8.16 MiB /
      // 143 ms warm.
      //
      // SAFE TO CHANGE FROM THE CLIENT: dimensions are NOT part of the signed
      // message (the token binds stream+start+end+exp only), exactly like the
      // palette — so this needs no server change and no re-mint. It IS part of
      // the media-api cache key, so changing it re-fills the `spec` cache.
      const renderAttrs = `z95_wdolph_g1_fspec_${spectroColoredCache}_d512.1024.png`

      if (tile.mediaToken !== undefined && tile.mediaStart !== undefined && tile.mediaEnd !== undefined) {
        // TRACK B (#99): go DIRECT to media-api, skipping the arbimon-legacy
        // media proxy entirely. The token is minted server-side (the salt must
        // never reach the browser) and authorises exactly this stream + time
        // window. It does NOT bind the render parameters, which is why the
        // per-user palette below can still vary freely.
        //
        // ⚠️ USE THE SERVER'S TIMESTAMPS VERBATIM. media-api re-parses the
        // window from the filename and compares against what was signed, so
        // recomputing them here — even "identically" — is exactly how the
        // 2026-08-10 ROI defect 401'd 9 of 10 images.
        tile.src = `/media-api/internal/assets/streams/${tile.mediaStreamId ?? recording.uri.split('/')[3]}` +
          `_t${tile.mediaStart}Z.${tile.mediaEnd}Z_${renderAttrs}` +
          `?stream-token=${tile.mediaToken}` +
          (tile.mediaExp !== undefined ? `&exp=${tile.mediaExp}` : '')
      } else {
        // FALLBACK: the session-gated legacy proxy. Reached for legacy
        // recordings, or when the server could not mint (salt unset). Kept so
        // an older/misconfigured backend still renders tiles.
        const streamId = recording.uri.split('/')[3]
        const datetime = recording.datetime_utc ? recording.datetime_utc : recording.datetime
        const start = new Date(new Date(datetime).valueOf() + Math.round(tile.s * 1000)).toISOString()
        const end = new Date(new Date(datetime).valueOf() + Math.round((tile.s + tile.ds) * 1000)).toISOString()
        tile.src = `/legacy-api/ingest/recordings/${streamId}_t${start.replace(/-|:|\./g, '')}.${end.replace(/-|:|\./g, '')}_${renderAttrs}`
      }
    }
  })
  return visobject
}

export const apiArbimonGetRecording = async (apiClient: AxiosInstance, slug: string, recordingId: string): Promise<VisobjectResponse | undefined> => {
  const response = await apiClient.request<VisobjectResponse>({
    method: 'GET',
    url: `/legacy-api/project/${slug}/recordings/info/${recordingId}?spectroColor=mtrue`
  })
  return fetchRecording(response)
}

export const apiArbimonGetRecordings = async (apiClient: AxiosInstance, slug: string, params: RecordingSearchParams): Promise<RecordingResponse | undefined> => {
  const key = params.key
  const opts = Object.fromEntries(
    Object.entries(params).filter(([k]) => k !== 'key')
  )
  const res = await apiClient.request<RecordingResponse>({
    method: 'GET',
    url: `/legacy-api/project/${slug}/recordings/${key}`,
    params: opts
  })

  return res.data
}

export const apiGetRecordingTag = async (apiClient: AxiosInstance, slug: string, recId: string): Promise<RecordingTagResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/tags/recording/${recId}`)
  return response.data
}

export const apiSearchTag = async (apiClient: AxiosInstance, slug: string, params: RecordingTagSearchParams): Promise<RecordingTagResponse[] | undefined> => {
  const response = await apiClient.request<RecordingTagResponse[]>({
    method: 'GET',
    url: `/legacy-api/project/${slug}/tags`,
    params
  })
  return response.data
}

export const apiPutRecordingTag = async (apiClient: AxiosInstance, slug: string, recId: string, payload: TagParams | TagParams[]): Promise<RecordingTagResponse[]> => {
  const res = await apiClient.request<RecordingTagResponse[]>({
    method: 'PUT',
    url: `/legacy-api/project/${slug}/tags/recording/${recId}`,
    data: payload
  })

  return res.data
}

export const apiRecordingValidate = async (apiClient: AxiosInstance, slug: string, recId: number, payload: RecordingValidateParams): Promise<RecordingValidateResponse[]> => {
  const res = await apiClient.request<RecordingValidateResponse[]>({
    method: 'POST',
    url: `/legacy-api/project/${slug}/recordings/validate/${recId}`,
    data: payload
  })

  return res.data
}

export const apiDeleteRecordingTag = async (apiClient: AxiosInstance, slug: string, recId: string, payload: RecordingTagResponse): Promise<TagDeleteResponse> => {
  const res = await apiClient.request<TagDeleteResponse>({
    method: 'DELETE',
    url: `/legacy-api/project/${slug}/tags/recording/${recId}/${payload.id}`
  })

  return res.data
}

export interface RecordingPatternMatchingBoxesParams {
  rec_id: string
  validated: number
}

export interface RecordingPatternMatchingBoxesResponse {
  pattern_matching_roi_id: number
  pattern_matching_id: number
  recording_id: number
  species_id: number
  songtype_id: number
  x1: number
  y1: number
  x2: number
  y2: number
  uri_param1: number
  uri_param2: number
  score: number
  validated: number
  cs_val_present: number
  cs_val_not_present: number
  consensus_validated: number | null
  expert_validated: number | null
  expert_validation_user_id: number | null
  denorm_site_id: number
  denorm_recording_datetime: string
  denorm_recording_date: string
  species_name: string
  songtype_name: string
  uri: string
}

export const apiGetPatternMatchingBoxes = async (apiClient: AxiosInstance, slug: string, params: RecordingPatternMatchingBoxesParams): Promise<RecordingPatternMatchingBoxesResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/pattern-matchings`, { params })
  return response.data
}

export interface TemplateResponse {
  id: number
  project: number
  recording: number
  species: number
  songtype: number
  name: string
  uri: string
  x1: number
  y1: number
  x2: number
  y2: number
  date_created: string
  user_id: string
  disabled: number
  species_name: string
  songtype_name: string
  author: string
  project_name: string
  project_url: string
  source_project_id: number | null
  source_project_name: string | null
}

export const apiGetTemplates = async (apiClient: AxiosInstance, slug: string): Promise<TemplateResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/templates?projectTemplates=true`)
  return response.data
}

export interface TemplateParams {
  name: string
  recording: string
  roi: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  species: number
  songtype: number
}

export interface newTemplateResponse {
  name: string
  project: number
  recording: number
  species: number
  songtype: number
  x1: number
  y1: number
  x2: number
  y2: number
  user_id: number
  id: number
  uri: string
}

export const apiPostTemplate = async (apiClient: AxiosInstance, slug: string, payload: TemplateParams): Promise<newTemplateResponse[] | undefined> => {
  const response = await apiClient.request<newTemplateResponse[]>({
    method: 'POST',
    url: `/legacy-api/project/${slug}/templates/add`,
    data: payload
  })

  return response.data
}

export interface SoundscapeCompositionResponse {
  recordingId: number
  scclassId: number
  present: number
}

export interface SoundscapeCompositionParams {
  class: string
  val: number
}

export const apiPostSoundscapeComposition = async (apiClient: AxiosInstance, slug: string, recordingId: string, payload: SoundscapeCompositionParams): Promise<SoundscapeCompositionResponse[] | undefined> => {
  const response = await apiClient.request<SoundscapeCompositionResponse[]>({
    method: 'POST',
    url: `/legacy-api/project/${slug}/soundscape-composition/annotate/${recordingId}`,
    data: payload
  })

  return response.data
}

export interface AedItem {
  job_id: number
  name: string
  parameters: Record<string, number>
  timestamp: string
  time_min: number
  time_max: number
  freq_min: number
  freq_max: number
  aed_id: number
  species_id: number | null
  songtype_id: number | null
  species_name: string | null
  songtype_name: string | null
  rec_id: number
  state: 'completed' | 'running' | 'failed' | string
}
export type AedResponse = AedItem[]

export const apiArbimonGetAed = async (
  apiClient: AxiosInstance,
  slug: string,
  recId: string | number | undefined,
  completed = true
): Promise<AedResponse | undefined> => {
  if (!slug || recId == null || recId === undefined) return undefined

  const url = `/legacy-api/project/${slug}/audio-event-detections-clustering`
  const res = await apiClient.request<AedResponse>({
    method: 'GET',
    url,
    params: {
      completed,
      rec_id: recId
    }
  })
  return res.data
}

export interface ClusterItem {
  aed_id: number
  time_min: number
  time_max: number
  frequency_min: number
  frequency_max: number
  recording_id: number
  uri: string
  validated: number | null
  playlist_name: string
  playlist_id: number
}
export type ClusterResponse = ClusterItem[]

export const apiArbimonGetClustering = async (
  apiClient: AxiosInstance,
  slug: string,
  recId: string | number
): Promise<ClusterResponse | undefined> => {
  if (!slug || recId == null) return undefined

  // The legacy route is `/clustering-jobs/:job_id/rois-details` but the handler
  // reads everything from the POST body (rec_id, all, etc.) and ignores the
  // `:job_id` URL segment. We pass `_` as a placeholder so the URL is well-formed
  // and clearly intentional (the previous literal string `undefined` was a
  // refactor leftover that looked like a bug in network traces and could break
  // if the legacy route is ever cleaned up).
  const url = `/legacy-api/project/${slug}/clustering-jobs/_/rois-details`
  const res = await apiClient.request<ClusterResponse>({
    method: 'POST',
    url,
    data: {
      all: true,
      rec_id: recId
    }
  })
  return res.data
}

export interface PlaylistInfo {
  id: number
  name: string
  project_id: number
  uri: string | null
  metadata: unknown | null
  count: number
  type: string
}

export const apiArbimonGetPlaylistInfo = async (
  apiClient: AxiosInstance,
  slug: string,
  playlistId: string | number
): Promise<PlaylistInfo | undefined> => {
  if (slug == null || slug === '' || playlistId == null || playlistId === '') {
    return undefined
  }
  const url = `/legacy-api/project/${slug}/playlists/info/${playlistId}`
  const response = await apiClient.request<PlaylistInfo>({
    method: 'GET',
    url
  })

  return response.data
}

export interface PlaylistItemsPayload {
  offset?: number
  limit?: number
  show?: string // e.g. 'thumbnail-path'
}

export const apiArbimonPostPlaylistItems = async (
  apiClient: AxiosInstance,
  slug: string,
  playlistId: string | number | undefined,
  payload: PlaylistItemsPayload
): Promise<RecordingResponse | undefined> => {
  if (playlistId === undefined) return undefined
  const url = `/legacy-api/project/${slug}/playlists/${playlistId}`
  const body: PlaylistItemsPayload = {
    offset: 0,
    limit: 10,
    show: 'thumbnail-path',
    ...payload
  }
  const res = await apiClient.post(url, body)
  return res.data as RecordingResponse
}
export interface SoundscapeItem {
  id: number
  name: string
  project: number
  playlist_id: number
  user: number
  min_value: number
  max_value: number
  visual_max_value: number | null
  visual_palette: number
  min_t: number
  max_t: number
  min_f: number
  max_f: number
  bin_size: number
  threshold: number
  threshold_type: string
  frequency: number
  normalized: number
  aggregation: string
  aggr_name: string
  aggr_scale: string
  uri: string
  thumbnail: string
  spectrogram: any
  type: string
  tiles: any
  legend: any
  offset: any
  domain: any
  scale: any
}

export type SoundscapeResponse = SoundscapeItem[]

export const apiGetSoundscapes = async (
  apiClient: AxiosInstance,
  slug: string,
  params: Record<string, any> = {}
): Promise<SoundscapeResponse> => {
  const url = `/legacy-api/project/${slug}/soundscapes/`

  const response = await apiClient.get(url, {
    params: {
      show: 'thumbnail-path',
      ...params
    }
  })

  return fetchSpondscape(response)
}

export interface SoundscapeRegion {
  id: number
  name: string
  x1: number
  y1: number
  x2: number
  y2: number
  count: number
  treshold: number
  threshold_type: number
  playlist: number
  tags: Tag[]
}

export interface Tag {
  count: number
  id: number
  recording: number
  region: number
  tag: string
  type: string
}

export const apiGetSoundscapeRegions = async (
  apiClient: AxiosInstance,
  slug: string,
  soundscapeId: string
): Promise<SoundscapeRegion[]> => {
  const url = `/legacy-api/project/${slug}/soundscapes/${soundscapeId}/regions?view=tags`

  const response = await apiClient.get(url)

  return response.data
}

const khzUnitFmt = (v: number): string => { return `${Math.floor(v / 10.0) / 100.0} kHz` }

const aggregations: Record<string, {
  time_unit: string
  unit_fmt: (v: number) => any
}> = {
  time_of_day: {
    time_unit: 'Time (Hour in Day)',
    unit_fmt: function (v: number) { return `${v | 0}:00` }
  },
  day_of_month: {
    time_unit: 'Time (Day in Month)',
    unit_fmt: function (v: number) { return v | 0 }
  },
  day_of_year: {
    time_unit: 'Time (Day in Year )',
    unit_fmt: function (v: number) { return v | 0 }
  },
  month_in_year: {
    time_unit: 'Time (Month in Year)',
    unit_fmt: function (v: number) { return dayjs().month((v | 0) - 1).format('MMMM') }
  },
  day_of_week: {
    time_unit: 'Time (Weekday) ',
    unit_fmt: function (v: number) { return dayjs.weekdays()[(v | 0) - 1] }
  },
  year: {
    time_unit: 'Time (Year) ',
    unit_fmt: function (v: number) { return v | 0 }
  },
  unknown: {
    time_unit: 'Time',
    unit_fmt: function (v: number) { return v | 0 }
  }
}

const fetchSpondscape = (response: AxiosResponse<SoundscapeResponse, any>): SoundscapeResponse => {
  const soundscapes = response.data
  for (const soundscape of soundscapes) {
    soundscape.type = 'soundscape'
    const t0 = soundscape.min_t
    const t1 = soundscape.max_t
    const f0 = soundscape.min_f
    const f1 = soundscape.max_f
    let v0 = soundscape.min_value
    let v1 = soundscape.visual_max_value ?? soundscape.max_value
    if (soundscape.normalized) {
      v0 = 0
      v1 = 100
    }
    const dt = t1 - t0 + 1
    const df = f1 - f0
    const dv = v1 - v0

    const aggregation = aggregations[soundscape.aggregation] ?? aggregations.unknown
    const timeUnit = aggregation.time_unit
    const scaleCache = getSelectedFrequencyCache()
    soundscape.domain = {
      x: {
        from: t0,
        to: t1,
        span: dt,
        ticks: dt,
        ordinal: true,
        unit_interval: 1,
        unit_format: aggregation.unit_fmt,
        unit: timeUnit ?? 'Time ( s )'
      },
      y: {
        from: f0,
        to: f1,
        span: df,
        unit: 'Frequency ( kHz )',
        unit_interval: soundscape.bin_size,
        unit_format: khzUnitFmt,
        tick_format: khzFormat
      },
      legend: {
        from: v0,
        to: v1,
        span: dv,
        ticks: Math.max(2, Math.min(dv | 0, 10)),
        unit: 'Count',
        src: `/src/_assets/spectrogram/palettes/${soundscape.visual_palette}.png`
      }
    }
    soundscape.scale = {
      def_sec2px: 100 / 1.0,
      def_hz2px: 100 / 5000.0,
      max_sec2px: 100 / (1.0 / 8),
      max_hz2px: 100 / (5000.0 / 8),
      zoom: { x: 0, y: 0 },
      sec2px: 100 / 1.0,
      hz2px: 100 / 5000.0,
      originalScale: scaleCache.originalScale
    }
    soundscape.offset = {
      sec: 0,
      hz: 0
    }
    if (soundscape.normalized) {
      soundscape.domain.legend.tick_format = (v: number) => { return `${v}%` }
    }
    soundscape.tiles = {
      x: 1,
      y: 1,
      set: [{
        i: 0,
        j: 0,
        s: 0,
        hz: f1,
        ds: dt,
        dhz: df,
        src: soundscape.thumbnail,
        crisp: true
      }]
    }
    soundscape.legend = {
      min: 0,
      max: 255
    }
  }
  return soundscapes
}

export type CounSoundscapeCompositiontById = Record<number, number>

export const apiGetSoundscapeComposition = async (
  apiClient: AxiosInstance,
  slug: string,
  recordingId: string
): Promise<CounSoundscapeCompositiontById> => {
  const url = `/legacy-api/project/${slug}/soundscape-composition/annotations/${recordingId}`

  const response = await apiClient.get(url)

  return response.data
}

export interface SoundscapeScidx {
  height: number
  index: Record<number, Record<number, [number, number[]?]>>
  offsetx: number
  offsety: number
  stats: any
  valid: boolean
  version: number
  width: number
  __maxAmplitude?: number
}

export const apiGetSoundscapeScidx = async (
  apiClient: AxiosInstance,
  slug: string,
  soundscapeId: string
): Promise<SoundscapeScidx> => {
  const url = `/legacy-api/project/${slug}/soundscapes/${soundscapeId}/scidx?count=1`
  const response = await apiClient.get(url)
  return response.data
}

export type NormVector = Record<number, number>

export const apiGetSoundscapeNormVector = async (
  apiClient: AxiosInstance,
  slug: string,
  soundscapeId: string
): Promise<NormVector> => {
  const url = `/legacy-api/project/${slug}/soundscapes/${soundscapeId}/norm-vector`
  const response = await apiClient.get(url)
  return response.data
}

export interface SoundscapeItemOptions {
  palette: number
  max: number
  normalized: boolean
  amplitude: number
  amplitudeReference: string
}

export const apiGetSoundscapeScale = async (
  apiClient: AxiosInstance,
  slug: string,
  soundscapeId: string,
  payload: SoundscapeItemOptions
): Promise<SoundscapeItem> => {
  const url = `/legacy-api/project/${slug}/soundscapes/${soundscapeId}/scale`
  const response = await apiClient.post(url, payload)
  return response.data
}
