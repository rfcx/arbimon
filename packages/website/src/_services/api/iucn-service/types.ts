export interface IUCNSummary {
  content: string
  redirectUrl: string
}

export interface IUCNNarrativeInfoResponse {
  name: string
  result: IUCNNarrativeInfoResultResponse[]
}

export interface IUCNNarrativeInfoResultResponse {
  species_id: number
  taxonomicnotes: string | null
  rationale: string | null
  geographicrange: string | null
  population: string | null
  populationtrend: string | null
  habitat: string | null
  threats: string | null
  conservationmeasures: string | null
  usetrade: string | null
}
