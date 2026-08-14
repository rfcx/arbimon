/**
 * The uploader renders IN PLACE inside the SPA (2026-08-14, superseding the
 * short-lived "uploader-tab-first" behaviour).
 *
 * For about an hour the Import route auto-opened a second tab on mount and left
 * the page the user actually navigated to showing a placeholder. The operator
 * asked for it to work within the SPA without the automatic launch. These tests
 * pin that, plus the two defects that the auto-launch was masking.
 *
 * WHY SOURCE ASSERTIONS. Mounting this page is not viable in a unit test: it
 * imports the upload singleton (intervals + BroadcastChannel + IndexedDB), the
 * Arbimon API client and the store, and it is ~1,100 lines of SFC. The file
 * `_services/upload/popout-claim.unit.test.ts` already established this pattern
 * for exactly that reason. These assertions are deliberately narrow and target
 * STRUCTURE that cannot be satisfied accidentally — an auto-launch would have to
 * re-introduce a call in the mount path to break them.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

const source = readFileSync(join(__dirname, 'import-recordings-page.vue'), 'utf8')

/** The body of the page's non-popout `onMounted` (the launch path). */
const mountBody = (): string => {
  const start = source.indexOf('onMounted(() => {')
  expect(start).toBeGreaterThan(-1)
  return source.slice(start, source.indexOf('\n})', start))
}

describe('the uploader is inline-first — no automatic tab launch', () => {
  test('THE REGRESSION: mount must not open a tab', () => {
    // The whole point of the operator's request. `openPopoutWindow` is the only
    // path to window.open, so its absence from the mount body is the property
    // worth pinning — and it is the exact line that would come back if someone
    // reinstated "uploader-tab-first".
    expect(mountBody()).not.toContain('openPopoutWindow')
  })

  test('mount still registers the CLAIM when this IS the uploader tab', () => {
    // Removing the auto-launch must not disturb the ?popout=1 bootstrap: an
    // uploader tab still has to claim its project and pull file handles from
    // the opener, or its rows are unreadable and the partitioning breaks.
    const body = mountBody()
    expect(body).toContain('registerAsPopout(projectSlug.value)')
    expect(body).toContain('requestFileHandles(projectSlug.value)')
  })

  test('the tab remains available on demand (opt-in, not removed)', () => {
    // Inline-first is not "no tab". The explicit button must still open one.
    expect(source).toContain('const popOut = ')
    const popOutBody = source.slice(source.indexOf('const popOut = '))
    expect(popOutBody).toContain('openPopoutWindow()')
  })

  test('a blocked tab is still surfaced, and only from the user gesture', () => {
    // popoutBlocked must be SET somewhere (silently swallowing a blocked open is
    // the original dead-button defect) and the only setter is the button path.
    expect(source).toContain('popoutBlocked.value = true')
    const popOutBody = source.slice(source.indexOf('const popOut = '))
    expect(popOutBody).toContain('popoutBlocked.value = true')
  })

  test('a LATER successful open clears a stale blocked notice', () => {
    // Otherwise the page keeps insisting the user is blocked while their
    // uploader tab is demonstrably open.
    const popOutBody = source.slice(
      source.indexOf('const popOut = '),
      source.indexOf('const closePopout')
    )
    expect(popOutBody).toContain('popoutBlocked.value = false')
  })

  test('the dead `autoLaunchTried` flag is gone entirely', () => {
    // It was a component-scope ref, so it reset on every remount and never
    // limited anything across SPA navigation. Leaving it behind would imply a
    // guard that does not exist.
    const withoutComments = source.replace(/\/\/[^\n]*/g, '').replace(/<!--[\s\S]*?-->/g, '')
    expect(withoutComments).not.toContain('autoLaunchTried')
  })
})

describe('THE MASKED DEFECT: the blocked notice suppressed the uploader', () => {
  test('the blocked notice is a SIBLING v-if, not a branch of the uploader chain', () => {
    // It used to be `v-else-if` in the same chain as the uploader `<template>`.
    // A matched branch excludes every later one, so a blocked open rendered the
    // notice ALONE — the banner claimed "it's running here instead" on a page
    // where nothing was running. As its own `v-if` the notice is advisory and
    // the uploader below it still renders.
    expect(source).toContain('v-if="popoutBlocked && !isPopout && !popoutActive && !isProjectViewOnly"')
    expect(source).not.toContain('v-else-if="popoutBlocked')
  })

  test('view-only is still mutually exclusive with the uploader', () => {
    // Breaking the single chain into independent ones removes the implicit
    // exclusivity that `v-else-if` provided, so every sibling now has to carry
    // the view-only condition explicitly — otherwise a locked project would
    // render a fully working uploader beneath its "cannot accept uploads" note.
    expect(source).toContain('<template v-else-if="!isProjectViewOnly">')
    expect(source).toContain('v-if="popoutActive && !isPopout && !isProjectViewOnly"')
  })
})
