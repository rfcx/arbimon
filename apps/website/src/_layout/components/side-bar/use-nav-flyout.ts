/**
 * Flyout state for the fixed-width icon rail.
 *
 * The sidebar no longer widens on hover (operator 2026-08-18), so every label,
 * submenu and popover now lives in a panel that overflows to the RIGHT of the
 * rail. One state machine serves all of them so their behaviour cannot drift.
 *
 * BEHAVIOUR (operator-specified):
 *  - opens on HOVER *and* on CLICK/TAP -- hover alone is unusable on touch,
 *    where there is no hover state at all
 *  - a HOVER-opened flyout closes when the pointer leaves (it was never a
 *    commitment; leaving is the natural dismissal)
 *  - a CLICK-opened flyout is STICKY: it survives pointer-out and closes only
 *    on an off-flyout click/tap, or when another flyout opens
 *  - opening any flyout closes the previous one, so two can never be on screen
 *
 * The sticky distinction is the important part: without it, a touch user's tap
 * would open a panel that instantly closed, and a mouse user reaching across a
 * gap toward a submenu link would lose it mid-travel.
 */
import { readonly, ref } from 'vue'

/** Which flyout is open, by id ('explore', 'profile', 'tasks'…). */
const openId = ref<string | undefined>(undefined)
/** True when the open flyout was opened by click/tap and must not auto-close. */
const sticky = ref(false)
/** Grace timer so travelling from trigger to panel does not close a hover flyout. */
let closeTimer: ReturnType<typeof setTimeout> | undefined

const cancelPendingClose = (): void => {
  if (closeTimer !== undefined) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}

export const activeFlyout = readonly(openId)
export const flyoutIsSticky = readonly(sticky)

export const isFlyoutOpen = (id: string): boolean => openId.value === id

/**
 * Hover-open.
 *
 * If this flyout is ALREADY the open one, only cancel any pending close -- do
 * not reset `sticky`. Re-entering a click-opened panel must not silently
 * downgrade it to hover-dismissable, or the pointer leaving would close a panel
 * the user had deliberately pinned.
 *
 * Opening a DIFFERENT flyout supersedes the current one, sticky or not.
 */
export const openFlyoutOnHover = (id: string): void => {
  cancelPendingClose()
  if (openId.value === id) return
  openId.value = id
  sticky.value = false
}

/**
 * Click/tap. Toggles: a second click on the same trigger closes it, which is
 * what makes the control feel like a button rather than a trap.
 *
 * NOTE the hover-then-click sequence a mouse user always produces: hovering
 * opens the panel non-sticky, then the click PINS it (sticky) rather than
 * closing it. Only a click on an ALREADY-STICKY flyout closes. Without that
 * distinction, clicking what you just hovered would dismiss it -- which reads
 * as the button being broken.
 */
export const toggleFlyoutOnClick = (id: string): void => {
  cancelPendingClose()
  if (openId.value === id && sticky.value) {
    openId.value = undefined
    sticky.value = false
    return
  }
  openId.value = id
  sticky.value = true
}

/**
 * Pointer left the trigger or the panel. Only closes a NON-sticky (hover-opened)
 * flyout, and only after a short grace period so the pointer can cross the gap
 * between the rail and the panel without the panel vanishing underneath it.
 */
export const scheduleFlyoutClose = (id: string): void => {
  if (openId.value !== id || sticky.value) return
  cancelPendingClose()
  closeTimer = setTimeout(() => {
    if (openId.value === id && !sticky.value) openId.value = undefined
    closeTimer = undefined
  }, 220)
}

/** Pointer re-entered the trigger or panel before the grace period elapsed. */
export const keepFlyoutOpen = (id: string): void => {
  if (openId.value === id) cancelPendingClose()
}

/** Outside click, route change, Escape. */
export const closeFlyout = (): void => {
  cancelPendingClose()
  openId.value = undefined
  sticky.value = false
}
