import { Site } from '@rfcx-bio/common/dao/types'
import { rawDetections } from '@rfcx-bio/common/mock-data'

export const getSitesFromDetections = (projectId = 1, detections = rawDetections): Site[] => {
  // Get unique sites from detections
  const splitter = '-----'
  const siteList: string[] = Array.from(new Set(detections.map(r => `${r.site_id}${splitter}${r.stream_id}${splitter}${r.arbimon_site_id}${splitter}${r.name}${splitter}${r.lat}${splitter}${r.lon}${splitter}${r.alt}`)))

  // Convert to Site type
  return siteList
    .map(s => s.split(splitter))
    .map(tuple => ({
      id: Number(tuple[0]),
      idCore: tuple[1],
      idArbimon: Number(tuple[2]),
      locationProjectId: projectId,
      name: tuple[3],
      latitude: Number(tuple[4]),
      longitude: Number(tuple[5]),
      altitude: Number(tuple[6])
    }))
}
