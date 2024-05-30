import dayjs from 'dayjs'
import { parse } from 'node:path'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { isValidQueryHours } from '@rfcx-bio/utils/query-hour'

import { type CoreCreateClassifierJobBody } from '~/api-core/types'
import { getSequelize } from '~/db'
import { BioInvalidBodyError, BioNotFoundError, BioPublicError } from '~/errors'
import { createClassifierJob as coreCreateClassifierJob, updateClassifierJob } from '../_services/api-core/api-core'

interface CreateClassifierJobRequestParsed {
  classifierId: number
  projectId: number
  queryStreams?: string
  queryStart: string
  queryEnd: string
  queryHours: string
  minutesTotal: number
}

export const createClassifierJob = async (token: string, body: CreateClassifierJobRequestParsed): Promise<{ jobId: string | undefined, slug: string }> => {
  if (body?.classifierId === undefined || Number.isNaN(body?.classifierId)) {
    throw BioInvalidBodyError({ classifierId: body?.classifierId })
  }

  if (body?.projectId === undefined || Number.isNaN(Number(body?.projectId))) {
    throw BioInvalidBodyError({ projectId: body?.projectId })
  }

  if (body?.queryStart === undefined || body?.queryStart === '' || !dayjs(body.queryStart).isValid()) {
    throw BioInvalidBodyError({ queryStart: body?.queryStart })
  }

  if (body?.queryEnd === undefined || body?.queryEnd === '' || !dayjs(body.queryEnd).isValid()) {
    throw BioInvalidBodyError({ queryEnd: body?.queryEnd })
  }

  if (body?.minutesTotal === undefined || Number.isNaN(body.minutesTotal)) {
    throw BioInvalidBodyError({ minutesTotal: body?.minutesTotal })
  }

  if (dayjs(body.queryEnd).isBefore(dayjs(body.queryStart))) {
    throw new BioPublicError('Property `end` cannot be before `start`', 400)
  }

  if (body?.queryHours && !isValidQueryHours(body.queryHours)) {
    throw BioInvalidBodyError({ queryHours: body.queryHours })
  }

  const { LocationProject } = ModelRepository.getInstance(getSequelize())
  const project = await LocationProject.findOne({ where: { id: body.projectId } })

  if (project === null || project === undefined) {
    throw BioNotFoundError()
  }

  const coreCreateClassifierJobBody: CoreCreateClassifierJobBody = {
    classifier_id: body?.classifierId,
    project_id: project.idCore,
    query_streams: body?.queryStreams,
    query_start: body?.queryStart,
    query_end: body?.queryEnd,
    query_hours: body?.queryHours
  }

  const location = await coreCreateClassifierJob(token, coreCreateClassifierJobBody)

  if (location === undefined || location === '') {
    return {
      jobId: undefined,
      slug: project.slug
    }
  }

  const parsedLocation = parse(location)
  await updateClassifierJob(token, Number(parsedLocation.name), { minutes_total: body.minutesTotal })
  return { jobId: parsedLocation.name, slug: project.slug }
}
