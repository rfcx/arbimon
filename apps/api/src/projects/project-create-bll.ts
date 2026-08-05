import { RANKING_PRIMARY } from '@rfcx-bio/common/roles'
import { type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { createProject as createProjectInCore, getProject as getProjectInCore } from '~/api-core/api-core'
import { updateProjectSlugLegacy } from '~/api-legacy-arbimon'
import { createProject as createProjectLocal } from './dao/project-create-dao'
import { create as createProjectMember } from './dao/project-member-dao'
import { createProjectProfile } from './dao/project-profile-dao'
import { assertCanCreateProject, getAccountTierForUser } from './project-entitlement-bll'

interface ProjectCreateRequestParsed {
  name: string
  projectType?: ProjectType
  hidden?: boolean
  objectives?: string[]
  associatedOrganizations?: string
  dateStart?: Date
  dateEnd?: Date // undefined => ongoing
}

export const createProject = async (request: ProjectCreateRequestParsed, userId: number, token: string): Promise<[string, number]> => {
  // Tier reframe (2026-06-29): project_type is DERIVED from the creator's
  // account_tier, not chosen at creation. A Pro user's new projects are premium;
  // everyone else's are free. (Matches the bulk Pro=>premium coupling in
  // super updateUserTier.) The client no longer sends projectType.
  const { accountTier } = await getAccountTierForUser(userId)
  const projectType: ProjectType = accountTier === 'pro' ? 'premium' : 'free'
  // C1 un-gate (2026-08-04, Gap-C study §6 / D-C4): hidden (test-project /
  // unlisted flag) is available to ALL tiers — the old free=>false forcing
  // guarded the directory flag, not privacy, and the legacy create path never
  // enforced it anyway. The 12-month free-privacy clock (pricing Privacy row)
  // ships separately with the Option-1 mechanism.
  const hidden = request.hidden ?? false

  await assertCanCreateProject(userId, projectType)

  // Create in Core. is_public mirrors the user's visibility choice for free
  // projects (was: forced true); premium stays private-by-default.
  const idCore = await createProjectInCore({ name: request.name, is_public: projectType === 'free' && !hidden }, token)
  const { external_id: idArbimon } = await getProjectInCore(idCore, token)

  // Pre-populate insights table with the same data (will get updated from Core after sync)
  const project = { idCore, idArbimon, name: request.name, projectType }
  const { id, slug } = await createProjectLocal(project, hidden)

  // Update slug in Legacy
  await updateProjectSlugLegacy(token, idCore, slug)

  // Create project profile
  const { objectives, dateStart, dateEnd } = request

  await createProjectProfile({ locationProjectId: id, objectives, dateStart, dateEnd })

  // Set current user as owner
  await createProjectMember({ locationProjectId: id, userId, role: 'owner', ranking: RANKING_PRIMARY })
  return [slug, id]
}
