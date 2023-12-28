import { type MultipartFile } from '@fastify/multipart'
import { randomBytes } from 'crypto'
import { extname } from 'node:path'

import { putObject } from '~/storage'
import { updateProjectProfile } from './projects-dao'

export const patchProjectProfileImage = async (projectId: number, file: MultipartFile): Promise<void> => {
  const key = `projects/${projectId}/project-profile-image-${randomBytes(4).toString('hex')}${extname(file.filename)}`

  await updateProjectProfile(projectId, { image: key })
  await putObject(key, await file.toBuffer(), file.mimetype, true)
}
