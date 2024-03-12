import { Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { projectSpeciesRoute } from '@rfcx-bio/common/api-bio/species/project-species-all'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { createProject } from '@/projects/project-create-bll'
import { GET } from '~/api-helpers/types'
import { routesSpecies } from './index'
import {TaxonSpeciesModel} from "@rfcx-bio/common/dao/models/taxon-species-model";

const { LocationProject, LocationProjectProfile, SpeciesInProject, TaxonSpecies } = modelRepositoryWithElevatedPermissions

vi.mock('~/api-core/api-core')

const currentUserId = 9001
const species = [
    {
        taxonClassId: 600,
        taxonClassSlug: 'mammals',
        taxonSpeciesId: 100001,
        taxonSpeciesSlug: 'cat',
        scientificName: 'Felis catus'
        // description: 'a',
        // sourceUrl: 'a',
        // sourceCite: 'a',
        // riskRatingId: 200,
        // riskRatingGlobalId: 2,
        // riskRatingLocalId: 1,
        // commonName: 'a',
        // detectionMinHourLocal: new Date(),
        // detectionMaxHourLocal: new Date(),
        // photoUrl: 'a'
    }
]

describe(`GET ${projectSpeciesRoute}`, async () => {
    beforeAll(async () => {
        const projectId = await createProject({ name: 'Grey-blue humpback whales' }, currentUserId, '')
        const locationProjectId = projectId[1]
        const speciesInProjects = species.map(sp => ({ locationProjectId, ...sp }))
        // eslint-disable-next-line no-console
        console.log('+++++++++++++++++')
        // eslint-disable-next-line no-console
        console.log(speciesInProjects)
        // await SpeciesInProject.bulkCreate(speciesInProjects)
    })

    afterAll(async () => {
        const locationProjects = await LocationProject.findAll({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } }).then(projects => projects.map(project => project.id))
        await SpeciesInProject.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
        await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjects } } })
        await LocationProject.destroy({ where: { id: { [Op.in]: locationProjects } }, force: true })
    })

    test('exists', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { userId: currentUserId })

        // Act
        const routes = [...app.routes.keys()]

        // Assert
        expect(routes).toContain(projectSpeciesRoute)
    })

    test('returns successfully', async () => {
        // Arrange
        const app = await makeApp(routesSpecies, { userId: currentUserId })
        const project = await LocationProject.findOne({ where: { slug: { [Op.like]: 'grey-blue-humpback%' } } })

        // Act
        const response = await app.inject({
            method: GET,
            url: projectSpeciesRoute.replace(':projectId', project?.id.toString() ?? '')
        })

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.species).toBeDefined()
    })
})
