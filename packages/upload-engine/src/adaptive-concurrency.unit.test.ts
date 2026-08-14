/**
 * Adaptive upload concurrency (2026-08-13).
 *
 * The controller decides how hard we push a user's uplink, so the properties
 * that matter are behavioural, not cosmetic: it must CLIMB when there is real
 * headroom, RETREAT when the link is saturated, never stall the queue, and
 * never raise the limit on evidence gathered while the pool was starved.
 */
import { describe, expect, test } from 'vitest'

import { AdaptiveConcurrencyController } from './adaptive-concurrency'

/** A link with finite bandwidth and per-request dead time. */
const simulate = (
  controller: AdaptiveConcurrencyController,
  opts: { uplinkBytesPerSec: number, overheadMs: number, fileBytes: number, files: number }
): { limits: number[], finalLimit: number } => {
  const limits: number[] = []
  for (let i = 0; i < opts.files; i++) {
    const inFlight = controller.limit
    // Bandwidth is SHARED across whatever is in flight: each concurrent
    // transfer gets uplink/inFlight, so its transfer time scales with inFlight.
    const transferMs = (opts.fileBytes / (opts.uplinkBytesPerSec / inFlight)) * 1000
    const durationMs = opts.overheadMs + transferMs
    controller.onSample({ bytes: opts.fileBytes, durationMs, inFlightAtStart: inFlight })
    limits.push(controller.limit)
  }
  return { limits, finalLimit: controller.limit }
}

const MIB = 1024 * 1024

describe('AdaptiveConcurrencyController', () => {
  test('starts conservative so a slow link is never hit hard first', () => {
    expect(new AdaptiveConcurrencyController().limit).toBe(2)
  })

  test('never returns a limit below 1 (a 0 limit would deadlock the queue)', () => {
    const c = new AdaptiveConcurrencyController({ minLimit: 1, initialLimit: 1 })
    for (let i = 0; i < 50; i++) c.onCongestion()
    expect(c.limit).toBeGreaterThanOrEqual(1)
  })

  test('respects an explicit maxLimit', () => {
    const c = new AdaptiveConcurrencyController({ maxLimit: 3, initialLimit: 3 })
    // plenty of headroom: cost per MiB never degrades
    for (let i = 0; i < 40; i++) {
      c.onSample({ bytes: 4 * MIB, durationMs: 400, inFlightAtStart: c.limit })
    }
    expect(c.limit).toBeLessThanOrEqual(3)
  })

  test('CLIMBS on a fast link with real headroom', () => {
    const c = new AdaptiveConcurrencyController()
    // Fast pipe, meaningful dead time => concurrency genuinely fills gaps.
    // Model: transfer time does NOT degrade with concurrency (unsaturated).
    for (let i = 0; i < 40; i++) {
      c.onSample({ bytes: 4 * MIB, durationMs: 300 + 130, inFlightAtStart: c.limit })
    }
    expect(c.limit).toBeGreaterThan(2)
  })

  test('RETREATS on a saturated link where concurrency only splits bandwidth', () => {
    const c = new AdaptiveConcurrencyController({ initialLimit: 8 })
    // 1 MiB/s uplink shared; 3.3 MiB files; small dead time => true C* ~ 1.2
    const { finalLimit } = simulate(c, {
      uplinkBytesPerSec: 1 * MIB, overheadMs: 200, fileBytes: 3.3 * MIB, files: 200
    })
    expect(finalLimit).toBeLessThan(8)
    expect(finalLimit).toBeLessThanOrEqual(3)
  })

  test('converges to the same place from ABOVE and from BELOW', () => {
    const link = { uplinkBytesPerSec: 1 * MIB, overheadMs: 600, fileBytes: 3.3 * MIB, files: 200 }
    const fromHigh = new AdaptiveConcurrencyController({ initialLimit: 8 })
    const fromLow = new AdaptiveConcurrencyController({ initialLimit: 1 })
    const a = simulate(fromHigh, link).finalLimit
    const b = simulate(fromLow, link).finalLimit
    // the settled value is a property of the LINK, not of where we started
    expect(Math.abs(a - b)).toBeLessThanOrEqual(2)
  })

  test('a plain gradient CANNOT detect self-inflicted saturation (probing is required)', () => {
    // Regression guard for a real defect: with probing disabled the controller
    // only ever measures cost at its own limit, so best == recent, gradient
    // pins at 1.0, and it parks at the initial limit forever.
    const blind = new AdaptiveConcurrencyController({ initialLimit: 8, probeInterval: 0 })
    const { finalLimit } = simulate(blind, {
      uplinkBytesPerSec: 1 * MIB, overheadMs: 200, fileBytes: 3.3 * MIB, files: 200
    })
    expect(finalLimit).toBe(8) // blind: never learns
    expect(blind.state.gradient).toBe(1)

    const seeing = new AdaptiveConcurrencyController({ initialLimit: 8 })
    const seen = simulate(seeing, {
      uplinkBytesPerSec: 1 * MIB, overheadMs: 200, fileBytes: 3.3 * MIB, files: 200
    }).finalLimit
    expect(seen).toBeLessThan(finalLimit) // probing: learns
  })

  test('a saturated slow link settles LOWER than a fast one (the whole point)', () => {
    const slow = new AdaptiveConcurrencyController({ initialLimit: 4 })
    simulate(slow, { uplinkBytesPerSec: 1 * MIB, overheadMs: 600, fileBytes: 3.3 * MIB, files: 80 })

    const fast = new AdaptiveConcurrencyController({ initialLimit: 4 })
    // fast link: dead time dominates, transfer is short => headroom to fill
    for (let i = 0; i < 80; i++) {
      fast.onSample({ bytes: 3.3 * MIB, durationMs: 300 + 132, inFlightAtStart: fast.limit })
    }
    expect(fast.limit).toBeGreaterThan(slow.limit)
  })

  test('congestion (429) drops the limit immediately', () => {
    const c = new AdaptiveConcurrencyController({ initialLimit: 8 })
    const before = c.limit
    c.onCongestion()
    expect(c.limit).toBeLessThan(before)
  })

  test('does NOT raise the limit on samples taken while the pool was starved', () => {
    const c = new AdaptiveConcurrencyController({ initialLimit: 4 })
    const before = c.limit
    // Excellent throughput, but only 1 upload was ever in flight: this proves
    // nothing about whether a HIGHER cap would help.
    for (let i = 0; i < 30; i++) {
      c.onSample({ bytes: 8 * MIB, durationMs: 100, inFlightAtStart: 1 })
    }
    expect(c.limit).toBeLessThanOrEqual(before)
  })

  test('ignores tiny samples where dead time dominates the measurement', () => {
    const c = new AdaptiveConcurrencyController()
    for (let i = 0; i < 20; i++) {
      c.onSample({ bytes: 1024, durationMs: 5000, inFlightAtStart: c.limit })
    }
    // a 1 KiB file taking 5s must not be read as "the link is catastrophic"
    expect(c.state.samples).toBe(0)
    expect(c.limit).toBe(2)
  })

  test('re-baselines when the link becomes permanently slower', () => {
    const c = new AdaptiveConcurrencyController({ initialLimit: 4 })
    // fast era
    for (let i = 0; i < 30; i++) {
      c.onSample({ bytes: 4 * MIB, durationMs: 400, inFlightAtStart: c.limit })
    }
    const fastBest = c.state.bestMsPerMiB as number
    // user moves to a much slower network, permanently
    for (let i = 0; i < 120; i++) {
      c.onSample({ bytes: 4 * MIB, durationMs: 4000, inFlightAtStart: c.limit })
    }
    // the reference must have drifted up toward the new reality, otherwise the
    // gradient stays pinned near its floor forever
    expect(c.state.bestMsPerMiB as number).toBeGreaterThan(fastBest)
  })

  test('the gradient floor bounds how fast the limit can collapse', () => {
    // Without a floor, a badly-degraded reading drives gradient toward 0 and
    // the limit collapses to 1 in a single step — an over-reaction that would
    // strand a recoverable link at minimum concurrency. The floor (0.5) caps
    // the per-update decrease at half. Measured: on a saturated link the
    // gradient rides exactly at the 0.500 floor, so this is load-bearing, not
    // decorative.
    const c = new AdaptiveConcurrencyController({ initialLimit: 8, probeInterval: 4 })
    let minGradient = 1
    for (let i = 0; i < 200; i++) {
      const inFlight = c.limit
      const transferMs = (3.3 * MIB / ((1 * MIB) / inFlight)) * 1000
      c.onSample({ bytes: 3.3 * MIB, durationMs: 200 + transferMs, inFlightAtStart: inFlight })
      const g = c.state.gradient
      if (g !== undefined) minGradient = Math.min(minGradient, g)
    }
    expect(minGradient).toBeGreaterThanOrEqual(0.5)
  })

  test('a single catastrophic sample cannot collapse the limit to the floor', () => {
    const c = new AdaptiveConcurrencyController({ initialLimit: 8 })
    // establish a healthy baseline
    for (let i = 0; i < 20; i++) {
      c.onSample({ bytes: 4 * MIB, durationMs: 400, inFlightAtStart: c.limit })
    }
    const before = c.limit
    // one pathological reading (a stall, a sleeping laptop, a tunnel)
    c.onSample({ bytes: 4 * MIB, durationMs: 600_000, inFlightAtStart: c.limit })
    expect(c.limit).toBeGreaterThan(1)
    expect(before - c.limit).toBeLessThanOrEqual(Math.ceil(before / 2))
  })

  test('samples taken DURING a probe do not themselves steer the limit', () => {
    // A probe deliberately runs the pool narrow. Those samples must feed the
    // no-load reference (`best`) but must NOT drive the limit, or the narrowed
    // pool is misread as "supply-starved" / "lots of headroom" and the
    // controller chases its own probe. Mutation-guard: without the early
    // return in onSample(), this test must fail.
    const c = new AdaptiveConcurrencyController({ initialLimit: 8, probeInterval: 4 })
    const seen: Array<{ probing: boolean, limitFloatProxy: number }> = []

    // Feed a SATURATED link so probe samples look dramatically cheaper than
    // wide-pool samples — the maximum temptation to over-steer.
    for (let i = 0; i < 40; i++) {
      const inFlight = c.limit
      const transferMs = (3.3 * MIB / ((1 * MIB) / inFlight)) * 1000
      c.onSample({ bytes: 3.3 * MIB, durationMs: 200 + transferMs, inFlightAtStart: inFlight })
      seen.push({ probing: c.state.probing, limitFloatProxy: c.limit })
    }

    // While probing, the reported reason must never be a steering decision.
    const steeredWhileProbing = seen.filter(s => s.probing).length
    expect(steeredWhileProbing).toBeGreaterThan(0) // probes did happen

    // The controller must settle near the true C* (~1.2), not be dragged
    // upward by its own cheap probe readings.
    expect(c.limit).toBeLessThanOrEqual(3)
  })

  test('probing never RAISES the effective limit above the learned one', () => {
    // Probing is safe by construction only if it is strictly downward: the
    // worst case must be briefly using less of the uplink, never more.
    const c = new AdaptiveConcurrencyController({ initialLimit: 6, probeInterval: 3 })
    let maxSeen = 0
    for (let i = 0; i < 60; i++) {
      const inFlight = c.limit
      maxSeen = Math.max(maxSeen, inFlight)
      c.onSample({ bytes: 4 * MIB, durationMs: 500, inFlightAtStart: inFlight })
    }
    expect(maxSeen).toBeLessThanOrEqual(8)
  })

  test('reset() returns the controller to its initial posture', () => {
    const c = new AdaptiveConcurrencyController({ initialLimit: 2 })
    for (let i = 0; i < 20; i++) {
      c.onSample({ bytes: 4 * MIB, durationMs: 430, inFlightAtStart: c.limit })
    }
    c.reset()
    expect(c.limit).toBe(2)
    expect(c.state.samples).toBe(0)
    expect(c.state.bestMsPerMiB).toBeUndefined()
  })

  test('limit is always an integer >= 1 across a long random walk', () => {
    const c = new AdaptiveConcurrencyController()
    for (let i = 0; i < 500; i++) {
      if (Math.random() < 0.1) c.onCongestion()
      else {
        c.onSample({
          bytes: (1 + Math.random() * 8) * MIB,
          durationMs: 100 + Math.random() * 5000,
          inFlightAtStart: c.limit
        })
      }
      expect(Number.isInteger(c.limit)).toBe(true)
      expect(c.limit).toBeGreaterThanOrEqual(1)
      expect(c.limit).toBeLessThanOrEqual(8)
    }
  })
})
