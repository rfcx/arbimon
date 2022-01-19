import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { rawDetections } from '@rfcx-bio/common/mock-data'

export const getMockSites = (detections = rawDetections): Site[] => {
  // Get unique sites from detections
  const splitter = '-----'
  const rawSiteList: string[] = Array.from(new Set(detections.map(r => `${r.stream_id}${splitter}${r.name}${splitter}${r.lat}${splitter}${r.lon}${splitter}${r.alt}`)))

  // Convert to Site type
  return rawSiteList
    .map(s => s.split(splitter))
    .map(tuple => ({
      siteId: tuple[0],
      name: tuple[1],
      latitude: Number(tuple[2]),
      longitude: Number(tuple[3]),
      altitude: Number(tuple[4])
    }))
}
