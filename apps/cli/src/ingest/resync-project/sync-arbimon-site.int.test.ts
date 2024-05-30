import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { syncArbimonSites } from './sync-arbimon-site'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()
const { LocationProject, LocationSite } = ModelRepository.getInstance(biodiversitySequelize)

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`

const SQL_INSERT_SITE = `
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone, country_code, hidden)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone, $countryCode, $hidden);
`
const DEFAULT_ARB_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_BIO_PROJECT: Project = { id: 1, idCore: '807cuoi3cvwx', idArbimon: DEFAULT_ARB_PROJECT.projectId, name: 'RFCx 1', slug: 'rfcx-1', status: 'listed', statusUpdatedAt: new Date(), latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1, createdAt: new Date(), updatedAt: new Date() }
const DEFAULT_ARB_SITE = { projectId: DEFAULT_ARB_PROJECT.projectId, siteId: 88528, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00', name: 'Site 3', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbz', timezone: 'Asia/Bangkok', countryCode: 'TH', hidden: 0 }
const DEFAULT_ARB_SITES = [DEFAULT_ARB_SITE, { ...DEFAULT_ARB_SITE, siteId: 88527, name: 'Site 2', externalId: 'cydwrzz91cba' }]

describe('ingest > resync > site', () => {
  beforeEach(async () => {
    await arbimonSequelize.query('DELETE FROM sites')
    await arbimonSequelize.query('DELETE FROM projects')
    await deleteOutputProjects(biodiversitySequelize)

    // write mock data to arbimon database
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_ARB_PROJECT })
    await Promise.all(DEFAULT_ARB_SITES.map(async (site) => {
      await arbimonSequelize.query(SQL_INSERT_SITE, { bind: site })
    }))

    // write project in bio
    await LocationProject.create(DEFAULT_BIO_PROJECT)
  })

  test('can sync multiple sites', async () => {
    // Act
    await syncArbimonSites(DEFAULT_ARB_PROJECT.projectId, arbimonSequelize, biodiversitySequelize, false)

    // Assert
    const sitesInDB = await LocationSite.findAll({ where: { idArbimon: { [Op.in]: DEFAULT_ARB_SITES.map(s => s.siteId) } } })
    expect(sitesInDB).toHaveLength(DEFAULT_ARB_SITES.length)
  })
})
