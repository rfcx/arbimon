import { Project } from '@rfcx-bio/common/dao/types'
import { urlify } from '@rfcx-bio/utils/url-helpers'

export const defineTestProject = (id: number, nameBase: string, name = `${id} ${nameBase}`): Project => ({
  id,
  idCore: id.toString().slice(0, 12).padStart(12, '0'),
  idArbimon: id,
  slug: urlify(name),
  name
})
