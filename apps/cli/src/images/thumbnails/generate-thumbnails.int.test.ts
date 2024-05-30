import fs from 'fs'
import { Op } from 'sequelize'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { getMetadata } from '@rfcx-bio/node-common/image'

import { makeProject } from '@/../../../packages/testing/src/model-builders/project-model-builder'
import { getSequelize } from '@/db/connections'
import { PROJECT_IMAGE_CONFIG } from '@/images/config'
import { generateProjectThumbnails } from '@/images/thumbnails/generate-thumbnails'
import { getStorageClient } from '~/storage'

const sequelize = getSequelize()
const storage = getStorageClient()

const { LocationProject, LocationProjectProfile } = ModelRepository.getInstance(sequelize)
const localImageUrl = '../website/src/_assets/default-species-image.jpg'
const genericFile = fs.readFileSync(localImageUrl)
const projectIds = [879483, 878483, 877483]
const p1OriginalPath = 'projects/879483/project-profile-image-12asdf.jpg'
const p1ThumbnailPath = 'projects/879483/project-profile-image-12asdf.thumbnail.jpg'
const p2OriginalPath = 'projects/878483/project-profile-image-12asdf.jpg'
const p2ThumbnailPath = 'projects/878483/project-profile-image-12asdf.thumbnail.jpg'
const p3OriginalPath = 'static://project/others.png'
const genericLocationProjectProfile = {
    summary: '',
    readme: '',
    methods: '',
    keyResult: '',
    resources: '',
    objectives: [],
    dateStart: null,
    dateEnd: null
}
const genericS3FileSettings = {
    CacheControl: 'max-age=604800, s-maxage=604800',
    ACL: 'public-read' as 'public-read',
    ContentType: 'image/jpg'
}

beforeAll(async () => {
    const p1 = makeProject(879483, 'Lemurs in Madagascar')
    const p2 = makeProject(878483, 'Cicadas in Serbia')
    const p3 = makeProject(877483, 'Birds in Iceland')

    await LocationProject.create(p1)
    await LocationProject.create(p2)
    await LocationProject.create(p3)
})

beforeEach(async () => {
    // P1 has S3 profile image
    await storage.putObject(p1OriginalPath, genericFile, genericS3FileSettings)

    // P2 has S3 profile image + thumbnail
    await storage.putObject(p2OriginalPath, genericFile, genericS3FileSettings)
    await storage.putObject(p2ThumbnailPath, genericFile, genericS3FileSettings)

    await LocationProjectProfile.create({
        locationProjectId: 879483,
        image: p1OriginalPath,
        ...genericLocationProjectProfile
    })
    await LocationProjectProfile.create({
        locationProjectId: 878483,
        image: p2OriginalPath,
        ...genericLocationProjectProfile
    })
    await LocationProjectProfile.create({
        locationProjectId: 877483,
        image: p3OriginalPath,
        ...genericLocationProjectProfile
    }) // no S3 image
})

afterEach(async () => {
    await storage.deleteObject(p1OriginalPath)
    await storage.deleteObject(p2OriginalPath)
    await storage.deleteObject(p1ThumbnailPath)
    await storage.deleteObject(p2ThumbnailPath)
    await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: projectIds } } })
})
afterAll(async () => {
    await LocationProject.destroy({ where: { id: { [Op.in]: projectIds } } })
})

describe('Generate thumbnails', async () => {
    test('generates and saves thumbnail images', async () => {
        // Arrange
        const initialThumbnailExists = await storage.objectExists(p1ThumbnailPath)

        // Act
        await generateProjectThumbnails(sequelize, storage)

        // Assert
        const thumbnail = await storage.getObject(p1ThumbnailPath)
        expect(initialThumbnailExists).toBe(false)
        expect(thumbnail).toBeDefined()
        expect(thumbnail).toBeInstanceOf(Buffer)
        const imageMetadata = await getMetadata(thumbnail as Buffer)
        expect(imageMetadata.format).toBe('jpeg')
    })

    test('generates thumbnails only for eligible projects', async () => {
        // Arrange
        const putObject = vi.spyOn(storage, 'putObject')

        // Act
        await generateProjectThumbnails(sequelize, storage)

        // Assert
        expect(putObject).toBeCalledTimes(1)
    })

    test('generated thumbnails have correct dimensions', async () => {
        // Act
        await generateProjectThumbnails(sequelize, storage)

        // Assert
        const thumbnail = await storage.getObject(p1ThumbnailPath) as Buffer
        expect(thumbnail).toBeDefined()
        const imageMetadata = await getMetadata(thumbnail)
        const config = PROJECT_IMAGE_CONFIG.thumbnail
        expect(imageMetadata?.width).toEqual(config.width)
        expect(imageMetadata?.height).toEqual(config.height)
    })
})
