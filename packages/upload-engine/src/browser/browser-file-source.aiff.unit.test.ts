/**
 * AIFF acceptance (client side), added 2026-08-17 alongside ingest #122.
 *
 * ORDERING GUARD: demo's uploader posts to the LIVE production ingest, so the
 * client must never offer an extension prod would reject. AIFF was verified
 * IN-POD on prod (`rfcx-local-prod-7e742f8`, api + tasks tiers) before this
 * list was widened.
 */
import { describe, expect, it } from 'vitest'

import { isSupportedAudioFile } from './browser-file-source'

describe('isSupportedAudioFile — AIFF', () => {
  it('accepts both AIFF spellings, case-insensitively', () => {
    // Both spellings exist in the wild: recorders emit .aiff, Mac tooling .aif.
    expect(isSupportedAudioFile('rec.aiff')).toBe(true)
    expect(isSupportedAudioFile('rec.aif')).toBe(true)
    expect(isSupportedAudioFile('REC.AIFF')).toBe(true)
    expect(isSupportedAudioFile('REC.AIF')).toBe(true)
  })

  it('still accepts the pre-existing formats', () => {
    expect(isSupportedAudioFile('a.wav')).toBe(true)
    expect(isSupportedAudioFile('a.flac')).toBe(true)
    expect(isSupportedAudioFile('a.opus')).toBe(true)
  })

  it('still REJECTS formats prod does not accept (the lossy trio is operator-gated)', () => {
    // mp3/m4a/ogg remain a pending operator decision on transcode policy --
    // offering them here would post files the prod ingest rejects.
    expect(isSupportedAudioFile('a.mp3')).toBe(false)
    expect(isSupportedAudioFile('a.m4a')).toBe(false)
    expect(isSupportedAudioFile('a.ogg')).toBe(false)
    expect(isSupportedAudioFile('a.txt')).toBe(false)
  })
})
