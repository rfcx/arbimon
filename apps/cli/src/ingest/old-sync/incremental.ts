import { Sequelize } from 'sequelize'

export const syncIncremental = async (arbimonSequelize: Sequelize, bioSequelize: Sequelize): Promise<void> => {
  console.info('Incremental sync start')
  try {
    // TODO: select project to sync
    // TODO: check latest project version
    // TODO: sync detections
    // TODO: sync recordings
    // TODO: sync sites

    // TODO: stamp sync history

    // TODO: sync species info (if needed)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Incremental sync end: failed')
  }
}
