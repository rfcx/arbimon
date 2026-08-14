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

  test('mount still registers the CLAIM when this IS the pop-out', () => {
    // Removing the auto-launch must not disturb the ?popout=1 bootstrap: the
    // pop-out still has to claim its project and pull file handles from the
    // opener, or its rows are unreadable and the partitioning breaks.
    const body = mountBody()
    expect(body).toContain('registerAsPopout(projectSlug.value)')
    expect(body).toContain('requestFileHandles(projectSlug.value)')
  })

  test('the pop-out remains available on demand (opt-in, not removed)', () => {
    // Inline-first is not "no pop-out". The explicit button must still open one.
    expect(source).toContain('const popOut = ')
    const popOutBody = source.slice(source.indexOf('const popOut = '))
    expect(popOutBody).toContain('openPopoutWindow()')
  })

  test('the pop-out is a WINDOW, not a tab (the features argument)', () => {
    // Supplying a features string is precisely what asks the browser for a
    // standalone window; omitting it yields a tab. The brief tab experiment
    // dropped this argument, so its presence is the whole revert and the one
    // thing most likely to be lost again in a future edit.
    const body = source.slice(
      source.indexOf('const openPopoutWindow'),
      source.indexOf('const popOut = ')
    )
    expect(body).toContain('popup=yes')
    expect(body).toContain('width=1280,height=860')
    // ...and still a STABLE PER-PROJECT name, which is what makes a repeat
    // press re-focus the existing window instead of spawning a second one.
    // Matched by regex: writing the template literal out verbatim trips the
    // no-template-curly-in-string lint rule, and escaping it into a plain
    // string would be easy to "fix" into something that no longer matches.
    expect(body).toMatch(/arbimon-uploader-\$\{\s*projectSlug\.value\s*\}/)
  })

  test('the pop-out window is CHROME-FREE (no sidebar/navbar)', () => {
    // Correct for a window (the full app is still behind it in the main tab)
    // and the opposite of what the tab model needed. Asserted in the layout
    // that actually decides it, not in this page.
    const layout = readFileSync(
      join(__dirname, '..', '..', '_layout', 'project-root', 'project-root.vue'), 'utf8')
    expect(layout).toContain("const isPopout = computed(() => route.query.popout === '1')")
    expect(layout).toContain('<template v-if="!isPopout">')
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
    // pop-out window is demonstrably open.
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

describe('the launch button goes INERT once the pop-out is open', () => {
  test('the button is disabled, and styled as disabled', () => {
    // Pressing it again cannot create a second uploader (window.open re-uses
    // the name), so a live button would promise an action that does not exist.
    // btn-disabled is the codebase's existing disabled treatment; the
    // disabled:hover variant is needed too, or the secondary button's hover
    // colours still fire on a dead control.
    const btn = source.slice(source.indexOf('<button'), source.indexOf('Pop-Out in New Window'))
    expect(btn).toContain(':disabled="popoutLaunched"')
    expect(btn).toContain('disabled:btn-disabled')
    expect(btn).toContain('disabled:hover:btn-disabled')
    expect(btn).toContain('disabled:cursor-not-allowed')
  })

  test('THE STRANDING RISK: inert state is DERIVED, not a one-way latch', () => {
    // The important property. Deriving from the live heartbeat means closing
    // the pop-out re-enables the button; a plain `hasLaunched = true` would be
    // indistinguishable in the happy path and then strand the user with a
    // permanently dead button — the §121 defect shape, moved into the UI.
    const decl = source.slice(source.indexOf('const popoutLaunched'))
      .slice(0, 200)
    expect(decl).toContain('computed(')
    expect(decl).toContain('popoutActive.value')
  })

  test('the optimistic flag is CLEARED by the heartbeat and by a timeout', () => {
    // popoutActive only flips once the new window posts its first beat, so the
    // button is disabled optimistically to survive that gap. Both exits must
    // exist, or a launch that never heartbeats leaves the button dead.
    expect(source).toContain('const popoutJustLaunched = ref(false)')
    const watcher = source.slice(source.indexOf('watch(popoutActive'))
      .slice(0, 160)
    expect(watcher).toContain('popoutJustLaunched.value = false')

    const popOutBody = source.slice(
      source.indexOf('const popOut = '),
      source.indexOf('const closePopout')
    )
    expect(popOutBody).toContain('popoutJustLaunched.value = true')
    expect(popOutBody).toContain('POPOUT_LAUNCH_GRACE_MS')
    // [\s\S] rather than [^)] — the callback body contains parentheses, so a
    // negated-paren class stops at `() =>` and never reaches the assignment.
    expect(popOutBody).toMatch(/setTimeout\([\s\S]*?popoutJustLaunched\.value = false/)
  })

  test('a BLOCKED launch does not disable the button', () => {
    // If the browser refused the window, the button is the user's only way to
    // retry after allowing pop-ups — disabling it there would be a dead end.
    // The blocked branch must therefore EXIT before the disable is set.
    const popOutBody = source.slice(
      source.indexOf('const popOut = '),
      source.indexOf('const closePopout')
    )

    const guardExit = popOutBody.indexOf('return')
    const disable = popOutBody.indexOf('popoutJustLaunched.value = true')

    // Assert PRESENCE first. `indexOf` yields -1 when absent, and -1 is less
    // than any real index, so an ordering-only assertion PASSES when the guard
    // is deleted — which is exactly the mutation it is supposed to catch.
    // (Caught by mutation testing: this test survived removing the return.)
    expect(guardExit).toBeGreaterThan(-1)
    expect(disable).toBeGreaterThan(-1)
    expect(guardExit).toBeLessThan(disable)
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
