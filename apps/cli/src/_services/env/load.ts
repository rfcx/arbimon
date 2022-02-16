import * as dotenv from 'dotenv'
import fs from 'fs/promises'
import { dirname, resolve } from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

import { envGetters } from './keys'
import { PROTECTION_VALUES } from './types'

const loadDotEnv = async (): Promise<Record<string, string>> => {
  const currentDir = dirname(fileURLToPath(import.meta.url))
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
  const envExisting = Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => Object.keys(envGetters).includes(key))
  )

  return Object.assign(envMerged, envExisting) // existing process.env variables take precedence
}

const env = await loadDotEnv()

type EnvGetter = typeof envGetters
type EnvKey = keyof EnvGetter
type EnvOptional <Keys extends EnvKey> = { [K in Keys]: ReturnType<EnvGetter[K]> }
type EnvRequired <Keys extends EnvKey> = { [K in Keys]: Exclude<ReturnType<EnvGetter[K]>, undefined> }

export const optionalEnv = <T extends EnvKey> (...keys: T[]): EnvOptional<T> => {
  return Object.fromEntries(
    Object.entries(envGetters)
      .filter(([key]) => keys.includes(key as T))
      .map(([key, getter]) => [key, getter(env, key)])
  ) as EnvOptional<T>
}

export const requireEnv = <T extends EnvKey> (...keys: T[]): EnvRequired<T> => {
  return Object.fromEntries(
    Object.entries(envGetters)
      .filter(([key]) => keys.includes(key as T))
      .map(([key, getter]) => {
        const value = getter(env, key)
        if (value === undefined) throw new Error(`Missing required environment variable: ${key}`)
        return [key, value]
      })
  ) as EnvRequired<T>
}

const warnIfProtected = async (): Promise<void> => {
  const { PROTECTION } = requireEnv('PROTECTION')
  if (PROTECTION !== PROTECTION_VALUES.OFF) {
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

await warnIfProtected()
