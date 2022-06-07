import { AxiosInstance } from 'axios'

import { projectSpeciesAllGeneratedUrl, ProjectSpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { PredictedOccupancyMap, projectSpeciesOneGeneratedUrl, ProjectSpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { SpotlightDatasetResponse, spotlightDatasetUrl } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { TaxonSpeciesCallLight, TaxonSpeciesPhotoLight } from '@rfcx-bio/common/dao/types'
import { SpeciesInProject, SpeciesInProjectLight } from '@rfcx-bio/common/dao/types/species-in-project'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DatasetParameters, generateFilterQuery } from '~/filters'

export interface ProjectSpecies {
  speciesInformation: SpeciesInProject | undefined
  speciesPhotos: TaxonSpeciesPhotoLight[]
  speciesCalls: TaxonSpeciesCallLight[]
  predictedOccupancyMaps: PredictedOccupancyMap[]
}

export const getSpeciesOne = async (apiClient: AxiosInstance, projectId: number, speciesSlug: string): Promise<ProjectSpecies | undefined> => {
  if (!speciesSlug) return undefined
  return await apiGetOrUndefined<ProjectSpeciesOneResponse>(apiClient, `${projectSpeciesOneGeneratedUrl({ projectId: projectId.toString(), speciesSlug })}`)
    .then(res => ({
      speciesInformation: res?.speciesInformation,
      speciesPhotos: res?.speciesPhotos ?? [],
      speciesCalls: res?.speciesCalls ?? [],
      predictedOccupancyMaps: res?.predictedOccupancyMaps ?? []
    }))
}

export const getSpeciesAll = async (apiClient: AxiosInstance, projectId: number): Promise<SpeciesInProjectLight[] | undefined> =>
  await apiGetOrUndefined<ProjectSpeciesAllResponse>(apiClient, `${projectSpeciesAllGeneratedUrl({ projectId: projectId.toString() })}`)
    .then(res => res?.species)

export const getSpotlightDataset = async (apiClient: AxiosInstance, projectId: number, rawFilter: DatasetParameters, speciesId: number): Promise<SpotlightDatasetResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `${spotlightDatasetUrl({ projectId: projectId.toString() })}?${generateFilterQuery(rawFilter)}&speciesId=${speciesId}`)
