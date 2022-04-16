import { IucnService, IucnSpeciesResponse } from '../_connections/iucn'

export interface IucnSpeciesNameAndRisk {
  commonName?: string
  riskRatingCode?: string
}

export const getIucnSpeciesNameAndRisk = async (service: IucnService, scientificName: string): Promise<IucnSpeciesNameAndRisk | undefined> =>
  await service.getSpecies(scientificName, mapFn)

const mapFn = (data: IucnSpeciesResponse): IucnSpeciesNameAndRisk | undefined => {
  const result = data?.result?.[0]
  if (!result) return undefined

  return {
    commonName: result.main_common_name ?? undefined,
    riskRatingCode: result.category ?? undefined
  }
}
