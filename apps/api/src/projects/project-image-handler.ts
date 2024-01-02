import { type PatchProjectProjectImageParams } from '@rfcx-bio/common/api-bio/project/project-image'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { patchProjectProfileImage } from './project-image-bll'

export const projectUpdateImageHandler: Handler<string, PatchProjectProjectImageParams> = async (req, rep) => {
  const { projectId } = req.params

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError(req.params)
  }

  const file = await req.file()
  if (!file.mimetype.startsWith('image/')) {
    return await rep.code(415).send()
  }

  await patchProjectProfileImage(projectIdInteger, file)
  return await rep.code(204).send()
}
