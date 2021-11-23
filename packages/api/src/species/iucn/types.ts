// TODO ??? - Move to `common`
export interface BioIucnSpeciesRequest {
  speciesName: string
}

export interface BioIucnSpeciesResponse {
  content: string
  redirectUrl: string
}
