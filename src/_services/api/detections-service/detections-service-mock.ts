import { filterByDataset, getRawDetections, simulateDelay } from '@/_services/api-helpers/mock'
import { DatasetDefinition, Detection } from '..'

export const getAllDetections = async (dataset: DatasetDefinition): Promise<Detection[]> => {
  const filteredDetections = filterByDataset(getRawDetections(), dataset)
  return await simulateDelay(
    filteredDetections
      .sort((a, b) => a.scientific_name.localeCompare(b.scientific_name) || a.name.localeCompare(b.name) || a.date.localeCompare(b.date) || a.hour - b.hour)
      .map(d => {
        return {
          arbimonSiteId: d.arbimon_site_id,
          siteId: d.stream_id,
          siteName: d.name,
          latitude: d.lat,
          longitude: d.lon,
          date: d.date,
          hour: d.hour,
          speciesId: d.species_id,
          speciesName: d.scientific_name,
          classId: d.taxon_id,
          className: d.taxon,
          detectionFrequency: d.detection_frequency
        }
      })
  )
}
