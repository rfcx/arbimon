import * as fs from 'fs'
import { resolve } from 'path'

import { getLogFileOutputDirectory } from '../../_services/output'
import { ArbimonHourlyDetectionSummary } from './input'

export const saveFiles = async (summaries: ArbimonHourlyDetectionSummary[], filePath: string): Promise<void> => {
  const outputJsonPath = resolve(getLogFileOutputDirectory(), `./${filePath}.json`)
  const outputJson = JSON.stringify(summaries, undefined, 2)
  fs.writeFileSync(outputJsonPath, outputJson, 'utf8')
  console.info(`Finished writing to\n- ${outputJsonPath}`)
}
