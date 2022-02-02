import { SpeciesDataset } from './activity-overview-by-species'

export interface ActivityOverviewBySpeciesDataset {
  scientificName: string
  commonName: string
  taxon: string
  details: ActivityOverviewBySpeciesDetail[]
}

export interface ActivityOverviewBySpeciesDetail {
  datasetIdx: number
  detectionCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}

export function getFormatSpeciesDataset (rawSpeciesDataset: SpeciesDataset[]): ActivityOverviewBySpeciesDataset[] {
  if (rawSpeciesDataset.length === 0) return []

  const formattedDataset: ActivityOverviewBySpeciesDataset[] = []

  for (const [datasetIdx, value] of rawSpeciesDataset.entries()) {
    const bySpeciesData = value.data
    for (const speciesInformation of bySpeciesData) {
      const { scientificName, commonName, taxon, ...statistics } = speciesInformation
      const matchedSpecies = formattedDataset.find(({ scientificName: sc }) => sc === scientificName)
      const details = { datasetIdx, ...statistics }
      console.log(datasetIdx > 0, Array.from(Array(datasetIdx).keys()))
      const emptyDetails = datasetIdx > 0
        ? Array.from(Array(datasetIdx).keys()).map(datasetIdx => ({ datasetIdx, detectionCount: 0, detectionFrequency: 0, occupiedSites: 0, occupancyNaive: 0 }))
        : []
      if (!matchedSpecies) {
        formattedDataset.push({
          scientificName,
          commonName,
          taxon,
          details: [...emptyDetails, details]
        })
        console.log(emptyDetails, [...emptyDetails, details])
      } else {
        matchedSpecies.details.push(details)
      }
    }
  }

  return formattedDataset
}
