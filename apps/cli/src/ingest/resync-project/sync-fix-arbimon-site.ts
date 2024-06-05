import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getArbimonSitesByProject } from '../inputs/get-arbimon-site'
import { writeSitesToBio } from '../outputs/sites'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { parseArray } from '../parsers/parse-array'
import { type SiteArbimon, parseSiteArbimon } from '../parsers/parse-site-arbimon-to-bio'
import { getSites } from './get-sites'
import { getSyncStatus } from './get-sync-status'

export const syncFixArbimonSites = async (project: Pick<Project, 'id' | 'idArbimon'>, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, verbose: boolean = true): Promise<void> => {
  // Get status
  const syncStatus = await getSyncStatus(biodiversitySequelize, masterSources.Arbimon.id, masterSyncDataTypes.Site.id)

  // Getter
  const rawSourceSites = await getArbimonSitesByProject(arbimonSequelize, project.idArbimon)
  const rawTargetSites = await getSites(biodiversitySequelize, project.id)
  if (verbose) {
    console.info('- syncFixArbimonSites: found %d sites in Legacy', rawSourceSites.length)
    console.info('- syncFixArbimonSites: found %d sites in Bio', rawTargetSites.length)
  }

  // Parser
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(rawSourceSites, parseSiteArbimon)
  for (const error of inputsAndParsingErrors) {
    console.warn('- syncFixArbimonSites:', error)
  }
  const sourceSites = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)
  const targetSites = rawTargetSites.map(({ locationProjectId, ...site }) => ({
    ...site,
    projectIdArbimon: project.idArbimon,
    latitude: site.latitude ?? null,
    longitude: site.longitude ?? null,
    altitude: site.altitude ?? null,
    countryCode: site.countryCode ?? null,
    hidden: site.hidden ?? false,
    deletedAt: null
  }))

  // Comparison
  const sourceSitesToBeUpdated = compareSites(sourceSites, targetSites, verbose)
  if (verbose) {
    console.info(`- syncFixArbimonSites: expecting ${sourceSitesToBeUpdated.length} updates`)
  }
  if (sourceSitesToBeUpdated.length === 0) {
    return
  }

  // Writer
  const [writtenSites, writeErrors] = await writeSitesToBio(sourceSitesToBeUpdated, biodiversitySequelize)

  // Write errors
  if (verbose) {
    for (const [o, e] of inputsAndParsingErrors) {
      console.warn(`- syncFixArbimonSites: input/parsing error on ${(o as SiteArbimon).idArbimon}: ${JSON.stringify(e.error.issues)}`)
    }
    for (const e of writeErrors) {
      console.warn(`- syncFixArbimonSites: output/write error: ${JSON.stringify(e)}`)
    }
  }
  await Promise.all(inputsAndParsingErrors.map(async (e: any) => {
    const idArbimon = e[0].idArbimon as number
    const error = {
      externalId: `${idArbimon}`,
      error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
      syncSourceId: syncStatus.syncSourceId,
      syncDataTypeId: syncStatus.syncDataTypeId
    }
    await writeSyncError(error, biodiversitySequelize)
  }))
  await Promise.all(writeErrors.map(async e => {
    const error = { ...e, syncSourceId: syncStatus.syncSourceId, syncDataTypeId: syncStatus.syncDataTypeId }
    await writeSyncError(error, biodiversitySequelize)
  }))

  // Write logs
  if (verbose) {
    console.info(`- syncFixArbimonSites: logging delta ${writtenSites.length} for ${project.id}`)
  }
  const log = {
    locationProjectId: project.id,
    syncSourceId: syncStatus.syncSourceId,
    syncDataTypeId: syncStatus.syncDataTypeId,
    delta: writtenSites.length
  }
  await writeSyncLogByProject(log, biodiversitySequelize)
}

const compareSites = (sourceSites: SiteArbimon[], targetSites: SiteArbimon[], verbose: boolean): SiteArbimon[] => {
  const sitesToBeUpdated: Array<Omit<SiteArbimon, 'id'>> = []
  let sourceIndex = 0
  let targetIndex = 0

  while (sourceIndex < sourceSites.length || targetIndex < targetSites.length) {
    if (sourceIndex >= sourceSites.length || (targetIndex < targetSites.length && sourceSites[sourceIndex].idArbimon > targetSites[targetIndex].idArbimon)) {
      // Target is next (delete it)
      if (verbose) {
        console.info(`- syncFixArbimonSites: arbimon site ${targetSites[targetIndex].idArbimon} is deleted`)
      }
      sitesToBeUpdated.push({ ...targetSites[targetIndex], deletedAt: new Date() })
      targetIndex++
    } else if (targetIndex >= targetSites.length || (sourceIndex < sourceSites.length && sourceSites[sourceIndex].idArbimon < targetSites[targetIndex].idArbimon)) {
      // Source is next (add it)
      if (verbose) {
        console.info(`- syncFixArbimonSites: arbimon site ${sourceSites[sourceIndex].idArbimon} is added`)
      }
      sitesToBeUpdated.push(sourceSites[sourceIndex])
      sourceIndex++
    } else {
      // Process together (update if any fields are different)
      const s = sourceSites[sourceIndex]
      const t = targetSites[targetIndex]
      const keyDifferences = Object.keys(s).filter((k) => k !== 'id' && s[k as keyof SiteArbimon] !== t[k as keyof SiteArbimon])
      if (keyDifferences.length > 0) {
        if (verbose) {
          console.info(`- syncFixArbimonSites: arbimon site ${s.idArbimon} has changed: ${keyDifferences.join(', ')}`)
        }
        sitesToBeUpdated.push(s)
      }
      sourceIndex++
      targetIndex++
    }
  }

  return sitesToBeUpdated
}
