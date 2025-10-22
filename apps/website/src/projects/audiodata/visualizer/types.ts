import { type RecordingTagResponse } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

export interface FreqFilter {
  filterMin: number
  filterMax: number
}

export interface BboxGroup {
  bbox: RecordingTagResponse
  tags: RecordingTagResponse[]
}

export interface BboxListItem {
  id: number
  label: string
  f0?: number
  f1?: number
  t0?: number
  t1?: number
}

export type BboxListItems = BboxListItem[]
