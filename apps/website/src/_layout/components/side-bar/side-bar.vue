<template>
  <aside
    id="sidebar"
    class="fixed z-50 top-0 left-0 w-13 border-r-1 border-util-gray-03 h-screen transition-transform -translate-x-full bg-white sm:translate-x-0 dark:bg-echo"
    aria-label="Sidebar"
    data-drawer-backdrop="false"
  >
    <!-- LAYOUT CONTRACT (operator 2026-08-18: "built in a way that interacts
         fluidly and intentionally with the flyouts and hovering elements (and
         resizing)").

         The rail had been patched three times and was still wrong. MEASURED
         causes, not guesses:
           - the inner wrapper carried `overflow-y-auto`, which makes it a SCROLL
             CONTAINER. A scroll container clips its descendants, so every flyout
             had to fight to escape it -- and Tailwind's `overflow-y-auto` also
             sets `overflow-x: auto`, so horizontal escape was clipped too.
           - that container reserved scrollbar gutter: railOffsetWidth 52 vs
             railClientWidth 51, i.e. the rail silently lost a pixel and the
             icon column sat off-centre.

         NEW STRUCTURE, and why each piece is what it is:
           - the <aside> is the ONLY sizing authority: fixed 52px, full height,
             `overflow-visible` so a flyout can leave the rail at any height.
           - the inner column is a flex column with `h-full` and THREE zones
             (head / scrolling middle / foot). Only the MIDDLE scrolls, and only
             when it must -- so the logo and the profile are always pinned and
             visible, which is what "the bottom is cropped" was really about.
           - the middle uses `min-h-0`: a flex child defaults to `min-height:auto`
             and refuses to shrink below its content, which is the classic reason
             an overflow-auto child scrolls the WRONG box. This is the fix that
             makes resizing behave.
           - `overscroll-contain` stops a scroll gesture in the rail from chaining
             to the page behind it.

         Flyouts are `position: fixed` (see the item markup) so they are
         positioned against the VIEWPORT, not against any scrolling ancestor.
         That is what makes them immune to the middle zone's scroll offset. -->
    <div class="h-full flex flex-col">
      <!-- HEAD: pinned. Never scrolls, so the logo is always the top anchor. -->
      <div class="shrink-0">
        <!-- Square logo only — the wordmark needed the widened rail (operator
               2026-08-18: "just the square logo without the wordmark is fine"). -->
        <div class="my-3 h-8 flex flex-row items-center justify-center">
          <router-link
            :to="{ name: ROUTE_NAMES.landingHome }"
            class="flex items-center"
            title="Arbimon"
          >
            <img
              src="/src/_services/assets/arbimon-logo.svg"
              class="h-7 w-7 max-h-7 object-contain"
              alt="Arbimon"
            >
          </router-link>
        </div>
      </div>

      <!-- MIDDLE: the only scrolling zone, and only when it must.
             `min-h-0` is load-bearing -- without it a flex child keeps
             `min-height:auto`, refuses to shrink below its content, and pushes
             the foot off-screen instead of scrolling itself. `overflow-x-visible`
             keeps horizontal escape open even though this box scrolls
             vertically. -->
      <div class="rail-scroll flex-1 min-h-0 overscroll-contain">
        <div class="my-3 border-t-1 border-util-gray-03" />
        <!-- MY PROJECTS — its own section between the logo and the
               single-project nav (operator 2026-08-18), mirroring the landing
               page's top nav. It is a PRIMARY destination ("leave this project,
               go pick another"), not an account action, so it stays in the main
               nav rather than moving into the profile menu — and sitting above
               the project-scoped items reflects that it operates one level up
               from them. -->
        <ul class="px-2 flex flex-col gap-y-2">
          <li
            class="rail-item relative"
            :class="{ 'is-open': isFlyoutOpen('my-projects') }"
            @mouseleave="scheduleFlyoutClose('my-projects')"
          >
            <router-link
              :to="{ name: ROUTE_NAMES.myProjects }"
              title="My Projects"
              exact-active-class="bg-insight rounded text-moss"
              class="flex items-center justify-center text-base font-normal py-1 h-9 active:text-moss hover:(bg-util-gray-03 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              @mouseenter="onFlyoutTrigger($event, 'my-projects', 'hover')"
              @click="closeFlyout"
            >
              <span class="rail-icon p-0.5">
                <icon-custom-fi-clipboard />
              </span>
            </router-link>
            <transition name="flyout">
              <div
                v-if="isFlyoutOpen('my-projects')"
                class="fixed left-13 ml-1 z-60 min-w-56 rounded-lg border border-util-gray-03 bg-echo shadow-xl py-1"
                :style="{ top: flyoutTop + 'px' }"
                role="menu"
                @mouseenter="keepFlyoutOpen('my-projects')"
                @mouseleave="scheduleFlyoutClose('my-projects')"
              >
                <router-link
                  :to="{ name: ROUTE_NAMES.myProjects }"
                  exact-active-class="bg-insight text-moss"
                  class="flyout-row block px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                  role="menuitem"
                  @click="closeFlyout"
                >
                  My Projects
                </router-link>
              </div>
            </transition>
          </li>
        </ul>
        <div class="my-3 border-t-1 border-util-gray-03" />
        <!-- MAIN NAV. Icons only: the rail is a fixed 52px (operator
               2026-08-18 discontinued the hover-widening), so labels live in
               `title` tooltips and submenus fly out to the RIGHT of the rail
               rather than expanding inline.

               Flyout behaviour is shared with the profile menu and Tasks
               drawer via ~/side-bar/use-nav-flyout: opens on hover AND on
               click/tap; a hover-opened panel closes on pointer-out (after a
               grace period so the pointer can cross the gap), a click-opened
               one is STICKY and closes only on an outside click or when
               another flyout opens. -->
        <ul class="sidebar-items px-2 flex flex-col gap-y-2 border-gray-200 dark:border-gray-700">
          <li
            v-for="item in items"
            :key="item.title"
            class="rail-item relative"
            :class="{ 'is-open': isFlyoutOpen(itemId(item.title)) }"
            @mouseleave="scheduleFlyoutClose(itemId(item.title))"
          >
            <!-- LEAF item. It still opens a flyout — a single-entry one naming
                 the destination (operator 2026-08-18: "even the single-item
                 navbar items need to have flyouts with those single items").

                 CONSISTENCY IS THE POINT: with labels gone, every icon should
                 answer "what is this?" the same way. A `title` tooltip is NOT
                 the same affordance — it is OS-rendered, appears after a delay
                 the app cannot control, is styled differently, and never appears
                 at all on touch. Routing every item through the same flyout
                 makes the rail behave uniformly on every input type. -->
            <router-link
              v-show="item?.visibleCondition == null || item.visibleCondition() === true"
              v-if="item.route"
              :to="item.route"
              :title="item.title"
              exact-active-class="bg-insight rounded text-moss"
              class="flex items-center justify-center text-base py-1 h-9 hover:(bg-util-gray-03 rounded transition duration-300)"
              @mouseenter="onFlyoutTrigger($event, itemId(item.title), 'hover')"
              @click="closeFlyout"
            >
              <span
                v-if="item.iconRaw === 'cloud-upload'"
                class="rail-icon p-0.5 w-[26px]"
              >
                <icon-custom-cloud-upload />
              </span>
              <span
                v-if="item.iconRaw === 'fi-grid'"
                class="rail-icon p-0.5"
              >
                <icon-custom-fi-grid />
              </span>
              <span
                v-if="item.iconRaw === 'pres-chart-bar' === true"
                class="rail-icon p-0.5"
              >
                <icon-custom-pres-chart-bar />
              </span>
            </router-link>

            <!-- PARENT item: opens a flyout of its children. -->
            <button
              v-else
              type="button"
              :title="item.title"
              :aria-expanded="isFlyoutOpen(itemId(item.title))"
              aria-haspopup="menu"
              class="relative flex items-center justify-center w-full text-base font-normal py-1 h-9 active:text-moss hover:(bg-util-gray-03 rounded transition duration-300)"
              :class="isFlyoutOpen(itemId(item.title)) ? 'bg-util-gray-03 rounded' : ''"
              @click="onFlyoutTrigger($event, itemId(item.title), 'click')"
              @mouseenter="onFlyoutTrigger($event, itemId(item.title), 'hover')"
            >
              <span
                v-if="item.iconRaw === 'cloud-upload'"
                class="rail-icon p-0.5 w-[26px]"
              >
                <icon-custom-cloud-upload />
              </span>
              <span
                v-if="item.iconRaw === 'fa-search'"
                class="rail-icon p-0.5 w-[26px]"
              >
                <icon-fa-search class="h-5 w-5" />
              </span>
              <span
                v-if="item.iconRaw === 'fi-aed'"
                class="rail-icon p-0.5 w-[26px]"
              >
                <icon-custom-fi-aed />
              </span>
              <span
                v-if="item.iconRaw === 'fi-activity'"
                class="rail-icon p-0.5 w-[26px]"
              >
                <icon-custom-fi-activity class="h-6 w-6" />
              </span>
              <span
                v-if="item.iconRaw === 'fi-settings'"
                class="rail-icon p-0.5 w-[26px]"
              >
                <icon-custom-fi-settings />
              </span>
              <!-- DISCOVERABILITY: with labels gone, a parent item was
                     visually identical to a leaf link, so nothing indicated
                     that Explore/Audio analyses/Project settings even HAVE
                     children. This caret marks them. Deliberately tiny and
                     low-contrast — it is a hint, not a control, and the whole
                     button is the hit target. -->
              <span
                class="absolute right-0.5 text-cloud/40"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 16 16"
                  class="w-2.5 h-2.5 fill-none stroke-current"
                  stroke-width="2"
                ><path
                  d="M6 3l5 5-5 5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /></svg>
              </span>
            </button>

            <!-- LEAF flyout: one entry, the destination itself. Same shell,
                 same position, same open/close rules as a parent's flyout, so
                 the rail reads as one consistent system. -->
            <transition name="flyout">
              <div
                v-if="!item.children && isFlyoutOpen(itemId(item.title))"
                class="fixed left-13 ml-1 z-60 min-w-56 rounded-lg border border-util-gray-03 bg-echo shadow-xl py-1"
                :style="{ top: flyoutTop + 'px' }"
                role="menu"
                @mouseenter="keepFlyoutOpen(itemId(item.title))"
                @mouseleave="scheduleFlyoutClose(itemId(item.title))"
              >
                <router-link
                  v-if="item.route"
                  :to="item.route"
                  exact-active-class="bg-insight text-moss"
                  class="flyout-row block px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                  role="menuitem"
                  @click="closeFlyout"
                >
                  {{ item.title }}
                </router-link>
              </div>
            </transition>

            <!-- FIXED, not absolute (operator 2026-08-18).

                   The middle zone scrolls, and an absolutely-positioned child of
                   a scrolling box moves WITH the scroll and is clipped by it.
                   Positioning against the viewport instead makes the flyout
                   immune to both: it cannot be clipped by an ancestor, and it
                   stays put while the rail scrolls beneath it.

                   `left-13` = the rail's exact width, so the panel begins where
                   the rail ends regardless of the <li>'s own padding -- the
                   earlier `left-full` was relative to the <li> and produced a
                   measured 5px overlap. The row alignment that `top-0` used to
                   give is supplied by flyoutTop(), read from the trigger. -->
            <transition name="flyout">
              <div
                v-if="item.children && isFlyoutOpen(itemId(item.title))"
                class="fixed left-13 ml-1 z-60 min-w-56 rounded-lg border border-util-gray-03 bg-echo shadow-xl py-1"
                :style="{ top: flyoutTop + 'px' }"
                role="menu"
                @mouseenter="keepFlyoutOpen(itemId(item.title))"
                @mouseleave="scheduleFlyoutClose(itemId(item.title))"
              >
                <p class="px-3 py-1.5 text-xs uppercase tracking-wide text-util-gray-02">
                  {{ item.title }}
                </p>
                <template
                  v-for="childItem in item.children"
                  :key="childItem.title"
                >
                  <router-link
                    v-show="childItem.visibleCondition == null || childItem.visibleCondition() === true"
                    v-if="childItem.route"
                    :to="childItem.route"
                    exact-active-class="bg-insight text-moss"
                    class="flyout-row block px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                    role="menuitem"
                    @click="closeFlyout"
                  >
                    {{ childItem.title }}
                  </router-link>
                  <a
                    v-else-if="childItem.legacyPath"
                    :href="arbimonLink + childItem.legacyPath"
                    class="flyout-row block px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                    role="menuitem"
                    @click="closeFlyout"
                  >
                    {{ childItem.title }}
                  </a>
                </template>
              </div>
            </transition>
          </li>
        </ul>

        <!-- The "Project name" caption block is dropped: it only ever rendered
               in the widened rail, and 52px cannot carry a wrapped project name.
               The name is still reachable — it heads the project's own pages and
               the Overview link's tooltip — so nothing is lost that the rail can
               actually show. -->
      </div>

      <!-- FOOT: pinned. Help / Tasks / profile are always reachable, which is
             what the "bottom is cropped" report was really about -- they used to
             sit at the end of one long scrolling column. -->
      <div class="shrink-0">
        <div class="my-3 border-t-1 border-util-gray-03" />
        <ul class="px-2 flex flex-col gap-y-2">
          <li
            class="rail-item relative"
            :class="{ 'is-open': isFlyoutOpen('help') }"
            @mouseleave="scheduleFlyoutClose('help')"
          >
            <a
              :title="'Arbimon Support'"
              :href="supportLink"
              exact-active-class="bg-insight rounded text-moss"
              class="flex items-center justify-center text-base font-normal py-1 h-9 active:text-moss hover:(bg-util-gray-03 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              @mouseenter="onFlyoutTrigger($event, 'help', 'hover')"
              @click="closeFlyout"
            >
              <icon-custom-fi-help class="rail-icon" />
            </a>
            <transition name="flyout">
              <div
                v-if="isFlyoutOpen('help')"
                class="fixed left-13 ml-1 z-60 min-w-56 rounded-lg border border-util-gray-03 bg-echo shadow-xl py-1"
                :style="{ top: flyoutTop + 'px' }"
                role="menu"
                @mouseenter="keepFlyoutOpen('help')"
                @mouseleave="scheduleFlyoutClose('help')"
              >
                <a
                  :href="supportLink"
                  class="flyout-row block px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                  role="menuitem"
                  @click="closeFlyout"
                >
                  Arbimon Support
                </a>
              </div>
            </transition>
          </li>
        </ul>
        <!-- TASKS — only the TRIGGER lives here. The drawer itself is rendered by
               app-root, because this sidebar mounts ONLY under /p/:projectSlug
               (measured on the running demo 2026-08-18: absent on /my-projects
               and /account-settings). A drawer owned by the nav would vanish on
               exactly the pages a user crosses between projects. -->
        <div class="my-3 border-t-1 border-util-gray-03" />
        <ul class="px-2 flex flex-col gap-y-2">
          <li
            class="rail-item relative"
            :class="{ 'is-open': taskDrawerOpen }"
          >
            <button
              data-task-drawer-trigger
              class="w-full flex items-center justify-center text-base font-normal py-1 h-9 active:text-moss hover:(bg-util-gray-03 rounded transition duration-300)"
              :class="taskDrawerOpen ? 'bg-util-gray-03 rounded' : ''"
              :title="taskActiveCount > 0 ? `Tasks (${taskActiveCount} active)` : 'Tasks'"
              :aria-expanded="taskDrawerOpen"
              @click="toggleTaskDrawer"
            >
              <span class="rail-icon p-0.5 relative">
                <icon-custom-fi-activity class="h-6 w-6" />
                <!-- Activity dot + count are now the ONLY in-rail signal that
                       work is running, since the label no longer fits. The count
                       moved into the tooltip. -->
                <span
                  v-if="taskActiveCount > 0"
                  class="task-dot absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-frequency"
                />
              </span>
            </button>
          </li>
        </ul>
        <div class="my-3 border-t-1 border-util-gray-03" />
        <!-- USER — identity + account actions in a popover (operator 2026-08-18).
               Account Settings and Log out moved in here; My Projects did NOT
               (it is primary navigation and now sits at the top).

               OPEN on hover OR click. CLOSE only via the trigger or an outside
               click.

               2026-08-18 (operator): this menu now uses the SAME state machine
               as every other flyout (use-nav-flyout) rather than its own
               boolean. It previously had no mouseleave path at all, so a
               hover-opened profile menu stayed up until the avatar was clicked
               -- inconsistent with the nav flyouts beside it.

               The sticky rule still honours the original concern: a menu opened
               by CLICK survives pointer-out and closes only on an outside click.
               Only a HOVER-opened one dismisses on leave, after a grace period
               so the pointer can cross the gap to the panel. -->
        <ul class="px-2.5 flex flex-col gap-y-2">
          <li
            class="rail-item my-1 relative"
            :class="{ 'is-open': isFlyoutOpen('profile') }"
            @mouseleave="scheduleFlyoutClose('profile')"
          >
            <button
              class="w-full flex items-center justify-center h-10 rounded hover:bg-util-gray-03 transition duration-300"
              :class="userMenuOpen ? 'bg-util-gray-03' : ''"
              :aria-expanded="userMenuOpen"
              aria-haspopup="menu"
              :title="userName"
              @click="onUserMenu($event, 'click')"
              @mouseenter="onUserMenu($event, 'hover')"
            >
              <!-- Avatar is now the WHOLE trigger. The name/email that used to
                     sit beside it lives in the popover header instead — which
                     also removes the flex competition that was squashing this
                     image to 23x32 (measured) before the width guards were added.
                     They are kept anyway: a non-square uploaded photo would still
                     stretch without object-cover. -->
              <img
                class="rail-icon h-8 w-8 min-w-8 aspect-square object-cover rounded-full shrink-0"
                :src="userImage"
              >
            </button>

            <!-- Same pattern as the nav flyouts (operator 2026-08-18: it was
                   coming out OVER the rail instead of cleanly to the right).
                   It was `absolute bottom-full left-0`, i.e. stacked ABOVE the
                   trigger and therefore on top of the rail. Now `fixed left-13`
                   with a measured, clamped top, exactly like every other
                   flyout. -->
            <transition name="flyout">
              <div
                v-if="userMenuOpen"
                class="fixed left-13 ml-1 min-w-52 rounded-lg border border-util-gray-03 bg-echo shadow-xl py-1 z-60"
                :style="{ top: userMenuTop + 'px' }"
                role="menu"
                @mouseenter="keepFlyoutOpen('profile')"
                @mouseleave="scheduleFlyoutClose('profile')"
              >
                <div class="px-3 py-2 border-b border-util-gray-03">
                  <p class="text-sm text-insight truncate">
                    {{ userName }}
                  </p>
                  <p class="text-xs text-util-gray-02 truncate">
                    {{ userEmail }}
                  </p>
                </div>
                <router-link
                  :to="{ name: ROUTE_NAMES.accountSettings }"
                  class="flyout-row flex items-center gap-x-2 px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                  role="menuitem"
                  @click="closeFlyout"
                >
                  <icon-custom-fi-user />
                  Account Settings
                </router-link>
                <button
                  class="flyout-row w-full flex items-center gap-x-2 px-3 py-2 text-sm text-insight hover:bg-util-gray-03"
                  role="menuitem"
                  @click="closeFlyout(); logout()"
                >
                  <icon-custom-fi-log-out />
                  Log out
                </button>
              </div>
            </transition>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { initDrawers, initDropdowns } from 'flowbite'
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { authClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { taskActiveCount, taskDrawerOpen, toggleTaskDrawer } from '~/tasks/task-drawer'
import { activeFlyout, closeFlyout, isFlyoutOpen, keepFlyoutOpen, openFlyoutOnHover, scheduleFlyoutClose, toggleFlyoutOnClick } from './use-nav-flyout'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL
const supportLink = ref('https://help.arbimon.org/')

const auth = inject(authClientKey) as Auth0Client
const store = useStore()

// TODO: pass the link / nav menus in as props
const arbimonLink = computed(() => {
  const selectedProjectSlug = store.project?.slug
  if (selectedProjectSlug === undefined) return ''
  else return `${import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL}/project/${selectedProjectSlug}`
})

// -- flyout positioning -------------------------------------------------------
/**
 * Viewport Y for the open flyout.
 *
 * The panel is `position: fixed` so it cannot be clipped by the scrolling middle
 * zone, which means it no longer inherits its trigger's position -- we measure
 * it instead, from the event target, at open time.
 *
 * CLAMPED to the viewport: a trigger near the bottom (Project settings on a
 * short window) would otherwise open a panel that runs off the screen. Reading
 * the panel's own height is not possible before it renders, so an estimate from
 * the child count is used and then corrected on the next frame.
 */
const flyoutTop = ref(0)
const userMenuTop = ref(0)

/**
 * Align a fixed flyout with its trigger, then clamp it into the viewport.
 *
 * Shared by the nav flyouts AND the profile menu so their geometry cannot
 * drift -- the profile popover previously used `absolute bottom-full`, which
 * stacked it ON TOP of the rail instead of beside it.
 */
const positionPanel = (triggerEl: HTMLElement, target: typeof flyoutTop): void => {
  target.value = Math.round(triggerEl.getBoundingClientRect().top)
  // The panel does not exist until the next tick; correct upward then if it
  // would run off the bottom. The profile trigger sits at the very bottom of
  // the rail, so for it this is the NORMAL case, not an edge case.
  //
  // MEASURED BUG: this used to query `[role="menu"]` and take the FIRST match.
  // With leaf items now having flyouts too there can be several in the DOM, so
  // it measured the wrong panel (or a stale one) and the clamp silently did
  // nothing -- the profile menu overflowed the viewport by 97px. Selecting the
  // panel by its own `top` ties the measurement to the panel we just placed.
  void nextTick(() => {
    // Array.from, not spread: this tsconfig targets a lib without
    // NodeListOf's iterator, so `[...nodeList]` fails vue-tsc (caught by the
    // Docker build, which runs the real CI gate).
    const panels = Array.from(document.querySelectorAll('#sidebar [role="menu"]'))
    const panel = panels.find(p => (p as HTMLElement).style.top === `${target.value}px`) ?? panels[0]
    if (panel === undefined) return
    const maxTop = window.innerHeight - panel.getBoundingClientRect().height - 8
    if (target.value > maxTop) target.value = Math.max(8, Math.round(maxTop))
  })
}

const positionFlyout = (triggerEl: HTMLElement): void => { positionPanel(triggerEl, flyoutTop) }

/**
 * Profile menu. Routed through the SHARED flyout machine (id 'profile') so it
 * behaves exactly like the nav flyouts: hover-open dismisses on pointer-out,
 * click-open stays until an outside click, and opening any other flyout
 * supersedes it.
 *
 * Previously this owned its own local boolean with no mouseleave path, so a
 * hover-opened menu stayed up until the avatar was clicked -- the inconsistency
 * the operator reported.
 */
const onUserMenu = (event: Event, via: 'hover' | 'click'): void => {
  const el = (event.currentTarget ?? event.target) as HTMLElement | null
  if (el === null) return
  if (via === 'hover') {
    if (isFlyoutOpen('profile')) { keepFlyoutOpen('profile'); return }
    // ORDER MATTERS: open FIRST, then position. positionPanel's clamp runs on
    // nextTick against the RENDERED panel; positioning before opening leaves it
    // nothing to measure and the clamp silently no-ops (that bug had the menu
    // overflowing the viewport by 97px).
    openFlyoutOnHover('profile')
    positionPanel(el, userMenuTop)
    return
  }
  toggleFlyoutOnClick('profile')
  if (isFlyoutOpen('profile')) positionPanel(el, userMenuTop)
}

/**
 * One handler for both open paths so the measurement cannot drift between them.
 * `hover` is a no-op when that flyout is already open, which keeps a
 * click-pinned panel from being silently downgraded (see use-nav-flyout).
 */
const onFlyoutTrigger = (event: Event, id: string, via: 'hover' | 'click'): void => {
  const el = (event.currentTarget ?? event.target) as HTMLElement | null
  if (el === null) return
  if (via === 'hover') {
    if (isFlyoutOpen(id)) { keepFlyoutOpen(id); return }
    // Open FIRST so the panel exists when positionFlyout's nextTick clamp
    // measures it (see positionPanel). Positioning before opening leaves the
    // clamp with nothing to measure and it silently no-ops.
    openFlyoutOnHover(id)
    positionFlyout(el)
    return
  }
  toggleFlyoutOnClick(id)
  if (isFlyoutOpen(id)) positionFlyout(el)
}

// Re-anchor or dismiss on viewport change: a fixed panel measured before a
// resize/scroll would otherwise float away from its trigger.
const onViewportChange = (): void => { if (activeFlyout.value !== undefined) closeFlyout() }
onMounted(() => {
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})
onUnmounted(() => {
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})

// -- profile popover ----------------------------------------------------------
/** Derived from the shared machine, so there is ONE source of truth for which
 *  panel is open across the whole rail. */
const userMenuOpen = computed<boolean>(() => isFlyoutOpen('profile'))

/**
 * Outside-click closing. The ONLY automatic close path: the menu deliberately
 * survives mouseleave (see the template comment), so without this it could
 * only be dismissed by re-clicking the avatar.
 */
const onDocumentPointerDown = (event: MouseEvent): void => {
  const target = event.target as Node | null
  if (target === null) return

  // A CLICK-opened flyout (including the profile menu) is sticky, so an
  // off-flyout click is the only way it closes (operator 2026-08-18). Anything
  // inside the rail is excluded: clicking another trigger must be handled by
  // that trigger's own toggle, which would otherwise fight this listener.
  if (activeFlyout.value !== undefined &&
      (target as HTMLElement).closest?.('#sidebar') === null) {
    closeFlyout()
  }
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', onDocumentPointerDown))

const userImage = computed<string>(() => store.user?.picture ?? '')
const userEmail = computed<string>(() => store.user?.email ?? '')
const userName = computed<string>(() => store.user?.given_name + ' ' + store.user?.family_name ?? '')

type Item = { title: string, iconRaw?: string, public?: boolean, visibleCondition?: () => boolean, route?: RouteLocationRaw, legacyPath?: string, children?: Item[] }

const items = computed(() => {
  return store.userIsProjectMember ? allItems : allItems.filter(i => i.public)
})

const allItems: Item[] = [
  {
    title: 'Overview',
    iconRaw: 'fi-grid',
    public: true,
    route: {
      name: ROUTE_NAMES.dashboard
    }
  },
  {
    title: 'Import',
    iconRaw: 'cloud-upload',
    route: {
      name: ROUTE_NAMES.importRecordings
    }
  },
  {
    title: 'Explore',
    iconRaw: 'fa-search',
    children: [
      {
        title: 'Visualizer',
        legacyPath: '/visualizer'
      },
      {
        title: 'Sites',
        route: {
          name: ROUTE_NAMES.mySites
        }
      },
      {
        title: 'Recordings',
        route: {
          name: ROUTE_NAMES.myRecordings
        }
      },
      {
        title: 'Species',
        route: {
          name: ROUTE_NAMES.mySpecies
        }
      },
      {
        title: 'Playlists',
        legacyPath: '/audiodata/playlists'
      }
    ]
  },
  {
    title: 'Audio analyses',
    iconRaw: 'fi-aed',
    children: [
      {
        title: 'Active jobs',
        legacyPath: '/jobs'
      },
      {
        title: 'Pattern Matching',
        legacyPath: '/analysis/patternmatching'
      },
      {
        title: 'Random Forest Models',
        legacyPath: '/analysis/random-forest-models/models'
      },
      {
        title: 'Soundscape Analysis',
        legacyPath: '/analysis/soundscapes'
      },
      {
        title: 'Audio Event Detection',
        legacyPath: '/analysis/audio-event-detections-clustering'
      },
      {
        title: 'Clustering',
        legacyPath: '/analysis/clustering-jobs'
      },
      {
        title: 'CNN',
        visibleCondition: () => {
          return userEmail.value.includes('rfcx.org')
        },
        route: {
          name: ROUTE_NAMES.cnnJobList
        }
      }
    ]
  },
  {
    title: 'Ecological insights',
    iconRaw: 'pres-chart-bar',
    route: {
      name: ROUTE_NAMES.overview
    }
  },
  {
    title: 'Project settings',
    iconRaw: 'fi-settings',
    children: [
      {
        title: 'Project information',
        route: {
          name: ROUTE_NAMES.projectSettings
        }
      },
      {
        title: 'Members',
        route: {
          name: ROUTE_NAMES.projectMember
        }
      }
    ]
  }
]

const logout = async (): Promise<void> => {
  // Auth0 logout forces a full refresh (redirect to auth.rfcx.org for SSO purposes)
  await auth.logout({ returnTo: `${ARBIMON_BASE_URL}/legacy-logout` })
}

function itemId (title: string): string {
  return 'sidebar-' + title.toLowerCase().replace(' ', '-')
}

// `showSidebar`, `isParent()` and `collapse()` were removed with the
// hover-widening (operator 2026-08-18). They existed to drive the inline
// Flowbite submenu collapses, which are now right-anchored flyouts owned by
// use-nav-flyout -- so `initCollapses()` goes too. `initDrawers`/`initDropdowns`
// stay: other Flowbite widgets on the page still rely on them.

onMounted(() => {
  initDrawers()
  initDropdowns()
})
</script>
<style lang="scss">

/**
 * The rail's scrolling middle zone.
 *
 * MEASURED: with `overflow-y-auto` this box reserved a 15px scrollbar gutter
 * inside a 52px rail -- almost a third of the width -- which is the "scrollbars
 * for overflow that isn't seen from the outside" the operator reported. The
 * icons were being squeezed by a scrollbar for content that only overflows on
 * very short viewports.
 *
 * `scrollbar-width: none` + the WebKit pseudo-element hide the bar WITHOUT
 * disabling scrolling, so the zone still scrolls by wheel/trackpad/keyboard on
 * a short window; it simply stops stealing layout width.
 *
 * `overflow-x: visible` cannot be combined with `overflow-y: auto` in CSS (the
 * spec computes the visible axis to auto), which is exactly why flyouts are
 * `position: fixed` rather than relying on escaping this box.
 */
.rail-scroll {
  overflow-y: auto;
  scrollbar-width: none;          /* Firefox */
  -ms-overflow-style: none;       /* legacy Edge */

  &::-webkit-scrollbar {          /* Chromium / WebKit */
    width: 0;
    height: 0;
  }
}

/* ==========================================================================
   RAIL MOTION (operator 2026-08-18)

   HOUSE TIMINGS. Enter is deliberately SLOWER than leave: entry should feel
   placed, dismissal should feel instant. Nothing here blocks interaction --
   every effect is on transform/opacity/colour only, which the compositor can
   run off the main thread, so a click during an animation lands immediately.

     hover feedback      120ms  ease-out
     flyout enter        130ms  cubic-bezier(0.16, 1, 0.3, 1)   (fast-out)
     flyout leave         90ms  ease-in
     active indicator    180ms  ease-out
     live-state pulse   2400ms  cubic-bezier(0.4, 0, 0.6, 1)

   ⚠️ `animate-*` UTILITIES DO NOT EXIST IN THIS BUILD. Verified against the
   emitted stylesheet: animate-spin/pulse/bounce/ping all emit NOTHING because
   this WindiCSS config declares no `animation`/`keyframes` theme block. Every
   keyframe below is therefore local, following the proven in-app pattern
   (`site-picker-ping`, `add-site-ping`).
   ========================================================================== */

.rail-item {
  position: relative;

  /* ACTIVE INDICATOR: a 3px lime bar on the left edge, replacing the heavy
     full-block highlight. Rendered as a pseudo-element so it costs no markup
     and cannot affect layout -- it scales on the Y axis from the centre, which
     reads as the bar "growing" into place rather than sliding in from nowhere. */
  &::before {
    content: '';
    position: absolute;
    left: -0.25rem;
    top: 50%;
    width: 3px;
    height: 60%;
    border-radius: 9999px;
    background-color: #ADFF2C;            /* frequency */
    transform: translateY(-50%) scaleY(0);
    opacity: 0;
    transition: transform 180ms ease-out, opacity 180ms ease-out;
    pointer-events: none;
  }

  &:hover::before {
    transform: translateY(-50%) scaleY(0.5);
    opacity: 0.35;
  }

  /* Active route, or the item whose flyout is open.

     `:has(.router-link-active)` reads the ACTIVE STATE STRAIGHT FROM THE
     ROUTER rather than re-deriving it in script. vue-router already stamps
     `.router-link-active` on the matching link, so there is exactly one source
     of truth and no route-matching logic to drift. (This is also why the
     component no longer needs `useRoute` at all.)

     `:has()` is supported in every browser this app targets — Chrome 105+,
     Safari 15.4+, Firefox 121+ — and the app already requires Chromium 144 for
     its own QA browser. If it ever failed, the bar simply would not show; the
     router's own filled-block styling still marks the active item, so the
     failure mode is cosmetic rather than a loss of information. */
  &:has(.router-link-active)::before,
  &.is-open::before {
    transform: translateY(-50%) scaleY(1);
    opacity: 1;
  }

  /* ICON HOVER LIFT. Scale only -- no margin/width change, so neighbouring
     items never shift. */
  .rail-icon {
    transition: transform 120ms ease-out, color 120ms ease-out;
  }

  &:hover .rail-icon {
    transform: scale(1.12);
  }

  &:active .rail-icon {
    transform: scale(0.96);               /* tactile press-down */
    transition-duration: 60ms;
  }
}

/* The active route keeps its filled treatment, but softened: the indicator bar
   now carries the signal, so the block no longer needs to shout. */
.sidebar-items {
  .router-link-active {
    --tw-text-opacity: 1;
    color: rgba(30, 28, 19, var(--tw-text-opacity));
    border-radius: 0.25rem;
    --tw-bg-opacity: 1;
    background-color: rgba(255, 254, 252, var(--tw-bg-opacity));
  }
}

/* ---- FLYOUT ENTER / LEAVE ------------------------------------------------
   Slides 6px out of the rail while fading. The short travel is the point: it
   says "this came from the rail" without making the user wait for it. */
.flyout-enter-active {
  transition: opacity 130ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 130ms cubic-bezier(0.16, 1, 0.3, 1);
}

.flyout-leave-active {
  transition: opacity 90ms ease-in, transform 90ms ease-in;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

/* ---- FLYOUT ITEM STAGGER -------------------------------------------------
   Children fade in 18ms apart. Capped at 5 steps: beyond that the last item
   would lag noticeably, and the FIRST item is never delayed because that is
   the one the pointer is already heading for. */
.flyout-row {
  animation: flyout-row-in 130ms ease-out both;
}

@keyframes flyout-row-in {
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
}

@for $i from 1 through 5 {
  .flyout-row:nth-child(#{$i + 1}) {
    animation-delay: #{$i * 18}ms;
  }
}

/* ---- LIVE-STATE PULSE ----------------------------------------------------
   The ONLY looping animation in the rail, and deliberately so: it represents
   genuinely ongoing work (active uploads/analyses). Looping decoration on
   navigation becomes noise -- see the 2026-08-14 alert-fatigue finding. */
.task-dot {
  animation: task-dot-pulse 2400ms cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes task-dot-pulse {
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%      { transform: scale(1.35); opacity: 0.55; }
}

/* ---- ACCESSIBILITY FLOOR -------------------------------------------------
   Matches the two components that already do this. Motion is removed, but every
   END STATE is preserved: the indicator still shows, the flyout still appears,
   the dot is still visible. Nothing becomes unusable or invisible. */
@media (prefers-reduced-motion: reduce) {
  .rail-item::before,
  .rail-item .rail-icon,
  .flyout-enter-active,
  .flyout-leave-active {
    transition: none !important;
  }

  .rail-item:hover .rail-icon,
  .rail-item:active .rail-icon {
    transform: none;
  }

  .flyout-row {
    animation: none;
  }

  .task-dot {
    animation: none;
  }
}

button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-down {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-down {
  display: inline-block;
}
</style>
