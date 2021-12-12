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
  // Bypass non-aliases
  if (!specifier.startsWith('@rfcx-bio')) return resolveTs(specifier, ctx, defaultResolve)

  // Replace aliases
  const match = matchPath(specifier)
  return match
    ? resolveTs(pathToFileURL(`${match}`).href, ctx, defaultResolve)
    : resolveTs(specifier, ctx, defaultResolve)
}

export { load, transformSource } from 'ts-node/esm'
