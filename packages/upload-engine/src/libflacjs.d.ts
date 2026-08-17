/**
 * Local module shims for libflacjs deep imports (client-side FLAC encoding).
 *
 * libflacjs 5.6.0 ships BROKEN type declarations: its ts-5.6 compat files
 * import { Flac } from '../index.d', which has no such export — any tsc run
 * that resolves the package's own types fails on the library's .d.ts, not
 * ours. We import the runtime bundles directly (dist/ + lib/) and type them
 * as any here; the surfaces we use are pinned by the encode/decode parity
 * tests rather than by declarations.
 */

declare module 'libflacjs/dist/libflac.js'

declare module 'libflacjs/lib/encoder' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Encoder: any
}

declare module 'libflacjs/lib/decoder' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Decoder: any
}
