import dayjs from 'dayjs'
import { FastifyRequest } from 'fastify'

import { RichnessByExportReport, RichnessByExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { MockHourlyDetectionSummary, rawDetections } from '@rfcx-bio/common/mock-data'
import { criticallyEndangeredSpeciesIds } from '@rfcx-bio/common/mock-data/critically-endangered-species'

import { FilterDataset, filterMocksByParameters } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'

export async function getRichnessDatasetInformation (req: FastifyRequest, query: FilterDataset): Promise<RichnessByExportResponse> {
  const isLocationRedacted = !isProjectMember(req)
  const detections = filterMocksByParameters(rawDetections, { ...query })

  if (isLocationRedacted) {
    return {
      speciesByExport: mapRichnessReportData(detections.filter(({ species_id: speciesId }) => !criticallyEndangeredSpeciesIds.has(speciesId))),
      isLocationRedacted
    }
  }

  return { speciesByExport: mapRichnessReportData(detections), isLocationRedacted }
}

function mapRichnessReportData (detections: MockHourlyDetectionSummary[]): RichnessByExportReport[] {
  return detections.map(({ species_id: speciesId, scientific_name: species, name: site, lat: latitude, lon: longitude, alt: altitude, date, hour }) => {
    const newDate = dayjs.utc(date)
    return {
      species,
      site,
      latitude,
      longitude,
      altitude,
      day: newDate.format('D'),
      month: newDate.format('M'),
      year: newDate.format('YYYY'),
      date: newDate.format('M/DD/YYYY'),
      hour
    }
  })
}
