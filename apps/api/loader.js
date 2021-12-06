/**
 * The Node ESM loader does not currently support tsconfig-paths
 * This is a custom loader from https://github.com/TypeStrong/ts-node/discussions/1450
 */

import { lstatSync } from 'fs'
import { resolve as resolveTs } from 'ts-node/esm'
import { createMatchPath, loadConfig } from 'tsconfig-paths'

/**
  * @file Helpers - Custom ESM Loader
  * @module tools/loaders/esm
  * @see https://github.com/TypeStrong/ts-node/issues/1007
  */

/** @typedef {'builtin'|'commonjs'|'dynamic'|'json'|'module'|'wasm'} Format */

/**
  * Custom resolver that handles TypeScript path mappings.
  *
  * @see https://github.com/TypeStrong/ts-node/discussions/1450
  * @see https://github.com/dividab/tsconfig-paths
  *
  * @async
  * @param {string} specifier - Name of file to resolve
  * @param {{ parentURL: string }} ctx - Resolver context
  * @param {typeof resolveTs} defaultResolve - Default resolver function
  * @return {Promise<{ url: string }>} Promise containing object with file path
  */
export const resolve = async (specifier, ctx, defaultResolve) => {
  // Get base URL and path aliases
  const { absoluteBaseUrl, paths } = loadConfig(process.cwd())

  // CHAZ: Allow /index.js
  // TODO: Use convention and bypass the lstatSync call
  const lastIndexOfIndex = specifier.lastIndexOf('/index.js')
  const trimmed = lastIndexOfIndex === -1 ? specifier : specifier.substring(0, lastIndexOfIndex)

  // Attempt to resolve path based on path aliases
  const match = createMatchPath(absoluteBaseUrl, paths)(trimmed)

  // Update specifier if match was found
  if (match) {
    try {
      const directory = lstatSync(match).isDirectory()
      console.log(specifier, `${match}${directory ? '/index.js' : '.js'}`)
      specifier = `${match}${directory ? '/index.js' : '.js'}`
    } catch {
      specifier = `${match}.js`
    }
  }

  return resolveTs(specifier, ctx, defaultResolve)
}

export { load, transformSource } from 'ts-node/esm'
