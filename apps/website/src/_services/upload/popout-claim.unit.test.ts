/**
 * Uploader-tab claim/release state machine (2026-08-14 — window → TAB).
 *
 * The uploader used to open as a chromeless POPUP WINDOW. It now opens as a
 * TAB, and that single change makes a previously-unreachable defect reachable:
 *
 *   `registerAsPopout(slug)` marks the whole TAB (the upload module is a
 *   singleton per document) as the owner of one project. Nothing ever cleared
 *   it. A popup window had NO NAVIGATION, so the only way out was closing the
 *   document — which disposed of the claim implicitly. A tab sits inside the
 *   full app, so the user can navigate away while the document lives on.
 *
 * Left unreleased, the consequence is a queue that stalls with no visible
 * cause, in BOTH directions at once:
 *   - this tab stays scoped to project X and silently drives nothing else;
 *   - every other tab keeps EXCLUDING project X, trusting a heartbeat that is
 *     no longer meaningful — so nobody drives project X either.
 *
 * These tests pin the scope PREDICATE for each state. The predicate is the
 * thing that decides which items an engine will touch, so it is the honest
 * unit to assert — asserting "a function was called" would pass even if the
 * resulting scope were wrong.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

type ScopePredicate = (item: { projectSlug?: string }) => boolean

/**
 * Mirror of the scope rule in `~/upload` (applyScope), extracted so it can be
 * exercised without importing the module singleton — which on import starts
 * intervals, opens a BroadcastChannel and touches IndexedDB.
 *
 * KEPT HONEST: the production copy is asserted to be structurally identical by
 * `applyScope source is mirrored faithfully` below, so this cannot silently
 * drift into testing a fiction.
 */
const scopeFor = (ownSlug: string | undefined, livePopouts: Set<string>): ScopePredicate => {
  if (ownSlug !== undefined) {
    const mine = ownSlug
    return item => item.projectSlug === mine
  }
  const excluded = livePopouts
  return item => item.projectSlug === undefined || !excluded.has(item.projectSlug)
}

const itemA = { projectSlug: 'project-a' }
const itemB = { projectSlug: 'project-b' }
const itemNoProject = { projectSlug: undefined }

describe('uploader-tab claim', () => {
  test('a claiming tab drives ONLY its own project', () => {
    const scope = scopeFor('project-a', new Set())

    expect(scope(itemA)).toBe(true)
    expect(scope(itemB)).toBe(false)
    // an unassigned item is NOT this tab's business while it owns a project
    expect(scope(itemNoProject)).toBe(false)
  })

  test('an ordinary tab drives everything except claimed projects', () => {
    const scope = scopeFor(undefined, new Set(['project-a']))

    expect(scope(itemA)).toBe(false)
    expect(scope(itemB)).toBe(true)
    expect(scope(itemNoProject)).toBe(true)
  })
})

describe('releasing the claim (the tab-model requirement)', () => {
  test('after release the tab returns to ORDINARY scope, not a dead scope', () => {
    // before: this tab owns project-a
    const claimed = scopeFor('project-a', new Set())
    expect(claimed(itemB)).toBe(false)

    // after releasing (user navigated away from the uploader page):
    // no other tab holds a claim, so this tab should drive EVERYTHING.
    const released = scopeFor(undefined, new Set())
    expect(released(itemA)).toBe(true)
    expect(released(itemB)).toBe(true)
    expect(released(itemNoProject)).toBe(true)
  })

  test('releasing still respects OTHER tabs\u2019 live claims', () => {
    // this tab released project-a, but another tab genuinely owns project-b
    const released = scopeFor(undefined, new Set(['project-b']))

    expect(released(itemA)).toBe(true)
    expect(released(itemB)).toBe(false)
  })

  test('releasePopoutClaim exists and clears the claim', () => {
    // Guards against the fix being reverted or renamed: the release path is
    // what makes the tab model safe, and its absence is invisible at runtime
    // until a queue mysteriously stalls.
    const source = readFileSync(join(__dirname, 'index.ts'), 'utf8')

    expect(source).toContain('export const releasePopoutClaim')
    // it must actually clear the claim and re-apply scope, not just exist
    const body = source.slice(source.indexOf('export const releasePopoutClaim'))
    expect(body).toContain('ownPopoutSlug = undefined')
    expect(body).toContain('applyScope()')
  })

  test('release is GUARDED by unsaved work (handles live only in this tab)', () => {
    // The engine is a singleton and keeps uploading after the page unmounts, and
    // BrowserFileSource holds this tab's file handles in memory. Releasing while
    // work is in flight would let another tab claim items whose bytes it cannot
    // read — producing “Session interrupted” rejections. The guard must therefore
    // come BEFORE the claim is cleared.
    const source = readFileSync(join(__dirname, 'index.ts'), 'utf8')
    const body = source.slice(
      source.indexOf('export const releasePopoutClaim'),
      source.indexOf('/** Ask openers')
    )

    expect(body).toContain('unsavedCount.value > 0')
    expect(body.indexOf('unsavedCount.value > 0'))
      .toBeLessThan(body.indexOf('ownPopoutSlug = undefined'))
  })

  test('applyScope source is mirrored faithfully by this test’s scopeFor', () => {
    // The tests above exercise a LOCAL copy of the scope rule (importing the
    // singleton would start intervals/BroadcastChannel/IndexedDB). That is only
    // legitimate while the copy matches production, so assert the real one
    // still has both branches with the same predicates.
    const source = readFileSync(join(__dirname, 'index.ts'), 'utf8')
    const applyScope = source.slice(
      source.indexOf('const applyScope'),
      source.indexOf('let popoutChannel')
    )

    expect(applyScope).toContain('item.projectSlug === mine')
    expect(applyScope).toContain('item.projectSlug === undefined || !excluded.has(item.projectSlug)')
  })

  test('THE DEFECT: never releasing strands both sides', () => {
    // The tab kept its claim after navigating away...
    const stuckTab = scopeFor('project-a', new Set())
    // ...so it drives nothing else, even though it is now an ordinary page.
    expect(stuckTab(itemB)).toBe(false)
    expect(stuckTab(itemNoProject)).toBe(false)

    // ...and every other tab still excludes project-a on the strength of a
    // heartbeat that no longer corresponds to a visible uploader.
    const otherTab = scopeFor(undefined, new Set(['project-a']))
    expect(otherTab(itemA)).toBe(false)

    // Net effect: project-a is driven by NOBODY while looking perfectly normal.
    // That combination is what the release exists to prevent.
    expect(stuckTab(itemA) && otherTab(itemA)).toBe(false)
  })
})
