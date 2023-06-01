import { type ApiLine, type ApiMap, type ApiStack } from '@rfcx-bio/common/api-bio/_helpers'
import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { type DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { type DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'
import { type LocationProjectMetric } from '@rfcx-bio/common/dao/types/location-project-metric'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDetectionByHour, getDetectionBySite, getProjectMetrics, getRichnessByHour, getRichnessByRisk, getRichnessBySite, getRichnessByTaxon, getSpeciesThreatened } from './dashboard-generated-dao'
import { getDashboardProfile, getHighlightedSpecies } from './dashboard-profile-dao'

export const speciesThreatenedHandler: Handler<{ speciesThreatened: DashboardSpecies[] }, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const speciesThreatened = await getSpeciesThreatened(projectIdInteger)

  return { speciesThreatened }
}

export const speciesHighlightedHandler: Handler<{ speciesHighlighted: DashboardSpeciesHighlighted[] }, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const speciesHighlighted = await getHighlightedSpecies(projectIdInteger)

  return { speciesHighlighted }
}

export const richnessByHourHandler: Handler<{ richnessByHour: ApiLine, detectionByHour: ApiLine }, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByHour, detectionByHour] = await Promise.all([
    getRichnessByHour(projectIdInteger),
    getDetectionByHour(projectIdInteger)
  ])

  return {
    richnessByHour,
    detectionByHour
  }
}

export const mapDatasetHandler: Handler<{ richnessBySite: ApiMap, detectionBySite: ApiMap }, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessBySite, detectionBySite] = await Promise.all([
    getRichnessBySite(projectIdInteger),
    getDetectionBySite(projectIdInteger)
  ])

  return {
    richnessBySite,
    detectionBySite
  }
}

export const sidebarHandler: Handler<{ richnessByTaxon: ApiStack, richnessByRisk: ApiStack }, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByTaxon, richnessByRisk] = await Promise.all([
    getRichnessByTaxon(projectIdInteger),
    getRichnessByRisk(projectIdInteger)
  ])

  return {
    richnessByTaxon,
    richnessByRisk
  }
}

export const projectMetricsHandler: Handler<Omit<LocationProjectMetric, 'locationProjectId'> & { siteCount: number }, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectMetrics = await getProjectMetrics(projectIdInteger)

  return {
    ...projectMetrics
  }
}

export const contentHandler: Handler<DashboardProfileResponse, { projectId: string }> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectProfile = await getDashboardProfile(projectIdInteger)
  return { ...projectProfile }
}
