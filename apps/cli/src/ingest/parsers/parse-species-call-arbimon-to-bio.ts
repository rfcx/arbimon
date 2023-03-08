import utc from 'dayjs/plugin/utc'
import { type Sequelize } from 'sequelize'
import { type SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type TaxonSpeciesCall } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { dateQueryParamify } from '@rfcx-bio/utils/url-helpers'

import { optionalEnv } from '~/env'

const { ARBIMON_BASE_URL, MEDIA_API_BASE_URL } = optionalEnv('ARBIMON_BASE_URL', 'MEDIA_API_BASE_URL')
dayjs.extend(utc)

const SpeciesCallArbimonRowSchema = z.object({
  taxonSpeciesId: z.number(),
  callProjectId: z.number(),
  callSiteId: z.number(),
  siteIdCore: z.string().length(12),
  callType: z.string(),
  callRecordedAt: z.date(),
  callTimezone: z.string(),
  start: z.number(),
  end: z.number(),
  updatedAt: z.date(),
  projectSlugArbimon: z.string(),
  recordingId: z.number(),
  idArbimon: z.number()
})

const SpeciesCallArbimonSchema = z.object({
  taxonSpeciesId: z.number(),
  callProjectId: z.number(),
  callSiteId: z.number(),
  siteIdCore: z.string().length(12),
  callType: z.string(),
  callRecordedAt: z.string(),
  callTimezone: z.string(),
  start: z.number(),
  end: z.number(),
  updatedAt: z.string(),
  projectSlugArbimon: z.string(),
  recordingId: z.number(),
  idArbimon: z.number(),
  callMediaWavUrl: z.string().optional(),
  callMediaSpecUrl: z.string().optional(),
  callMediaRedirectUrl: z.string().optional()
})

const SpeciesCallBioSchema = z.object({
  idArbimon: z.number(),
  taxonSpeciesId: z.number(),
  callProjectId: z.number(),
  callSiteId: z.number(),
  callType: z.string(),
  callRecordedAt: z.date(),
  callTimezone: z.string(),
  callMediaWavUrl: z.string(),
  callMediaSpecUrl: z.string(),
  callMediaRedirectUrl: z.string()
})

export type SpeciesCallArbimonRow = z.infer<typeof SpeciesCallArbimonRowSchema>
export type SpeciesCallArbimon = z.infer<typeof SpeciesCallArbimonSchema>
export type SpeciesCallBio = z.infer<typeof SpeciesCallBioSchema>

export const parseSpeciesCallArbimonToBio = (speciesCallsArbimon: unknown): SafeParseReturnType<unknown, SpeciesCallArbimon> =>
SpeciesCallArbimonSchema.safeParse(speciesCallsArbimon)

export const transformTemplateArbimonToSpeciesCallBio = (speciesCall: SpeciesCallBio): Omit<TaxonSpeciesCall, 'id'> => ({ ...speciesCall })

export const mapSpeciesCallArbimonWithBioFk = async (speciesCalls: SpeciesCallArbimon[], sequelize: Sequelize): Promise<any[]> => {
  const models = ModelRepository.getInstance(sequelize)

  const speciesIdArbimonToBio = await models.TaxonSpecies.findAll()
  .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.idArbimon, s.id])))

  const siteIdArbimonToBio = await models.LocationSite.findAll()
  .then(allSites => Object.fromEntries(allSites.map(s => [s.idArbimon, s.id])))

  const projectIdArbimonToBio = await models.LocationProject.findAll()
  .then(allProjects => Object.fromEntries(allProjects.map(s => [s.idArbimon, s.id])))

  return speciesCalls.map(speciesCall => ({
    idArbimon: speciesCall.idArbimon,
    taxonSpeciesId: speciesIdArbimonToBio[speciesCall.taxonSpeciesId],
    callProjectId: projectIdArbimonToBio[speciesCall.callProjectId],
    callSiteId: siteIdArbimonToBio[speciesCall.callSiteId],
    callType: speciesCall.callType,
    callRecordedAt: dayjs.utc(speciesCall.callRecordedAt).toDate(),
    callTimezone: speciesCall.callTimezone,
    callMediaRedirectUrl: `${ARBIMON_BASE_URL ?? ''}/project/${speciesCall.projectSlugArbimon}/visualizer/rec/${speciesCall.recordingId}`,
    callMediaWavUrl: `${MEDIA_API_BASE_URL ?? ''}/internal/assets/streams/${speciesCall.siteIdCore}_t${dateQueryParamify(dayjs(speciesCall.callRecordedAt).add(speciesCall.start, 'seconds').toISOString())}.${dateQueryParamify(dayjs(speciesCall.callRecordedAt).add(speciesCall.end, 'seconds').toISOString())}_fwav.wav`,
    callMediaSpecUrl: `${MEDIA_API_BASE_URL ?? ''}/internal/assets/streams/${speciesCall.siteIdCore}_t${dateQueryParamify(dayjs(speciesCall.callRecordedAt).add(speciesCall.start, 'seconds').toISOString())}.${dateQueryParamify(dayjs(speciesCall.callRecordedAt).add(speciesCall.end, 'seconds').toISOString())}_d512.512_mtrue_fspec.png`
  }))
}
