/**
 * Visualizer tile SOURCE RESOLUTION policy.
 *
 * WHY THIS IS A SEPARATE MODULE
 * -----------------------------
 * Two features need the same decision and must not drift apart:
 *   1. a zoom-aware floor  — don't upscale a tile more than ~2x horizontally
 *   2. a user resolution control — an explicit quality preference
 * Both resolve to ONE number (the source width to request), so the policy lives
 * in one place with the reasoning attached.
 *
 * WHY IT IS SAFE TO DECIDE THIS CLIENT-SIDE
 * -----------------------------------------
 * The media-api stream-token signs `streamId_startMs_endMs[_exp]` — the SOURCE
 * WINDOW — and deliberately NOT the render parameters. Verified live: swapping
 * the palette or the dimensions on a minted URL still returns 200, while
 * altering the time window returns 401. So the browser may re-request the same
 * window at a different size using the SAME token: no re-mint, no server
 * round-trip.
 *
 * 🔴 QUANTISE. DO NOT INTERPOLATE.
 * Dimensions are part of the media-api RESULT CACHE KEY, and that cache is on
 * the durable tier. A free-form slider over 256..1024 would produce 769 widths
 * x 5 palettes = 3,845 stored variants per tile window; the quantised ladder
 * produces 15. A continuous control is a cache-explosion, which is the same
 * reasoning that makes the token's `exp` bucketing load-bearing.
 *
 * HEIGHT IS CAPPED AT 1024 BY THE SERVER, WIDTH IS NOT.
 * media-api's `checkAttrsValidity` rejects a height > 1024 with a 400
 * ("Spectrogram height can not be greater than 1024px"). Width has no such
 * check — verified live at 4096x1024 (HTTP 200, 1.9 MB, ~1.5 s cold).
 */

/** Quantised source widths. Powers of two keep the cache-key space tiny. */
export const TILE_WIDTH_STEPS = [512, 1024, 2048, 4096] as const

/** Quantised source heights. 1024 is the server's hard ceiling. */
export const TILE_HEIGHT_STEPS = [256, 512, 1024] as const

/**
 * Today's shipped default (2026-08-10). Also the FLOOR for the automatic
 * zoom escalation: auto-scaling must never render worse than the default.
 */
export const DEFAULT_TILE_WIDTH = 512
export const DEFAULT_TILE_HEIGHT = 1024

/**
 * Widths the zoom-aware floor may escalate to WITHOUT the user asking.
 *
 * Capped at 1024 on purpose. Holding "<= 2x upscale" all the way to max zoom
 * would need ~4774px sources, i.e. ~20 MiB per page (measured: 4096px tiles are
 * 1.9 MB each and ALL 11 tiles load — the template renders the full tile set,
 * there is no virtualisation). 1024 gives the large visible win at moderate
 * zoom for ~7.1 MiB; 2048/4096 stay behind an explicit user choice.
 */
export const MAX_AUTO_TILE_WIDTH = 1024

/** Upscale factor we try to stay under before stepping the source size up. */
export const MAX_UPSCALE = 2

const quantiseUp = (value: number, steps: readonly number[], floor: number, ceiling: number): number => {
  const min = Math.max(floor, steps[0])
  const max = Math.min(ceiling, steps[steps.length - 1])
  for (const step of steps) {
    if (step < min) continue
    if (step >= max) return max
    if (value <= step) return step
  }
  return max
}

/**
 * Choose the source WIDTH for a tile.
 *
 * @param displayWidthPx how wide the tile is actually drawn (zoom-dependent)
 * @param userWidth      the user's explicit preference, if any
 * @returns a quantised width, never below DEFAULT_TILE_WIDTH
 */
export const resolveTileWidth = (displayWidthPx: number, userWidth?: number): number => {
  const floor = Math.max(DEFAULT_TILE_WIDTH, userWidth ?? DEFAULT_TILE_WIDTH)
  if (!Number.isFinite(displayWidthPx) || displayWidthPx <= 0) return floor
  // The smallest quantised width that keeps upscale <= MAX_UPSCALE, bounded by
  // the auto ceiling. An explicit user choice can exceed the auto ceiling.
  const needed = displayWidthPx / MAX_UPSCALE
  // Ceiling rules:
  //  - automatic (zoom-driven) escalation stops at MAX_AUTO_TILE_WIDTH, so a
  //    user who never touches the control cannot silently pull ~20 MiB/page;
  //  - an EXPLICIT user preference raises the floor AND unlocks the full
  //    ladder, because someone who asked for 2048 has accepted the cost and
  //    should still get sharper tiles as they zoom further in.
  const ceiling = userWidth !== undefined && userWidth > MAX_AUTO_TILE_WIDTH
    ? TILE_WIDTH_STEPS[TILE_WIDTH_STEPS.length - 1]
    : MAX_AUTO_TILE_WIDTH
  return quantiseUp(needed, TILE_WIDTH_STEPS, floor, Math.max(ceiling, floor))
}

/** Choose the source HEIGHT for a tile (server caps at 1024). */
export const resolveTileHeight = (userHeight?: number): number => {
  const h = userHeight ?? DEFAULT_TILE_HEIGHT
  return quantiseUp(h, TILE_HEIGHT_STEPS, TILE_HEIGHT_STEPS[0], DEFAULT_TILE_HEIGHT)
}

/**
 * Build the media-api render-attribute segment for a tile.
 * `palette` is the visualizer's per-user spectro colour token (mtrue/mfalse…).
 */
export const buildTileRenderAttrs = (palette: string, width: number, height: number): string =>
  `z95_wdolph_g1_fspec_${palette}_d${width}.${height}.png`
