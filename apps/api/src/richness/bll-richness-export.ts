import { FastifyRequest } from 'fastify'

import { RichnessByExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { rawDetections, rawSpecies } from '@rfcx-bio/common/mock-data'

import { FilterDataset, filterMocksByParameters } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'

export async function getRichnessDatasetInformation (req: FastifyRequest, query: FilterDataset): Promise<RichnessByExportResponse> {
  const noPermission = !isProjectMember(req)
  const detections = filterMocksByParameters(rawDetections, { ...query })

  if (noPermission) {
    const protectedSpeciesIds = rawSpecies.filter(({ extinctionRisk }) => EXTINCTION_RISK_PROTECTED_CODES.includes(extinctionRisk)).map(({ speciesId }) => speciesId)
    return {
      speciesByExport: detections.filter(({ species_id: speciesId }) => !protectedSpeciesIds.includes(speciesId)),
      isLocationRedacted: noPermission
    }
  }

  return { speciesByExport: detections, isLocationRedacted: noPermission }
}
