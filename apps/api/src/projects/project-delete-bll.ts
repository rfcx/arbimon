import { deleteProject as deleteProjectInCore } from '~/api-core/api-core'
import { BioNotFoundError } from '~/errors'
import { deleteProject as deleteProjectDao, getProjectCoreId } from './dao/projects-dao'

export const deleteProject = async (id: number, token: string): Promise<void> => {
  const idCore = await getProjectCoreId(id)
  if (idCore === undefined) throw BioNotFoundError()

  // Delete in Core
  await deleteProjectInCore(idCore, token)

  // Delete locally
  await deleteProjectDao(id)
}
