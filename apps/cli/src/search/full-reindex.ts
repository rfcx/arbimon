import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

export const fullReindex = async (client: Client, sequelize: Sequelize): Promise<void> => {
  // Create indices if needed
  const indices = await client.cat.indices({ format: 'json' }).then(response => response.body) as Array<{ index: string }>
  const requiredIndexes = ['projects', 'organizations']
  for (const indexName of requiredIndexes) {
    if (indices.find(index => index.index === indexName) !== undefined) continue
    await client.indices.create({ index: indexName })
  }

  // Index projects
  const sql = `
    select p.id, p.name, p.slug, p.created_at, p.updated_at, p.latitude_north, p.latitude_south, p.longitude_east, p.longitude_west, pp.summary, pp.readme, pm.species_count, pm.min_date, pm.max_date, pm.detection_minutes_count 
    from location_project p 
      left join location_project_profile pp on p.id = pp.location_project_id
      left join location_project_metric pm on p.id = pm.location_project_id;
  `
  const projects = await sequelize.query(sql, { raw: true }).then(([rows, _]) => rows) as Array<{ id: string }>
  for (const project of projects) {
    const { id, ...body } = project
    await client.index({ id, body, index: 'projects', refresh: true })
  }
}
