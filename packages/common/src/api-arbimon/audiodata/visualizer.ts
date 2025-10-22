import type { AxiosInstance, AxiosResponse } from 'axios'

export interface TagParams {
  id: number
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
}

interface Tiles {
  set: TileSet[]
  x: number
  y: number
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
  validations: any[]
  span: number
  max_freq: number
  domain: any
  scale: any
  offset: any
  spectrogram: any
  type: string
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

const fetchRecording = (response: AxiosResponse<Visobject, any>): Visobject => {
  const recording = response.data
  const scaleCache = getSelectedFrequencyCache()
  const maxFreq = recording.sample_rate / 2
  const span = scaleCache.originalScale ? maxFreq : (maxFreq > 24000 ? maxFreq : 24000)
  const khzFormat = function (v: number): number { return (v / 1000) | 0 }
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
      const streamId = recording.uri.split('/')[3]
      const datetime = recording.datetime_utc ? recording.datetime_utc : recording.datetime
      const start = new Date(new Date(datetime).valueOf() + Math.round(tile.s * 1000)).toISOString()
      const end = new Date(new Date(datetime).valueOf() + Math.round((tile.s + tile.ds) * 1000)).toISOString()
      tile.src = `/legacy-api/ingest/recordings/${streamId}_t${start.replace(/-|:|\./g, '')}.${end.replace(/-|:|\./g, '')}_z95_wdolph_g1_fspec_${spectroColoredCache}_d1023.255.png`
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
  const res = await apiClient.request<RecordingResponse>({
    method: 'GET',
    url: `/legacy-api/project/${slug}/recordings/${params.key}`,
    params
  })

  return res.data
}

export const apiGetRecordingTag = async (apiClient: AxiosInstance, slug: string, recId: string): Promise<RecordingTagResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/tags/recording/${recId}`)
  return response.data
}

export const apiSearchTag = async (apiClient: AxiosInstance, slug: string, params: RecordingTagSearchParams): Promise<RecordingTagResponse[] | undefined> => {
  const response = await apiClient.get(`/legacy-api/project/${slug}/tags/`, { params })
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

export const apiDeleteRecordingTag = async (apiClient: AxiosInstance, slug: string, recId: string, payload: RecordingTagResponse): Promise<TagDeleteResponse> => {
  const res = await apiClient.request<TagDeleteResponse>({
    method: 'DELETE',
    url: `/legacy-api/project/${slug}/tags/recording/${recId}/${payload.id}`
  })

  return res.data
}
