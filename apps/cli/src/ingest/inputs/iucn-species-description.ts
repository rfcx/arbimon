import { IucnService, IucnSpeciesNarrativeResponse } from '@/ingest/_connections/iucn'

export type IucnSpeciesDescription = string

export const getIucnSpeciesDescription = async (service: IucnService, scientificName: string): Promise<IucnSpeciesDescription | undefined> =>
  await service.getSpeciesNarrative(scientificName, mapFn)

const mapFn = (data: IucnSpeciesNarrativeResponse): IucnSpeciesDescription | undefined => {
  const result = data?.result?.[0]
  if (!result) return undefined

  return result.habitat ?? undefined
}
