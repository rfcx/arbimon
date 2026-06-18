import { type Sequelize, QueryTypes } from 'sequelize'

import { RiskRatingIucnModel } from '@rfcx-bio/node-common/dao/models/risk-rating-iucn-model'
import { type TaxonSpeciesIucn } from '@rfcx-bio/node-common/dao/types'
import { wait } from '@rfcx-bio/utils/async'

import { getIucnSpecies } from '@/ingest/_refactor/input-iucn/iucn-species'
import { getIucnAssessmentNarrative } from '@/ingest/_refactor/input-iucn/iucn-species-narrative'
import { writeIucnSpeciesDataToPostgres } from '@/ingest/_refactor/output-bio-db/taxon-species-iucn'

const DEFAULT_RISK_RATING = -1

// How often to flush accumulated rows to Postgres. The previous implementation
// buffered ALL ~48.5k species in memory and wrote once at the very end, so a
// multi-hour run that was interrupted (pod eviction, restart, or simply hitting
// the cron deadline) persisted nothing. Writing in batches makes progress
// durable and the run cheaply resumable (the WHERE-missing-or-stale selector
// below already skips rows that were committed on a prior run).
const WRITE_BATCH_SIZE = 200

// Politeness delay between IUCN species (one sequential pass — see below).
const REQUEST_SPACING_MS = 500

export const syncOnlyMissingIUCNSpeciesInfo = async (sequelize: Sequelize): Promise<void> => {
  const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name, tsi.risk_rating_iucn_id
    FROM taxon_species ts
    LEFT JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
    WHERE tsi.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, tsi.updated_at)) >= 1 
    ORDER BY ts.id
  `
  const speciesNameToId = await sequelize
    .query<{ id: number, scientific_name: string, risk_rating_iucn_id: number }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, { id: s.id, riskRatingIucnId: s.risk_rating_iucn_id }])))
  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.id])))
  console.info('| syncOnlyMissingIUCNSpeciesInfo =', Object.entries(speciesNameToId).length)
  await syncIucnSpeciesInfo(sequelize, speciesNameToId, iucnCodeToId)
}

export const syncIucnSpeciesInfo = async (sequelize: Sequelize, speciesNameToId: Record<string, { id: number, riskRatingIucnId: number }>, iucnCodeToId: Record<string, number>): Promise<void> => {
  const speciesNames = Object.keys(speciesNameToId)

  // One sequential pass per species. For each species we make at most TWO IUCN
  // calls: one `/species` lookup, then (only if it has an assessment) one
  // `/assessment/{id}` narrative call reusing the id we already have. The old
  // code ran two concurrent loops where the narrative loop re-fetched
  // `/species` internally — that both doubled `/species` traffic AND halved the
  // effective throttle (two interleaved request streams against one rate limit).
  let batch: TaxonSpeciesIucn[] = []
  let written = 0

  const flush = async (): Promise<void> => {
    if (batch.length === 0) return
    await writeIucnSpeciesDataToPostgres(sequelize, batch)
    written += batch.length
    console.info(`- syncIucnSpeciesInfo: flushed ${batch.length} (total ${written}/${speciesNames.length})`)
    batch = []
  }

  for (const speciesName of speciesNames) {
    const iucnSpeciesData = await getIucnSpecies(speciesName)

    const assessmentId = iucnSpeciesData?.assessments?.[0]?.assessment_id
    const iucnSpeciesNarrativeData = assessmentId != null
      ? await getIucnAssessmentNarrative(assessmentId, speciesName)
      : undefined

    const commonName = iucnSpeciesData?.common_names?.filter(n => n.main === true) ?? ''
    batch.push({
      taxonSpeciesId: speciesNameToId[speciesName].id,
      commonName: commonName[0]?.name ?? '',
      riskRatingIucnId: iucnCodeToId[iucnSpeciesData?.assessments[0]?.red_list_category_code ?? ''] ?? speciesNameToId[speciesName].riskRatingIucnId ?? DEFAULT_RISK_RATING,
      description: iucnSpeciesNarrativeData?.documentation?.habitats ?? '',
      descriptionSourceUrl: iucnSpeciesNarrativeData?.sourceUrl ?? ''
    })

    if (batch.length >= WRITE_BATCH_SIZE) await flush()
    await wait(REQUEST_SPACING_MS)
  }

  await flush()
}
