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
  const numberOfDatasets = rawSpeciesDataset.length
  if (numberOfDatasets === 0) return []

  const formattedDataset: ActivityOverviewBySpeciesDataset[] = []

  for (const [datasetIdx, value] of rawSpeciesDataset.entries()) {
    const bySpeciesData = value.data
    for (const speciesInformation of bySpeciesData) {
      const { scientificName, commonName, taxon, ...statistics } = speciesInformation
      const matchedSpecies = formattedDataset.find(({ scientificName: sc }) => sc === scientificName)
      const details = { datasetIdx, ...statistics }
      if (!matchedSpecies) {
        formattedDataset.push({
          scientificName,
          commonName,
          taxon,
          details: [details]
        })
      } else {
        matchedSpecies.details.push(details)
      }
    }
  }

  for (const dataset of formattedDataset) {
    const { details } = dataset
    if (details.length < numberOfDatasets) {
      const addedIdxs = details.map(({ datasetIdx }) => datasetIdx)
      const missingIdxs = Array.from({ length: numberOfDatasets }, (_, idx) => idx).filter(n => !addedIdxs.includes(n))
      missingIdxs.forEach(datasetIdx => details.push({ datasetIdx, detectionCount: 0, detectionFrequency: 0, occupiedSites: 0, occupancyNaive: 0 }))
    }
    details.sort((a, b) => a.datasetIdx - b.datasetIdx)
  }

  return formattedDataset
}
