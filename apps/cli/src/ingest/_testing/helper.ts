import { Sequelize } from 'sequelize'

export const deleteOutputProjects = async (biodiversitySequelize: Sequelize): Promise<void> => {
  await biodiversitySequelize.query('DELETE FROM sync_log_by_project')
  await biodiversitySequelize.query('DELETE FROM location_project_species')
  await biodiversitySequelize.query('DELETE FROM location_project_species_file')
  await biodiversitySequelize.query('DELETE FROM data_source')
  await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
  await biodiversitySequelize.query('DELETE FROM recording_by_site_hour')
  await biodiversitySequelize.query('DELETE FROM location_site')
  await biodiversitySequelize.query('DELETE FROM location_project_profile')
  await biodiversitySequelize.query('DELETE FROM project_version')
  await biodiversitySequelize.query('DELETE FROM location_project')
}
