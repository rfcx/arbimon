/**
 * The Node ESM loader does not currently support tsconfig-paths
 * This is a custom loader from https://github.com/TypeStrong/ts-node/discussions/1450
 */

import { resolve as resolveTs } from 'ts-node/esm'
import * as tsConfigPaths from 'tsconfig-paths'
import { pathToFileURL } from 'url'

const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig()
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths)

export function resolve (specifier, ctx, defaultResolve) {
  // Pass-through lib imports
  if (!specifier.startsWith('@rfcx-bio')) return resolveTs(specifier, ctx, defaultResolve)

  const lastIndexOfIndex = specifier.lastIndexOf('/index.js')
  if (lastIndexOfIndex !== -1) {
    // Handle index.js
    const trimmed = specifier.substring(0, lastIndexOfIndex)
    const match = matchPath(trimmed)
    if (match) return resolveTs(pathToFileURL(`${match}/index.js`).href, ctx, defaultResolve)
  } else if (specifier.endsWith('.js')) {
    // Handle *.js
    const trimmed = specifier.substring(0, specifier.length - 3)
    const match = matchPath(trimmed)
    if (match) return resolveTs(pathToFileURL(`${match}.js`).href, ctx, defaultResolve)
  }

  return resolveTs(specifier, ctx, defaultResolve)
}

export { load, transformSource } from 'ts-node/esm'
