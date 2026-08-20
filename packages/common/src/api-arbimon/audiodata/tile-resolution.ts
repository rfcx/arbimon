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
 *
 * ⚠️ This is the PER-TILE cap for the ASSUMED tile count below. When the
 * caller reports how many tiles the page actually renders, the effective
 * ceiling comes from autoTileWidthCeiling(), which spends the SAME page budget
 * over the REAL tile count. See that function for why.
 */
export const MAX_AUTO_TILE_WIDTH = 1024

/**
 * The tile count the MAX_AUTO_TILE_WIDTH reasoning assumed. The shipped base
 * spectrogram was a fixed 10286px → ceil(10286/1024) = 11 columns, so "~7.1
 * MiB/page at 1024" implicitly meant "11 tiles at 1024".
 */
export const ASSUMED_TILE_COUNT = 11

/**
 * The page-level source-pixel budget the AUTO ceiling actually accepted:
 * 11 tiles x 1024px. Bytes scale ~linearly with source width (measured 3.75 /
 * 7.42 / 14.03 / 25.38 MiB per 11-tile page at 512/1024/2048/4096), so holding
 * this constant holds the accepted ~7.4 MiB/page cost constant.
 */
export const AUTO_PAGE_SOURCE_PX_BUDGET = ASSUMED_TILE_COUNT * MAX_AUTO_TILE_WIDTH

/** Upscale factor we try to stay under before stepping the source size up. */
export const MAX_UPSCALE = 2

/**
 * The automatic escalation ceiling for a page that renders `tileCount` tiles.
 *
 * WHY TILE-COUNT-AWARE: the 1024 cap encodes a PAGE budget, not a per-tile
 * principle — "don't let zoom silently pull ~20 MiB" assumed ~11 tiles. Once
 * the server sizes the base spectrogram by recording duration, a short
 * recording renders as ONE tile, and capping that lone tile at 1024 spends
 * ~9% of the accepted budget while breaking the MAX_UPSCALE invariant this
 * module exists to hold (a 0.963s recording displays at ~2244px → 2.19x
 * upscale from 1024). One tile at 4096 costs ~2.3 MiB — well inside the
 * budget the cap was protecting.
 *
 * The ceiling is the largest ladder step whose total page cost stays within
 * AUTO_PAGE_SOURCE_PX_BUDGET, never below MAX_AUTO_TILE_WIDTH:
 *   1 tile → 4096 · 2 → 4096 · 3-5 → 2048 · >=6 → 1024 (today's behaviour).
 * Unknown/invalid tile counts fall back to the flat cap, so every existing
 * caller and stored expectation is unchanged unless the count is supplied.
 */
export const autoTileWidthCeiling = (tileCount?: number): number => {
  if (tileCount === undefined || !Number.isFinite(tileCount) || tileCount <= 0) return MAX_AUTO_TILE_WIDTH
  const budgetPerTile = AUTO_PAGE_SOURCE_PX_BUDGET / tileCount
  let ceiling = MAX_AUTO_TILE_WIDTH
  for (const step of TILE_WIDTH_STEPS) {
    if (step <= budgetPerTile && step > ceiling) ceiling = step
  }
  return ceiling
}

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
 * @param tileCount      how many tiles the page renders — lets the AUTO
 *                       ceiling spend the page budget over the real count
 * @returns a quantised width, never below DEFAULT_TILE_WIDTH
 */
export const resolveTileWidth = (displayWidthPx: number, userWidth?: number, tileCount?: number): number => {
  const floor = Math.max(DEFAULT_TILE_WIDTH, userWidth ?? DEFAULT_TILE_WIDTH)
  if (!Number.isFinite(displayWidthPx) || displayWidthPx <= 0) return floor
  // The smallest quantised width that keeps upscale <= MAX_UPSCALE, bounded by
  // the auto ceiling. An explicit user choice can exceed the auto ceiling.
  const needed = displayWidthPx / MAX_UPSCALE
  // Ceiling rules:
  //  - automatic (zoom-driven) escalation stops at the tile-count-aware
  //    ceiling, so a user who never touches the control cannot silently pull
  //    more than the accepted ~7.4 MiB page budget;
  //  - an EXPLICIT user preference raises the floor AND unlocks the full
  //    ladder, because someone who asked for 2048 has accepted the cost and
  //    should still get sharper tiles as they zoom further in.
  const autoCeiling = autoTileWidthCeiling(tileCount)
  const ceiling = userWidth !== undefined && userWidth > autoCeiling
    ? TILE_WIDTH_STEPS[TILE_WIDTH_STEPS.length - 1]
    : autoCeiling
  return quantiseUp(needed, TILE_WIDTH_STEPS, floor, Math.max(ceiling, floor))
}

/**
 * The user-facing quality tiers.
 *
 * NAMED, QUANTISED TIERS -- NOT A FREE-FORM SLIDER. Dimensions are part of the
 * media-api result cache key on the durable tier, so a continuous 256..1024
 * control would store 3,845 variants per tile window where this stores 15.
 * Same reasoning that makes the token's hourly `exp` bucketing load-bearing.
 *
 * 4096 is deliberately NOT offered. Measured on a real 11-tile recording:
 * 3.75 / 7.42 / 14.03 / 25.38 MiB per page at 512 / 1024 / 2048 / 4096, because
 * the visualizer renders the FULL tile set with no virtualisation. 2048 is
 * already a deliberate 14 MiB choice; 4096 stays reachable only by the
 * zoom-aware floor on top of a 2048 preference (which is bounded by how far a
 * user can actually zoom).
 *
 * `width` is what gets passed to resolveTileWidth() as the user preference.
 * Selecting STANDARD is equivalent to expressing no preference at all -- it
 * floors at the shipped default and still auto-escalates with zoom (pinned by
 * tests, because a preference that acted as a CEILING would silently disable
 * zoom sharpening).
 */
export const TILE_QUALITY_TIERS = [
  { id: 'standard', label: 'Standard', width: 512, approxMiBPerPage: 3.8 },
  { id: 'high', label: 'High', width: 1024, approxMiBPerPage: 7.4 },
  { id: 'maximum', label: 'Maximum', width: 2048, approxMiBPerPage: 14 }
] as const

export type TileQualityTierId = typeof TILE_QUALITY_TIERS[number]['id']

export const DEFAULT_TILE_QUALITY: TileQualityTierId = 'standard'

/**
 * Resolve a stored preference to a tier width, tolerating anything.
 *
 * Returns the DEFAULT tier's width for unknown/absent input rather than
 * `undefined`, so a corrupted localStorage value degrades to today's shipped
 * behaviour instead of an unpredictable one.
 */
export const tileQualityWidth = (tierId: string | null | undefined): number => {
  const tier = TILE_QUALITY_TIERS.find(t => t.id === tierId)
  return (tier ?? TILE_QUALITY_TIERS[0]).width
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
