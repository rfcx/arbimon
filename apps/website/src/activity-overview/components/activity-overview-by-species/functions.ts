import { SpeciesDataset } from './activity-overview-by-species'

export interface ActivityOverviewBySpeciesDataset {
  scientificName: string
  commonName: string
  taxon: string
  details: ActivityOverviewBySpeciesDetail[]
}

export interface ActivityOverviewBySpeciesDetail {
  datasetNo: number
  detectionCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}

export function getFormatSpeciesDataset (rawSpeciesDataset: SpeciesDataset[]): ActivityOverviewBySpeciesDataset[] {
  if (rawSpeciesDataset.length === 0) return []

  const formattedDataset: ActivityOverviewBySpeciesDataset[] = []

  for (const [datasetNo, value] of rawSpeciesDataset.entries()) {
    const bySpeciesData = value.data
    for (const speciesInformation of bySpeciesData) {
      const { scientificName, commonName, taxon, ...statistics } = speciesInformation
      const matchedSpecies = formattedDataset.find(({ scientificName: sc }) => sc === scientificName)
      if (!matchedSpecies) {
        formattedDataset.push({
          scientificName,
          commonName,
          taxon,
          details: [{ datasetNo, ...statistics }]
        })
      } else {
        matchedSpecies.details.push({ datasetNo, ...statistics })
      }
    }
  }

  return formattedDataset
}
