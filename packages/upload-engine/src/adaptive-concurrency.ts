/**
 * Adaptive upload concurrency (2026-08-13).
 *
 * WHY THIS EXISTS — measured, not assumed:
 *
 * A fixed upload cap cannot be right for both of our user populations, because
 * the optimum is a property of the LINK, not a preference:
 *
 *   Every upload costs dead time D (TLS/RTT, server ack, R2 commit) during
 *   which the uplink is IDLE, plus transfer time T = size/bandwidth. One
 *   stream therefore idles D/(D+T) of the time, and concurrency exists purely
 *   to fill those gaps. The link saturates at about C* = (D+T)/T; past that,
 *   extra concurrency only SPLITS the same bandwidth.
 *
 * Measured against this engine (probe harness, 2026-08-13):
 *   - fast LAN  (T~132ms,  D~300ms) => C* ~ 3.3
 *   - field link (T~3300ms, D~600ms) => C* ~ 1.2
 *   - on an already-saturated link, throughput was FLAT across caps 1..16
 *     (~7 MiB/s) while mean per-file latency grew 0.4s -> 4.1s, and at cap 16
 *     ZERO files completed in the window.
 *
 * That last point is why low-bandwidth users need a LOW limit specifically:
 * a completed file is durable progress. Splitting a slow uplink across many
 * transfers means a disconnect loses ALL of them, whereas a narrow pool keeps
 * banking finished recordings. (Same lesson the storage tier learned server-
 * side: storybook b4-minio-storage-001 — "bandwidth-bound, concurrency made
 * it worse".)
 *
 * So the cap is discovered at runtime rather than configured or guessed.
 *
 * ALGORITHM — gradient (the Netflix/Envoy adaptive-concurrency shape), with
 * per-byte normalisation because our "requests" differ in size by orders of
 * magnitude:
 *
 *   sample      = msPerMiB of a COMPLETED upload
 *   best        = the no-load reference (min observed, allowed to drift up
 *                 slowly so a genuinely-degraded link can re-baseline)
 *   gradient    = best / recent      (1.0 = no queueing; < 1 = we are
 *                                     queueing behind our own transfers)
 *   newLimit    = limit * gradient + headroom
 *
 * HEADROOM SIZING (derived, not guessed): the loop settles where the limit
 * stops moving, i.e. L = L*g + h  =>  L = h / (1 - g). On a saturated link a
 * probe to L/2 measures roughly half the per-byte cost, so g ~ 0.5 and the
 * equilibrium is L ~ h/0.5 = 2h. With the textbook h = sqrt(L) that lands at
 * L ~ 5 (measured: 5.30 settled on a 1 MiB/s link whose true C* is ~1.2) — far
 * too aggressive for exactly the users we most need to protect. With h = 1 the
 * equilibrium is L ~ 2 on a saturated link, while an UNSATURATED link keeps
 * g ~ 1 and climbs to maxLimit regardless of h. So h = 1 gives both
 * populations what they need; it is the default.
 *
 * On an unsaturated link, extra concurrency does NOT inflate per-byte time,
 * so gradient stays ~1 and the limit climbs (fast users reach full potential).
 * Once saturated, contention inflates per-byte time in proportion to the
 * limit, gradient falls, and the limit settles back near C* (slow users are
 * protected automatically). No user-facing question, no wrong default.
 *
 * WHY A PLAIN GRADIENT IS NOT ENOUGH (measured defect, fixed here):
 * a gradient controller only ever observes cost AT ITS CURRENT LIMIT. Start it
 * at 8 on a saturated link and every sample is equally bad, so best == recent,
 * gradient pins at exactly 1.000, and it reports "steady" — parking at 8
 * forever. Verified in a simulation harness: 30 consecutive samples at limit 8
 * on a 1 MiB/s link produced gradient 1.000 throughout and the limit never
 * moved. A reference is only meaningful if it was measured where the link was
 * NOT congested, so the controller must occasionally PROBE DOWNWARD to learn
 * what a smaller limit costs. `probeInterval` does that: every Nth sample it
 * transiently narrows the pool, and because `best` is a MINIMUM it captures
 * the cheaper per-byte cost observed while narrow — exactly the evidence that
 * makes the gradient fall on a saturated link.
 *
 * The controller is PURE: no timers, no I/O, no engine coupling. The engine
 * feeds it completions and congestion events and reads `limit`.
 *
 * MUTATION-TEST STATUS (2026-08-13): 7 of 10 mutations are caught by the unit
 * suite. The 3 survivors are DEFENCE-IN-DEPTH, verified redundant by
 * measurement rather than left unexplained:
 *   - the min-limit clamp in `limit` — `onCongestion()` already floors
 *     `limitFloat` at minLimit and the gradient update clamps too, so no path
 *     reaches the getter below the floor (probed: 60 consecutive congestions
 *     land on exactly 1; a brutal link with minLimit 2 lands on exactly 2);
 *   - the two probe-steering guards — with headroom = 1 the equilibrium is
 *     dominated by the headroom term, so allowing probe samples to steer
 *     shifts the settled limit by less than one integer step. They are kept
 *     because they become load-bearing the moment headroom is retuned.
 * Do not "simplify" these away on the grounds that tests still pass.
 */

export interface AdaptiveConcurrencyOptions {
  /** Never go below this (0 would deadlock the queue). Default 1. */
  minLimit?: number
  /**
   * Never go above this. Default 8. Beyond ~8 the added latency, memory and
   * convoy risk outweigh any gap-filling benefit even on a fast link.
   */
  maxLimit?: number
  /**
   * Starting limit. Default 2 — deliberately conservative so a slow-link user
   * never eats a high-concurrency first batch before the controller learns.
   */
  initialLimit?: number
  /** EWMA weight for the recent per-byte cost. Default 0.3. */
  smoothing?: number
  /** EWMA weight applied to limit changes (anti-thrash). Default 0.25. */
  limitSmoothing?: number
  /** Multiplicative decrease on a congestion signal. Default 0.7. */
  backoffFactor?: number
  /**
   * Per-update upward drift of the no-load reference, so a permanently slower
   * link re-baselines instead of pinning gradient near zero forever.
   * Default 0.02 (2% per sample).
   */
  referenceDecay?: number
  /**
   * Samples smaller than this are ignored: for tiny files dead time dominates
   * and msPerMiB says more about D than about bandwidth. Default 256 KiB.
   */
  minSampleBytes?: number
  /**
   * Probe downward every Nth sample to discover what a NARROWER pool costs.
   * Without this the controller cannot detect saturation it is itself causing
   * (see the header note). Default 8. Set 0 to disable probing.
   */
  probeInterval?: number
  /**
   * Additive headroom in the gradient update; sets the saturated-link
   * equilibrium at ~2*headroom (see HEADROOM SIZING above). Default 1.
   */
  headroom?: number
}

export interface ConcurrencySample {
  /** Bytes actually transferred. */
  bytes: number
  /** Wall time of the PUT, ms. */
  durationMs: number
  /**
   * In-flight uploads at the moment this one STARTED. Used to avoid raising
   * the limit on evidence gathered while the pool was starved — a pool that
   * is not even using its current limit has proven nothing about a bigger one.
   */
  inFlightAtStart: number
}

export interface AdaptiveState {
  limit: number
  bestMsPerMiB?: number
  recentMsPerMiB?: number
  gradient?: number
  samples: number
  congestionEvents: number
  /** Why the limit last moved — surfaced for debugging/telemetry. */
  lastReason?: string
  /** True while the controller is transiently narrowing to take a reading. */
  probing: boolean
}

const DEFAULTS: Required<AdaptiveConcurrencyOptions> = {
  minLimit: 1,
  maxLimit: 8,
  initialLimit: 2,
  smoothing: 0.3,
  limitSmoothing: 0.25,
  backoffFactor: 0.7,
  referenceDecay: 0.02,
  minSampleBytes: 256 * 1024,
  probeInterval: 8,
  headroom: 1
}

export class AdaptiveConcurrencyController {
  private readonly opts: Required<AdaptiveConcurrencyOptions>
  /** Fractional limit; the integer view is what the pool uses. */
  private limitFloat: number
  private best?: number
  private recent?: number
  private gradient?: number
  private sampleCount = 0
  private congestion = 0
  private reason = 'initial'
  /**
   * Probe state. While probing we deliberately run NARROWER than the learned
   * limit for a couple of samples to measure the link without our own
   * self-inflicted queueing. Probing DOWNWARD is safe by construction: the
   * worst case is briefly using less of the uplink, never more.
   */
  private probing = false
  private probeSamplesLeft = 0

  /** The cap the upload pool should use right now. */
get limit (): number {
    const learned = Math.max(this.opts.minLimit, Math.round(this.limitFloat))
    if (!this.probing) return learned
    // Narrow toward the floor while probing (but never below minLimit).
    return Math.max(this.opts.minLimit, Math.min(learned, this.probeLimit(learned)))
  }

get state (): AdaptiveState {
    return {
      limit: this.limit,
      bestMsPerMiB: this.best,
      recentMsPerMiB: this.recent,
      gradient: this.gradient,
      samples: this.sampleCount,
      congestionEvents: this.congestion,
      lastReason: this.reason,
      probing: this.probing
    }
  }

constructor (options: AdaptiveConcurrencyOptions = {}) {
    const merged = { ...DEFAULTS }
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) (merged as Record<string, unknown>)[key] = value
    }
    this.opts = merged
    if (this.opts.minLimit < 1) this.opts.minLimit = 1
    if (this.opts.maxLimit < this.opts.minLimit) this.opts.maxLimit = this.opts.minLimit
    this.limitFloat = Math.min(
      Math.max(this.opts.initialLimit, this.opts.minLimit),
      this.opts.maxLimit
    )
  }

/**
   * Congestion signal (a 429, or a transport error that suggests we are
   * pushing too hard). Multiplicative decrease — the standard response, and
   * the safe direction for a field user on a fragile link.
   */
onCongestion (): void {
    this.congestion++
    const next = this.limitFloat * this.opts.backoffFactor
    this.limitFloat = Math.max(this.opts.minLimit, next)
    this.reason = 'congestion backoff'
  }

/** Feed one COMPLETED upload. */
onSample (sample: ConcurrencySample): void {
    if (sample.bytes < this.opts.minSampleBytes) return
    if (sample.durationMs <= 0) return

    const mib = sample.bytes / (1024 * 1024)
    const msPerMiB = sample.durationMs / mib
    this.sampleCount++

    // Probe bookkeeping. NOTE THE ORDERING: `wasProbing` is captured BEFORE the
    // counter is decremented, because the sample we are holding right now was
    // measured under the NARROWED pool even if this is the tick that ends the
    // probe. Testing `this.probing` after the decrement made the steering guard
    // below unreachable on the final probe sample — i.e. the last (and
    // cheapest-looking) probe reading still steered the limit. Caught by
    // mutation testing: removing the guard changed nothing, which is the
    // signature of dead code rather than of an untested guard.
    const wasProbing = this.probing
    if (this.probing) {
      this.probeSamplesLeft--
      if (this.probeSamplesLeft <= 0) {
        this.probing = false
        this.reason = 'probe complete'
      }
    } else if (
      this.opts.probeInterval > 0 &&
      this.limitFloat > this.opts.minLimit &&
      this.sampleCount % this.opts.probeInterval === 0
    ) {
      this.probing = true
      this.probeSamplesLeft = 2
      this.reason = 'probing narrower'
    }

    // Recent cost (EWMA).
    this.recent = this.recent === undefined
      ? msPerMiB
      : this.recent * (1 - this.opts.smoothing) + msPerMiB * this.opts.smoothing

    // No-load reference: the best (lowest) per-byte cost we have seen. It is
    // allowed to DRIFT UPWARD a little on every sample so that a link which is
    // now permanently slower (user moved to a worse network) re-baselines
    // instead of pinning the gradient near zero forever against a stale best.
    // Order matters: drift first, then take the new observation.
    if (this.best === undefined) {
      this.best = msPerMiB
    } else {
      const drifted = this.best * (1 + this.opts.referenceDecay)
      this.best = Math.min(drifted, msPerMiB)
    }

    // gradient in (0,1]: 1 = no self-inflicted queueing.
    const raw = this.best / this.recent
    this.gradient = Math.min(1, Math.max(0.5, raw))

    // Samples measured DURING a probe inform `best` (that is the whole point of
    // probing) but must not themselves steer the limit — the pool was
    // deliberately narrow, so the usual starvation logic would misread it.
    if (wasProbing) return

    const starved = sample.inFlightAtStart < this.limit
    const target = this.limitFloat * this.gradient + this.opts.headroom

    if (starved && target > this.limitFloat) {
      // The pool was not even full — this sample cannot justify a bigger cap.
      this.reason = 'held (supply-starved)'
      return
    }

    const smoothed =
      this.limitFloat * (1 - this.opts.limitSmoothing) +
      target * this.opts.limitSmoothing

    const clamped = Math.min(
      this.opts.maxLimit,
      Math.max(this.opts.minLimit, smoothed)
    )
    this.reason =
      clamped > this.limitFloat
? 'headroom (gradient ~ 1)'
        : clamped < this.limitFloat
? 'queueing detected'
          : 'steady'
    this.limitFloat = clamped
  }

/** How narrow a probe goes: halfway to the floor, at least one step down. */
  private probeLimit (learned: number): number {
    return Math.max(this.opts.minLimit, Math.floor(learned / 2))
  }

  /** Reset learned state (e.g. the user switched networks). */
  reset (): void {
    this.limitFloat = Math.min(
      Math.max(this.opts.initialLimit, this.opts.minLimit),
      this.opts.maxLimit
    )
    this.best = undefined
    this.recent = undefined
    this.gradient = undefined
    this.sampleCount = 0
    this.congestion = 0
    this.reason = 'reset'
    this.probing = false
    this.probeSamplesLeft = 0
  }
}
