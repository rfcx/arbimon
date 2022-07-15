import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

const RecordingBySiteHourArbimonSchema = z.object({
  projectIdArbimon: z.number(),
  siteIdArbimon: z.number(),
  timePrecisionHourLocal: z.string(), // string of date e.g. 2020-12-06 10:00:00
  totalDurationInMinutes: z.number(),
  recordedMinutes: z.string(), // string of number separate by comma (,) e.g. `5,10`
  firstRecordingIdArbimon: z.number(),
  lastRecordingIdArbimon: z.number(),
  lastUploaded: z.string() // string of date e.g. 2020-12-06 10:00:00
})

const RecordingBySiteHourBioSchema = z.object({
  timePrecisionHourLocal: z.string(), // string of date e.g. 2020-12-06 10:00:00
  locationProjectId: z.number(),
  locationSiteId: z.number(),
  totalDurationInMinutes: z.number(),
  recordedMinutes: z.array(z.number()),
  firstRecordingIdArbimon: z.number(),
  lastRecordingIdArbimon: z.number(),
  lastUploaded: z.string() // string of date e.g. 2020-12-06 10:00:00
})

export type RecordingBySiteHourArbimon = z.infer<typeof RecordingBySiteHourArbimonSchema>
export type RecordingBySiteHourBio = z.infer<typeof RecordingBySiteHourBioSchema>

export const parseRecordingBySiteHourToBio = (recordingBySiteHourArbimon: unknown): SafeParseReturnType<unknown, RecordingBySiteHourArbimon> =>
  RecordingBySiteHourArbimonSchema.safeParse(recordingBySiteHourArbimon)

export const mapRecordingBySiteHourArbimonWithBioFk = async (recordingBySiteHourDataArbimon: RecordingBySiteHourArbimon[], sequelize: Sequelize): Promise<RecordingBySiteHourBio[]> => {
  const arbimonRecordingBySiteHourGroupByProject = groupBy(recordingBySiteHourDataArbimon, 'projectIdArbimon')
  const arbimonRecordingBySiteHourGroupBySites = groupBy(recordingBySiteHourDataArbimon, 'siteIdArbimon')

  // get distinct bio project ids
  const biodiversityProjects = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonRecordingBySiteHourGroupByProject).map(Number) } },
    raw: true
  })

  const biodiversitySites = (await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonRecordingBySiteHourGroupBySites).map(Number) } },
    raw: true
  }))

  // map bio project id and site id into recording by site hour object
  return recordingBySiteHourDataArbimon.map(recordingBySiteHourArbimon => {
    const { projectIdArbimon, siteIdArbimon, ...recordingBySiteHourBio } = recordingBySiteHourArbimon
    return {
      ...recordingBySiteHourBio,
      locationProjectId: biodiversityProjects.find(project => project.idArbimon === recordingBySiteHourArbimon.projectIdArbimon)?.id ?? -1,
      locationSiteId: biodiversitySites.find(site => site.idArbimon === recordingBySiteHourArbimon.siteIdArbimon)?.id ?? -1,
      recordedMinutes: recordingBySiteHourBio.recordedMinutes.split(',').map(Number)
    }
  })
}
