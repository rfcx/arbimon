import * as fs from 'fs'
import { camelCase } from 'lodash-es'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { jsonToTs } from '@rfcx-bio/utils/file/json-to-ts'

const currentDir = dirname(fileURLToPath(import.meta.url))
const pathToRoot = '../../'

const EXT_JSON = '.json'
const EXT_TS = '.ts'

const main = async (): Promise<void> => {
  // Validate inputs
  const filepath = process.argv[process.argv.length - 1]
  if (!filepath) {
    console.info('Usage: pnpm serve lib/tools/json-to-ts.ts -- out/raw-sites.json')
    return
  }

  // Resolve paths
  const inputFilepath = resolve(currentDir, pathToRoot, filepath)
  const outputFilepath = inputFilepath.slice(0, -EXT_JSON.length) + EXT_TS
  const filename = inputFilepath.slice(inputFilepath.lastIndexOf('/') + 1)
  const outputConstName = camelCase(filename.slice(0, filename.lastIndexOf('.')))

  // Read, process, write
  const json = fs.readFileSync(inputFilepath, 'utf8')
  const ts = jsonToTs(json, outputConstName)
  fs.writeFileSync(outputFilepath, ts, 'utf8')
  console.info(`Written to: ${outputFilepath}`)
}

await main()
