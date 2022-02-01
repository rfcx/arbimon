import * as dotenv from 'dotenv'
import fs from 'fs/promises'
import { dirname, resolve } from 'path'
import readline from 'readline'

import { envKeysOptional, envKeysRequired, OFF } from './keys'

const loadDotEnv = async (): Promise<void> => {
  const currentDir = dirname(new URL(import.meta.url).pathname)
  const pathToRoot = '../../../'

  // Detect mode
  // TODO: Do we need a ENV variable to set this when deployed?
  const mode = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1].toLowerCase() ?? 'dev'
  console.info(`*** Biodiversity CLI ***\nRunning in ${mode.toUpperCase()} mode`)

  // Import layered env
  const envFiles = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`
  ]

  const envs = await Promise.all(
    envFiles
      .map(f => resolve(currentDir, pathToRoot, f))
      .map(async f => await fs.readFile(f, 'utf8').catch(() => ''))
  )

  const envMerged = Object.assign({}, ...envs.map(e => dotenv.parse(e)))
  Object.assign(process.env, envMerged, process.env) // existing process.env variables take precedence
}

const warnIfProtected = async (env: Env): Promise<void> => {
  if (env.PROTECTION !== OFF) {
    // Request confirmation to proceed
    const ui = readline.createInterface({ input: process.stdin, output: process.stdout })
    const result = await new Promise<string>(resolve => ui.question('This is a protected mode - are you sure you want to continue? (y|N)', answer => resolve(answer)))
    ui.close()

    // Kill if no confirmation
    if (result.toLowerCase() !== 'y') {
      console.info('Quitting...\n')
      process.exit(0)
    } else {
      console.info('Continuing...\n')
    }
  }
}

await loadDotEnv()

export const env = process.env as Env
export type Env = Record<typeof envKeysRequired[number], string> & Record<typeof envKeysOptional[number], string | undefined>

await warnIfProtected(env)
