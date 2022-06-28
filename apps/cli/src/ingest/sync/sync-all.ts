import { Sequelize } from 'sequelize'

import { syncArbimonProjects } from './sync-arbimon-project'

export const syncAllIncrementally = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    await syncArbimonProjects(arbimonSequelize, biodiversitySequelize)
  } catch (e) {
    console.error(e)
  }
}
