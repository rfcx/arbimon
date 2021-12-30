import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { rawSpeciesFromArbimon } from './raw-species-from-arbimon'
import { rawSpeciesWithInfo } from './raw-species-with-info'

// Script config
const currentDir = dirname(new URL(import.meta.url).pathname)
const outputFilePath = resolve(currentDir, './raw-species.json')
// const outputTsConstName = 'rawSpecies'

const speciesOutput = rawSpeciesWithInfo.map(i => {
  const speciesWithCall = rawSpeciesFromArbimon.find(j => i.scientificName === j.scientificName)
  return {
    ...i,
    speciesCall: speciesWithCall?.speciesCall
  }
})

// Write output
const json = JSON.stringify(speciesOutput, null, 2)
fs.writeFileSync(outputFilePath, json, 'utf8')
console.info(`Finished writing to ${outputFilePath}`)
