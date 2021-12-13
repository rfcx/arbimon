import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { rawSpeciesWithCall } from './raw-species-with-call'
import { rawSpeciesWithInfo } from './raw-species-with-info'

// Script config
const currentDir = dirname(new URL(import.meta.url).pathname)
const outputFilePath = resolve(currentDir, './species-with-information.json')

const speciesOutput = rawSpeciesWithInfo.map(i => {
  const speciesWithCall = rawSpeciesWithCall.find(j => i.scientificName === j.scientificName)
  return {
    ...i,
    speciesCall: speciesWithCall?.speciesCall
  }
})

// Write output
const json = JSON.stringify(speciesOutput, null, 2)
fs.writeFileSync(outputFilePath, json, 'utf8')
console.log(`Finished writing to ${outputFilePath}`)
