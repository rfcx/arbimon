import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { analysis } from './analysis'
import { mappings } from './mappings'

/** check which index is there, delete them, then recreate them and put data */
export const fullReindex = async (client: Client, sequelize: Sequelize): Promise<void> => {
  // Check for existing indices
  const indices = await client.cat.indices({ format: 'json' }).then(response => response.body) as Array<{ index: string }>
  const requiredIndexes = ['projects', 'organizations']

  for (const indexName of requiredIndexes) {
    // if a required index is found and existed in prior session. Delete and recreate the index
    // ignore other index types
    if (indices.find(index => index.index === indexName) !== undefined) {
      if (indexName === 'projects') {
        await client.indices.delete({ index: indexName })
        await client.indices.create({
          index: indexName,
          body: {
            mappings,
            settings: {
              analysis
            }
          }
        })

        continue
      }

      await client.indices.delete({ index: indexName })
      await client.indices.create({
        index: indexName
      })
    }
  }

  // Index projects
  let offset = 0
  const limit = 250
  let responseCount = 1

  while (responseCount !== 0) {
    const sql = `
      select 
        location_project.id,
        location_project.id_core,
        location_project.id_arbimon,
        location_project.name,
        location_project.slug,
        location_project.status,
        location_project.latitude_north,
        location_project.latitude_south,
        location_project.longitude_east,
        location_project.longitude_west,
        coalesce(location_project_profile.summary, '') as summary,
        location_project_profile.date_start,
        location_project_profile.date_end,
        coalesce(location_project_profile.objectives, '{}') as objectives,
        coalesce(location_project_profile.image, '') as image,
        coalesce(location_project_country.country_codes, '{}') as country_codes,
        coalesce(location_project_metric.species_count, 0) as species_count,
        coalesce(location_project_metric.recording_minutes_count, 0) as recording_minutes_count,
        coalesce(location_project_metric.detection_minutes_count, 0) as detection_minutes_count,
        location_project_metric.min_date,
        location_project_metric.max_date,
        location_project_metric.recording_min_date,
        location_project_metric.recording_max_date,
        location_project_metric.detection_min_date,
        location_project_metric.detection_max_date
      from location_project
      left join location_project_profile on location_project.id = location_project_profile.location_project_id
      left join location_project_country on location_project.id = location_project_country.location_project_id
      left join location_project_metric on location_project.id = location_project_metric.location_project_id
      where (location_project.status = 'listed' or location_project.status = 'published') and location_project.deleted_at is null
      limit $1
      offset $2
    `

    const projects = await sequelize.query(sql, { bind: [limit, offset], raw: true }).then(([rows, _]) => rows) as Array<{ id: string }>
    offset += limit
    responseCount = projects.length

    for (const project of projects) {
      const { id, ...body } = project
      await client.index({ id, body, index: 'projects', refresh: true })
    }
  }

  await client.indices.refresh({
    index: 'projects'
  })
}
