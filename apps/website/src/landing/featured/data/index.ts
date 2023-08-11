import { bioBaseline } from './biodiversity-baselines'
import { carbonTransparency } from './carbon-transparency'
import { climateChangeImpact } from './climate-change-impact'
import { endangeredSpecies } from './endangered-species'
import { restoration } from './restoration'
import { supplyChain } from './supply-chain'
import { type ProjectDetail } from './types'

export const projects: ProjectDetail[] = [
  bioBaseline,
  endangeredSpecies,
  restoration,
  climateChangeImpact,
  supplyChain,
  carbonTransparency
]
