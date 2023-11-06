import { type BindOrReplacements, type Sequelize, QueryTypes } from 'sequelize'

import { type ProjectLocationResponse } from '@rfcx-bio/common/api-bio/project/project-location'

export const getProjectLocationDao = async (sequelize: Sequelize, locationProjectId: number): Promise<ProjectLocationResponse> => {
  const bind: BindOrReplacements = {
    locationProjectId
  }
  const sql = `
    SELECT country, country_code as code
    FROM location_site
    WHERE location_project_id = ${locationProjectId}
      AND (country_code is not null OR country is not null)
    GROUP BY country, country_code;
  `
  const result = await sequelize.query(sql, { type: QueryTypes.SELECT, bind, raw: true }) as unknown as ProjectLocationResponse[]
  return {
    country: result.map(site => site.country) as unknown as string[],
    code: result.map(site => site.code) as unknown as string[]
  }
}
