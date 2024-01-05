import { type MultipartFile } from '@fastify/multipart'
import { randomBytes } from 'crypto'
import { extname } from 'node:path'

import { putObject } from '~/storage'
import { createProjectProfile, getProjectProfile, updateProjectProfile } from './dao/project-profile-dao'

export const patchProjectProfileImage = async (locationProjectId: number, file: MultipartFile): Promise<void> => {
  const image = `projects/${locationProjectId}/project-profile-image-${randomBytes(4).toString('hex')}${extname(file.filename)}`

  await putObject(image, await file.toBuffer(), file.mimetype, true)

  if (await getProjectProfile(locationProjectId) === undefined) {
    await createProjectProfile({ locationProjectId, image })
  } else {
    await updateProjectProfile({ locationProjectId, image })
  }
}
