<template>
  <!-- PADDING FOLLOWS THE CHROME. The pop-out is chrome-free — no navbar,
       no sidebar — so there is no sidebar gutter to clear and a flat `p-6` is
       correct. In the SPA the LEFT gutter (`pl-18`/`pl-23`) is mandatory or the
       content slides underneath the fixed sidebar.

       TOP PADDING REDUCED pt-20 -> pt-6 (operator 2026-08-14). MEASURED first:
       the page carried 104px of dead space above the title — 80px from this
       `pt-20` plus 24px from the h1's `mt-6` — with NOTHING rendered above the
       section to justify it (verified: section top = 0, no navbar, no banner).

       The `pt-20` was clearing chrome THAT DOES NOT EXIST HERE. The sidebar is
       `fixed top-0 left-0 w-13 h-screen` — a narrow LEFT RAIL, not a top bar —
       so it consumes horizontal space (hence the pl- gutter) but no vertical
       space at the top. The value came in as part of a copied page-shell
       convention (`projects/audiodata/upload-page.vue` carries the identical
       class list, h1 `mt-6` included).

       ⚠️ DELIBERATE DIVERGENCE from the other project pages, which still use
       pt-20 + mt-6. This is a WORKSPACE page — a long queue the user works in,
       not a page they read — so vertical room is worth more here than shell
       consistency. Unifying the rest is a separate app-wide pass; if that
       happens, this page should adopt whatever the shell settles on. -->
  <section :class="isPopout ? 'p-6' : 'pt-6 pl-18 pr-6 md:(pl-23 pr-10) pb-20'">
    <div>
      <!-- The PROJECT is the primary header; the task is the sub-header. The
           project you are uploading into is the thing that orients the user
           (and the thing that differs between uploader windows).

           NO `mt-6` (2026-08-14): it stacked on the section's top padding
           rather than replacing it — padding on the parent plus margin on the
           first child — which is how 104px accumulated without either value
           looking unreasonable on its own. -->
      <h1>
        {{ projectName ?? 'Project' }}
      </h1>
      <!-- ACTION SITS ON THE SUB-HEADER LINE (operator 2026-08-14), not beside
           the project title. The button acts on the TASK ("Upload &amp; Import
           Recordings"), so pairing it with the task line reads correctly and
           leaves the project name as an uninterrupted heading.

           `items-center` so the control is optically centred against the h2
           text rather than hanging from its top, and `shrink-0` on the button
           so a long project/task heading can never squeeze it (it carries
           `whitespace-nowrap`, which would otherwise force overflow instead of
           shrinking). -->
      <div class="flex items-center justify-between gap-x-4 mt-1">
        <h2 class="text-lg font-semibold">
          Upload &amp; Import Recordings
          <!-- Generic "NEW" chip: intentionally not uploader-specific so the
               same treatment can flag other new features elsewhere. -->
          <span class="text-xs align-middle rounded bg-frequency/20 text-frequency px-2 py-0.5 ml-2 font-medium tracking-wide">NEW</span>
        </h2>
        <!-- WRAPPER carries the hover/focus state, not the button, because the
             button becomes DISABLED once the standalone window is open — and a
             disabled control fires no pointer events, so a tooltip anchored to
             it would vanish exactly when the user most needs to know why the
             button is inert. Hovering the wrapper still works.

             `group` + `group-hover`/`group-focus-within` rather than the repo's
             flowbite `initTooltips()` helper: that helper scans the DOM once on
             mount, and this button lives in a branch that re-renders as the
             pop-out opens and closes, so a scan-once tooltip would go dead. A
             CSS-only tooltip has no lifecycle to get wrong. -->
        <span
          v-if="!isPopout"
          class="relative group shrink-0 inline-flex items-center gap-x-2"
        >
          <!-- [i] AFFORDANCE (operator 2026-08-14). The tooltip already appeared
               on hover, but nothing ADVERTISED that more information exists — a
               hover-only explanation is invisible to anyone who does not happen
               to hover, and invisible on touch entirely.

               Uses the app's own auto-registered `icon-custom-ic-info` rather
               than a hand-rolled glyph, so it matches every other [i] in the
               product (filter-panel, sortable-table, numeric-metric).

               It sits INSIDE the `group` wrapper, so hovering the icon shows the
               same panel as hovering the button — one tooltip, two triggers.

               `tabindex="0"` + `role="button"` make it reachable by keyboard:
               the wrapper's `group-focus-within` then reveals the panel, which
               is what gives keyboard and screen-reader users the explanation
               that mouse users get from hovering. It has NO click handler on
               purpose — it explains, it does not act, and a click that did
               nothing would be worse than no click at all. -->
          <icon-custom-ic-info
            class="h-4 w-4 shrink-0 cursor-help text-cloud transition-colors group-hover:text-frequency"
            tabindex="0"
            role="button"
            :aria-label="`About the standalone uploader`"
            :aria-describedby="`popout-help-${projectSlug}`"
          />
          <button
            class="btn btn-secondary text-sm shrink-0 whitespace-nowrap inline-flex items-center gap-x-2 disabled:btn-disabled disabled:hover:btn-disabled disabled:cursor-not-allowed"
            :disabled="popoutLaunched"
            :aria-describedby="`popout-help-${projectSlug}`"
            @click="popOut"
          >
            Standalone Uploader
            <!-- Material Symbols "open in new" (the Gmail pop-out glyph);
                 -960-based viewBox per the Material icon coordinate system -->
            <svg
              viewBox="0 -960 960 960"
              class="w-4 h-4 fill-current"
            ><path d="M216-144q-29.7 0-50.85-21.15T144-216v-528q0-29.7 21.15-50.85T216-816h264v72H216v528h528v-264h72v264q0 29.7-21.15 50.85T744-144H216Zm171-192-51-51 357-357H576v-72h240v240h-72v-117L387-336Z" /></svg>
          </button>

          <!-- TOOLTIP ON THE LEFT (operator 2026-08-14). `right-full` anchors it
               to the button's left edge and `mr-3` gives the 12px gap.

               ANCHORED TO THE BUTTON'S TOP (`top-0`), not centred on it. The
               first version used `top-1/2 -translate-y-1/2`, which MEASURED
               correctly centred (delta 0) and then hung 5px ABOVE the viewport
               and clipped — this panel is 206px tall against a 44px button, and
               §143 reclaimed the page's top padding, so there is no longer room
               above to centre into. Top-anchoring keeps the whole panel on
               screen and still reads as attached to the control.

               (Note `-translate-y-1/2` ALSO needs the `transform` utility in
               this WindiCSS build — on its own it only sets --tw-translate-y and
               nothing consumes it. That cost a 103px offset before it was
               measured. Moot here now, but the trap is worth remembering.)

               `w-80 whitespace-normal` is required: the button carries
               `whitespace-nowrap`, which children inherit — without the reset
               this paragraph would render as one enormous single line running
               off-screen.

               `pointer-events-none` so the panel can never intercept a click
               aimed at the button behind/beside it, and `role="tooltip"` +
               `aria-describedby` so the explanation is announced rather than
               being purely visual. It is NOT the accessible NAME — the button's
               own text is that — so `describedby` is the correct relationship.

               The `title` attribute was REMOVED from the button: leaving it
               would produce two tooltips on the same hover (the native one
               overlapping this panel a second later). -->
          <span
            :id="`popout-help-${projectSlug}`"
            role="tooltip"
            class="pointer-events-none absolute right-full top-0 mr-3 w-80 whitespace-normal text-left rounded-lg border border-cloud/20 bg-echo px-4 py-3 text-xs leading-relaxed text-cloud shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover:(opacity-100 visible) group-focus-within:(opacity-100 visible) z-50"
          >
            <span class="block text-insight font-medium mb-1">
              {{ popoutLaunched ? 'Already open in its own window' : 'Why run the uploader in its own window?' }}
            </span>
            <template v-if="popoutLaunched">
              This project’s uploader is already running in a standalone window.
              Bring it forward from your taskbar or dock — look for
              “{{ popoutWindowTitle }}”.
            </template>
            <template v-else>
              A standalone window keeps your uploads running in one dedicated
              place, so you can browse Arbimon freely in this tab without
              disturbing them. It stays visible while you work in other apps,
              survives navigating away from this page, and makes it obvious the
              transfer is still going. Large batches can take hours — this is
              the safest way to leave one running.
            </template>
          </span>
        </span>
        <!-- NO “Close window” BUTTON in the pop-out (operator 2026-08-14).

           It called a bare `window.close()` and nothing else, so it was exactly
           the OS/browser close control re-drawn inside the page — no extra
           cleanup, no confirmation, no different outcome. The `beforeunload`
           guard is registered on the WINDOW, so it fires the same way whichever
           path closes it, and openers notice the heartbeat stop within
           POPOUT_STALE_MS either way.

           Removing it also removes a small hazard: an in-page button that
           destroys the document can be clicked by someone who expected it to
           close a panel, whereas the window chrome is unambiguous and already
           where users look to close a window. -->
      </div>
    </div>

    <!-- Intro copy sits OUTSIDE the header flex row so it spans the FULL page
         width. Inside that row it was boxed in by the Pop-Out button beside it
         (measured 921px of a 1306px viewport), which removing max-w-4xl alone
         did not fix. -->
    <p class="text-sm text-cloud mt-3">
      Upload recordings from directly within your browser. Metadata from your recordings and project data are used to match each recording to the correct date, time and timezone and to scan for duplicate recordings within a Site. You&rsquo;ll have a chance to review and correct the dates, times and timezones of your recordings before they&rsquo;re uploaded. Then, click &ldquo;Start&rdquo; to launch the upload.
      <!-- Background-uploads sentence (operator 2026-08-14): now POINTS AT the
           standalone window rather than explaining the close-and-re-add case.

           The behaviour it used to describe is unchanged and still surfaced
           where it actually bites: the queue persists (IndexedDB) but in-memory
           file handles cannot survive a closed document, so affected rows are
           rejected with “Session interrupted — re-add this folder to resume
           (already-uploaded files are skipped)” at the point of failure, and the
           beforeunload guard warns before a close that would cause it.
           Recommending the standalone window is the better framing: it steers
           users AWAY from the failure instead of describing it up front. -->
      Uploads continue in the background while you browse other pages in Arbimon, but for optimal stability and performance for uploading many recordings, it is recommended to use the &ldquo;Standalone Uploader&rdquo; feature.
    </p>

    <div
      v-if="isProjectViewOnly"
      class="mt-6 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm text-flamingo inline-block"
    >
      This project is view-only and cannot accept uploads.
    </div>

    <!-- BLOCKED-TAB NOTICE — deliberately a SIBLING, not a branch of the chain
         below (2026-08-14, second pass).

         It used to be a `v-else-if` in the SAME chain as the uploader itself,
         while its own comment claimed it would "fall back to the FULL inline
         uploader". It did the exact opposite: a matched branch excludes every
         later one, so a blocked open rendered this notice ALONE and the uploader
         did not render at all. The banner read "it’s running here instead" on a
         page where nothing was running — precisely the dead end the guard was
         written to prevent.

         As an independent `v-if` it is advisory: the notice shows AND the
         uploader below it still renders. -->
    <div
      v-if="popoutBlocked && !isPopout && !popoutActive && !isProjectViewOnly"
      class="mt-6 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm"
    >
      <p class="text-insight">
        Your browser blocked the pop-out window, so it’s running here instead.
      </p>
      <p class="text-cloud mt-1">
        Allow pop-ups for this site to keep uploads in their own window, or
        <button
          class="text-frequency hover:underline"
          @click="popOut"
        >
          try opening it again
        </button>.
      </p>
    </div>

    <!-- Pop-out placeholder (operator 2026-08-14; button REMOVED 2026-08-18).
         The uploader is stateful, so only ONE document drives a given project
         at a time. When a pop-out window owns this project the original tab
         shows this instead of a second, competing uploader.

         THE “Go to the uploader window” BUTTON WAS REMOVED ENTIRELY
         (operator 2026-08-18): `window.open(url, name)` on an EXISTING window
         does not merely focus it — passing a URL RE-NAVIGATES that window,
         i.e. it force-reloads the live uploader and disrupts the uploads the
         placeholder exists to protect. There is no reliable focus-only
         primitive from the opener (window handles are not retained across SPA
         navigations, and `focus()` on a fresh handle is widely ignored), so
         the honest UI is a static pointer: name the window's title and let the
         user raise it from their taskbar/dock — which is exactly where a
         standalone window lives. -->
    <div
      v-if="popoutActive && !isPopout && !isProjectViewOnly"
      class="mt-6 rounded-lg border border-frequency/30 bg-frequency/10 px-4 py-4 text-sm"
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div class="flex items-start gap-x-3">
          <svg
            viewBox="0 -960 960 960"
            class="w-5 h-5 fill-frequency shrink-0 mt-0.5"
          ><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-440H180v440Z" /></svg>
          <div>
            <p class="text-insight font-medium">
              This project’s uploader is open in another window
            </p>
            <p class="text-cloud mt-0.5">
              Uploads keep running there. Switch to that window to review or control them
              — look for “{{ popoutWindowTitle }}” in your taskbar or dock.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="!isProjectViewOnly">
      <!-- Global control bar FIRST (2026-08-12 layout pass): Start/Pause +
           Grafana-style stat panels sit directly under the title as the page's
           permanent header row (no v-if — an Idle button + zeroed panels is the
           stable empty state; hiding it made the layout jump on first file). -->
      <div class="mt-6 flex items-stretch gap-x-3 w-full">
        <button
          class="shrink-0 rounded-lg px-6 font-medium text-base inline-flex flex-col items-center justify-center gap-y-1 min-w-28 transition-colors"
          :class="startPauseClass"
          :disabled="startPauseDisabled"
          @click="onStartPause"
        >
          <svg
            v-if="buttonMode === 'pause'"
            viewBox="0 0 16 16"
            class="w-5 h-5 fill-current"
          ><path d="M4 2h3v12H4zM9 2h3v12H9z" /></svg>
          <svg
            v-else
            viewBox="0 0 16 16"
            class="w-5 h-5 fill-current"
          ><path d="M4 2l9 6-9 6V2z" /></svg>
          <span>{{ startPauseLabel }}</span>
        </button>

        <!-- Panel order (operator 2026-08-14, revised three times), left to right:
             Queued · Totals(Imported/Errors/Skipped/Uploaded) · Rate
             · Collapse/Expand All · Settings.

             RATE CLOSES THE FIGURES (operator 2026-08-14 — moved from first
             to last). Rate is the only INSTANTANEOUS reading here: a 10s
             sliding window, and the one figure the Reset control does not
             touch. Sitting it AFTER the cumulative Totals keeps it from being
             read as another total, and leaves Queued — the number you watch to
             know how much work remains — first.

             SETTINGS CLOSES THE ROW on the right: an action, deliberately at
             the opposite end from Start/Pause so the row is bracketed by its
             two controls with the read-only figures between them.

             WHAT CHANGED AND WHY:
             • The OUTCOME figures are ONE box. They answer a single question —
               "what happened to the recordings I submitted?" — and are the same
               KIND of number: cumulative, persisted per project, and all reset
               together. Each keeps its own label and colour, so they are
               grouped, NOT merged into a total (summing them would be
               meaningless — a skip is not a failure, and adding an error to an
               import answers no question anyone asks).
             • UPLOADED joins them (operator), last in the list. It is the same
               kind of number — cumulative and reset by the same button — and
               moving it in makes the box contain EXACTLY the set that Reset
               clears, which is what lets the Reset control live inside it
               without needing to explain its scope.
             • "Complete" was replaced by QUEUED: work still to do is the number
               you watch during an upload, whereas Complete duplicated what
               Imported already told you (both counted successful ingests) and
               its N/N ratio went stale the moment rows were cleared.

             UPLOAD RATE stays OUTSIDE the Totals box: it is an
             instantaneous throughput reading (a 10s sliding window), not a
             cumulative outcome, and Reset does not touch it. Putting it in
             would have broken the "this box is exactly what Reset clears" rule.

             Grid: 6 columns = Queued(1) + Totals(4) + Rate(1).

             The two ICON BUTTONS deliberately sit OUTSIDE this grid, as
             siblings in the outer flex row (like Start/Pause). A grid cell
             stretches to its column by definition, so a fixed, narrow width is
             not expressible while they are cells — they would keep taking a
             full metric-sized column. As flex children with `shrink-0` and an
             explicit `w-14` they stay static at every viewport, and the metrics
             keep the whole remaining width. -->
        <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <!-- QUEUED is deliberately GLOBAL (all projects), matching the engine's
               unscoped stats and the operator's request. The upload engine is a
               single queue shared by every project, so a per-project figure
               would under-report what the machine is actually working through.
               The tooltip says so explicitly, because every OTHER count in this
               row is project-scoped and a silent mix would be misleading.

               The state set below mirrors staging-table's `statusGroupOf`
               default branch EXACTLY (analyzing/staged/queued/preparing/ready/
               paused). Using the bare `stats.queued` field would show a smaller
               number than the table's own "Queued" section header — two things
               with the same label disagreeing is worse than either number. -->
          <div
            class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center"
            title="Recordings waiting to upload across ALL your projects (analyzing, staged, queued, preparing, ready or paused). The upload queue is shared between projects."
          >
            <span class="text-xs text-cloud uppercase tracking-wide">Queued</span>
            <span class="text-xl tabular-nums font-medium">{{ globalQueued }}</span>
          </div>

          <!-- TOTALS — one box, four figures, each keeping its own identity, plus
               the Reset control that clears exactly this set. -->
          <div class="lg:col-span-4 rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5">
            <!-- Header line: label LEFT, Reset pinned to the box's TOP-RIGHT
                 corner (operator 2026-08-14 — moved back from beside the label).

                 `justify-between` is what pushes the button to the right edge,
                 and the row spans the full box width again (no `w-max`) so
                 there is a right edge to pin to.

                 A FLEX ROW rather than absolute positioning: the button can
                 never overlap a long label, and the box needs no fixed height.

                 `-mr-1.5 -mt-0.5` pull it optically into the corner against the
                 box's px-4/py-2.5 padding, without shrinking that padding for
                 the metrics themselves. `items-start` puts it level with the
                 top of the label rather than centred on it — correct for a
                 corner affordance.

                 Reset clears the CUMULATIVE counters. It lives INSIDE this box
                 because the box holds exactly the four totals it clears — scope
                 shown by placement rather than words.

                 aria-label + title remain LOAD-BEARING: with no visible "Reset"
                 text they are the only naming a screen reader or hovering user
                 gets. It still confirms before acting (the counters are
                 persisted per project and unrecoverable) and does NOT touch the
                 upload queue — see resetProjectMetrics(). -->
            <div class="flex items-start justify-between gap-x-2">
              <span class="text-xs text-cloud uppercase tracking-wide">Totals</span>
              <!-- ICON: a COUNTERCLOCKWISE reset arrow (operator 2026-08-18,
                   from a supplied reference glyph — the classic "reset/undo"
                   arrow). This supersedes the "0 in a rounded square" digit
                   icon, which the operator asked to replace.

                   HISTORY THIS DELIBERATELY NAVIGATES: circular-arrow glyphs
                   were rejected twice before (2026-08-14) because they
                   duplicated the per-row RETRY glyph in staging-table.vue
                   (`M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3`, CLOCKWISE).
                   The operator has now explicitly chosen a reset-style arrow
                   anyway — so the differentiator is DIRECTION: this one is the
                   exact MIRROR of Retry (counterclockwise, hook on the LEFT),
                   which is the conventional undo/reset direction, while Retry
                   stays clockwise. Same family, opposite rotation — legible at
                   16px because it reuses Retry's proven arc geometry, mirrored
                   (x' = 16 − x flips the sweep flag 1→0). -->
              <button
                class="shrink-0 -mr-1.5 -mt-0.5 p-1 rounded text-cloud hover:(text-flamingo bg-flamingo/10) transition-colors"
                title="Reset the Imported / Errors / Skipped / Uploaded totals for this project to zero. Does not affect the upload queue."
                aria-label="Reset metrics to zero"
                @click="onResetMetrics"
              >
                <svg
                  viewBox="0 0 16 16"
                  class="w-4 h-4 fill-none stroke-current"
                  stroke-width="1.5"
                ><path
                  d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 1.5v3h3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /></svg>
              </button>
            </div>
            <!-- DELIMITERS (operator 2026-08-14): a vertical rule between each
                 figure, so four numbers side by side read as four distinct
                 metrics rather than one run-on string.

                 A BORDER, not a · character: a text separator would be
                 selectable, would land in any copy-paste of the row, and would
                 be announced by a screen reader as content. A left border on
                 every item except the first is decoration by construction —
                 invisible to assistive tech and to the clipboard.

                 Geometry: `pl-5` + `first:(pl-0 border-l-0)` pairs with the
                 gap-x-5 below so the rule sits centred in the gutter rather
                 than crowding the number that follows it. `self-stretch` makes
                 every rule the same height regardless of its item's content,
                 which `items-baseline` alone would not do. -->
            <div class="mt-0.5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span class="flex items-baseline gap-x-1.5 pl-5 border-l border-cloud/20 first:(pl-0 border-l-0)">
                <span class="text-xl tabular-nums font-medium text-frequency">{{ metrics.completed }}</span>
                <span class="text-xs text-cloud">Imported</span>
              </span>
              <span class="flex items-baseline gap-x-1.5 pl-5 border-l border-cloud/20 first:(pl-0 border-l-0)">
                <span
                  class="text-xl tabular-nums font-medium"
                  :class="metrics.failed > 0 ? 'text-flamingo' : ''"
                >{{ metrics.failed }}</span>
                <span class="text-xs text-cloud">Errors</span>
              </span>
              <!-- "Skipped" (operator 2026-08-14): these recordings were already
                   in the project, so nothing was uploaded and nothing went
                   wrong. "Duplicates" reads like a problem to fix; "Skipped"
                   states what the uploader DID. -->
              <span class="flex items-baseline gap-x-1.5 pl-5 border-l border-cloud/20 first:(pl-0 border-l-0)">
                <span class="text-xl tabular-nums font-medium">{{ metrics.duplicates }}</span>
                <span class="text-xs text-cloud">Skipped</span>
              </span>
              <span class="flex items-baseline gap-x-1.5 pl-5 border-l border-cloud/20 first:(pl-0 border-l-0)">
                <span class="text-xl tabular-nums font-medium">{{ formatBytes(metrics.bytesTransferred) }}</span>
                <span class="text-xs text-cloud">Uploaded</span>
              </span>
            </div>
          </div>

          <!-- RATE LAST (operator 2026-08-14). It is the only INSTANTANEOUS
               reading in the row — a 10s sliding window, and the one figure
               Reset does not touch — so placing it AFTER the cumulative Totals
               keeps it from being read as one of them. -->
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Rate</span>
            <span class="text-xl tabular-nums font-medium">{{ formatRate(currentRateBps) }}</span>
          </div>
        </div>

        <!-- ICON BUTTONS — outside the grid, fixed width (operator 2026-08-14).

             LABELS REMOVED: both actions are conventional glyphs (Material gear
             / double-chevron) doing what they look like, and the labels were
             what forced these boxes to metric width. Losing them makes
             `title` + `aria-label` LOAD-BEARING — they are now the only naming
             a hovering or screen-reader user receives, so both are kept and the
             collapse button's pair stays state-dependent.

             `w-14` (56px) + `shrink-0` gives the STATIC narrow width asked for:
             as flex siblings they no longer inherit a metric column's width,
             and they do not grow or shrink with the viewport.

             `items-stretch` on the parent row already matches their height to
             the metric panels, so no explicit height is needed — which is why
             the icons are sized (w-6, 24px) against the panels' ~62px rather
             than against the button's own box. -->
        <!-- COLLAPSE/EXPAND ALL. Mirrors the caret control on the options row
             below — same `toggleAllBoxes` handler, same `anyBoxExpanded` state,
             same Material double-chevron glyphs — so the two cannot disagree
             about which direction they point.

             INERT WHEN THERE IS NOTHING TO TOGGLE. `canToggleBoxes` requires at
             least ONE LINKED section: a box whose site is not yet chosen renders
             no collapsible body, so counting it would gray the button in and out
             as the user picks sites.

             Threshold differs DELIBERATELY from the caret below (>= 2): that
             caret is an in-context shortcut and may vanish when pointless, but
             this button holds a fixed place in the control row, so it stays and
             explains itself via `title` instead. -->
        <button
          class="shrink-0 w-14 rounded-lg border border-cloud/20 bg-moss/30 flex items-center justify-center text-cloud transition-colors hover:(text-frequency border-frequency/40 bg-moss/50) focus-visible:(outline-none ring-2 ring-frequency) disabled:(text-cloud/40 border-cloud/10 bg-moss/10 cursor-not-allowed) disabled:hover:(text-cloud/40 border-cloud/10 bg-moss/10)"
          :disabled="!canToggleBoxes"
          :title="canToggleBoxes
            ? (anyBoxExpanded ? 'Collapse all Upload Queue Sections' : 'Expand all Upload Queue Sections')
            : 'No upload queue sections to collapse yet — add a site section first'"
          :aria-label="anyBoxExpanded ? 'Collapse all sections' : 'Expand all sections'"
          @click="toggleAllBoxes"
        >
          <!-- unfold-less when something is expanded (the action is COLLAPSE),
               unfold-more when everything is collapsed (the action is EXPAND). -->
          <svg
            v-if="anyBoxExpanded"
            viewBox="0 -960 960 960"
            class="w-6 h-6 fill-current"
          ><path d="M289-95l-50-50L480-387L721-145L671-95L480-285L289-95ZM480-573L239-815l50-50L480-675L671-865l50,50L480-573Z" /></svg>
          <svg
            v-else
            viewBox="0 -960 960 960"
            class="w-6 h-6 fill-current"
          ><path d="M480-95L239-337l50-50l191,190l191-190l50,50L480-95ZM289-575l-50-50l241-242l241,242l-50,50l-191-190L289-575Z" /></svg>
        </button>

        <!-- SETTINGS LAST (operator 2026-08-14): swapped back to the far right.
             Mirrors the Settings control in the options row below — same modal,
             same `showSettings` flag, same Material gear glyph — so the two
             entry points cannot drift apart in behaviour. -->
        <button
          class="shrink-0 w-14 rounded-lg border border-cloud/20 bg-moss/30 flex items-center justify-center text-cloud transition-colors hover:(text-frequency border-frequency/40 bg-moss/50) focus-visible:(outline-none ring-2 ring-frequency)"
          title="Uploader Settings"
          aria-label="Uploader Settings"
          @click="showSettings = true"
        >
          <svg
            viewBox="0 -960 960 960"
            class="w-6 h-6 fill-current"
          ><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z" /></svg>
        </button>
      </div>

      <!-- OPTIONS ROW REMOVED (operator 2026-08-14). It held three controls,
           and by this point every one of them was a DUPLICATE:
             • "Add Recordings to a Site" — the full-width dashed button at the
               bottom of the stack calls the SAME `addUnlinkedBox` handler with
               the SAME `hasUnlinkedBox` disabled rule, and it is ALWAYS
               rendered (it doubles as the empty state), so nothing is stranded;
             • Settings — now the gear panel-button in the metrics row (§132);
             • Expand/Collapse all — now the panel-button beside it (§134),
               which also fixed that caret's >= 2 threshold: it used to VANISH
               with a single section, while the panel stays and explains itself.

           The `showSettings` modal, `addUnlinkedBox`, `toggleAllBoxes` and
           `anyBoxExpanded` are all still live — only this row's markup is gone,
           not the behaviour behind it. `linkedBoxCount` survives too, now used
           only via `canToggleBoxes` (§134). -->

      <!-- CREATE-A-SITE MODAL. Rendered by the PAGE, not by the staging table:
           the table reports the intent (`createSite`) and the page owns the
           dialog, which is what keeps the modal reusable elsewhere in the SPA
           (operator 2026-08-14) instead of being welded into the uploader.

           `:key` forces a fresh instance per open, so a second open never
           inherits the previous attempt's typed values or error state. -->
      <site-form-modal
        v-if="creatingSiteForBoxId !== undefined && apiClientArbimon !== undefined"
        :key="`create-site-${creatingSiteForBoxId}`"
        :project-slug="projectSlug"
        :project-core-id="store.project?.idCore ?? ''"
        :api-client="apiClientArbimon"
        @close="creatingSiteForBoxId = undefined"
        @created="onSiteCreated"
      />

      <uploader-settings-modal
        v-if="showSettings"
        :flac-enabled="flacEncodeEnabled"
        :flac-info-text="FLAC_INFO_TEXT"
        :timestamp-formats="timestampFormats"
        @close="showSettings = false"
        @update:flac-enabled="flacEncodeEnabled = $event"
        @manage-formats="showFormatEditor = true"
      />

      <!-- hidden file input; routed to whichever box requested the picker -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".wav,.flac,.opus,.aiff,.aif"
        class="hidden"
        @change="onPick"
      >

      <!-- SEPARATE hidden input for FOLDER picking (operator 2026-08-14).

           `webkitdirectory` cannot share an input with the file picker: it is a
           property of the ELEMENT, not of the click, so one input can offer
           files OR a directory but never both. Two inputs is the standard
           solution and keeps each dialog honest about what it will accept.

           `accept` is deliberately OMITTED here — with webkitdirectory the
           browser hands over the entire subtree regardless, and an accept list
           only creates the false impression that filtering happened in the
           dialog. The filtering that matters is `isSupportedAudioFile` in
           enqueueFiles, which already runs for every intake path.

           Each File carries `webkitRelativePath` ("folder/sub/REC.wav"), which
           is passed through as relativePath so a picked folder produces exactly
           the same rows as the same folder DROPPED — the drag path has walked
           directories since day one via collectDroppedFiles. -->
      <input
        ref="folderInput"
        type="file"
        multiple
        webkitdirectory
        class="hidden"
        @change="onPickFolder"
      >

      <!-- Per-site upload boxes, newest on top. Each box is a complete unit:
           header (site name) + filters + table + its OWN drag/drop intake.
           A drop into a box stages files for THAT box's site — the moment of
           association is where you dropped, not a page-level selector. -->
      <template
        v-for="box in siteBoxes"
        :key="box.boxId"
      >
        <!-- No <hr> between sections: each Upload Queue Section now carries its
             OWN top+bottom border (2026-08-13), so a separator here would
             stack a third rule between adjacent sections. -->
        <div
          @dragenter.prevent="box.streamId !== undefined && boxDragEnter(box.streamId)"
          @dragover.prevent
          @dragleave.prevent="box.streamId !== undefined && boxDragLeave(box.streamId)"
          @drop.prevent="box.streamId !== undefined && boxDrop(box.streamId, $event)"
        >
          <staging-table
            :items="box.streamId !== undefined ? itemsForBox(box.streamId) : []"
            :site-name="box.siteName"
            :site-timezone="box.siteTimezone"
            :running="engineRunning"
            :site-options="siteOptions"
            :opening-id="openingVisualizerId"
            :flac-enabled="flacEncodeEnabled"
            :drop-active="box.streamId !== undefined && dragBoxId === box.streamId"
            :collapsed="collapsedBoxIds.has(box.boxId)"
            :site-info="box.streamId !== undefined ? siteInfoFor(box.streamId) : undefined"
            :box-key="box.boxId"
            @create-site="onRequestCreateSite(box.boxId, $event)"
            @toggle-collapsed="toggleBoxCollapsed(box.boxId)"
            @edit-datetime="applyDatetimeEdit"
            @set-group-zone="applyGroupZone"
            @start-group="startGroup"
            @pause-group="pauseGroup"
            @remove-box="removeSiteBox(box.boxId)"
            @site-chosen="linkBoxToSite(box.boxId, $event)"
            @clear-completed="box.streamId !== undefined && clearCompleted(box.streamId)"
            @retry-failed="box.streamId !== undefined && retryFailed(box.streamId)"
            @clear-selected="clearSelected"

            @retry-item="retryItem"
            @clear-item="clearItem"
            @open-destination="openInVisualizer"
          >
            <!-- INTAKE / DROP ZONE (operator 2026-08-18: give it its own
                 subtly different surface, hover a little, drag-over a lot).

                 TWO states (operator 2026-08-18): the crosshatch is simply how
                 this area looks, and it shifts to a muted lime when a file is
                 dragged over it. There is deliberately NO mouseover state —
                 see intakeStyle() for why it was removed.

                 The crosshatch is an inline repeating-linear-gradient rather
                 than a utility class: this WindiCSS build does not compile
                 arbitrary gradients or arbitrary `em`/size values (verified in
                 the emitted CSS — an arbitrary-value utility silently produced
                 NO rule), and colours are the only arbitrary values it emits.
                 An inline style is honest about that and cannot fail silently.

                 45° + 135° at 8px gives a true crosshatch; the lines are 1px
                 so it reads as tooth rather than stripes. -->
            <template #intake>
              <div
                class="border-t border-dashed px-6 py-6 text-center transition-colors duration-150"
                :class="box.streamId !== undefined && dragBoxId === box.streamId ? 'border-frequency bg-frequency/10' : 'border-cloud/30'"
                :style="intakeStyle(box.streamId !== undefined && dragBoxId === box.streamId)"
              >
                <template v-if="box.streamId !== undefined">
                  <p :class="itemsForBox(box.streamId).length === 0 ? 'text-lg' : 'text-base'">
                    Drag &amp; drop files or folders of recordings for <span class="text-frequency">{{ box.siteName }}</span>
                  </p>
                  <!-- This line now INTRODUCES the two buttons below it rather
                       than describing the feature, so it ends in a colon and
                       sits directly above them. The details it used to carry
                       (accepted extensions, local analysis, staged-before-upload)
                       are not lost: the extensions are enforced by the file
                       picker's `accept` and by isSupportedAudioFile on every
                       intake path, and the staging behaviour is visible in the
                       table immediately above this panel. -->
                  <p class="text-sm text-cloud mt-1">
                    or choose the audio files or folders directly:
                  </p>
                  <!-- TWO pickers, because a browser file dialog can offer
                       files OR a folder, never both (see the hidden inputs
                       above). Dropping already handles either, so this is the
                       keyboard/click path catching up with the drag path. -->
                  <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      class="btn btn-secondary text-sm"
                      @click="pickFilesFor(box.streamId)"
                    >
                      Choose recordings…
                    </button>
                    <button
                      class="btn btn-secondary text-sm"
                      title="Pick a folder — every supported recording inside it, including sub-folders, is added"
                      @click="pickFolderFor(box.streamId)"
                    >
                      Choose a folder…
                    </button>
                  </div>
                </template>
                <p
                  v-else
                  class="text-cloud"
                >
                  Select a site above to enable this section.
                </p>
              </div>
            </template>
          </staging-table>
        </div>
      </template>

      <!-- Add-a-site affordance. ALWAYS rendered, at the BOTTOM of the stack:
           it is the empty state when there are no boxes yet, and the “add
           another” target once boxes exist. Clicking anywhere in the box is
           equivalent to the header’s “Add Recordings to another Site” button — same
           handler, same disabled rule (one pending unlinked box at a time). It
           is a real <button> so it is keyboard-focusable and announced, rather
           than a div with a click handler.

           EMPTY-STATE ATTENTION GLOW (operator 2026-08-18): when NO site
           sections exist yet (`siteBoxes.length === 0` — both SPA and pop-out,
           first load or after removing the last section), this button is the
           page's only next step, so it gets the same treatment as the unlinked
           site picker (§147: pulsing ring + accent border + tinted field), but
           DELIBERATELY MORE SUBTLE — a slower cycle, a fainter ring and a
           lighter tint — because this is an invitation, not the picker's
           “you must finish what you started” state. Same implementation rules
           as §147: a LOCAL keyframe (this WindiCSS config registers only
           `wave`, so `animate-*` utilities silently emit nothing), box-shadow
           only (no reflow), and reduced-motion users keep the border + tint
           cues with the motion dropped. The keyframes live in THIS component's
           <style> block because this button is rendered here (§153: scoped CSS
           does not cross a component boundary). -->
      <button
        type="button"
        class="mt-6 w-full rounded-lg border-2 border-dashed px-6 py-12 text-center block transition-colors"
        :class="hasUnlinkedBox
          ? 'border-cloud/20 opacity-60 cursor-not-allowed'
          : siteBoxes.length === 0
            ? 'add-site-attention border-frequency/70 bg-frequency/5 cursor-pointer hover:border-frequency hover:bg-frequency/10 focus-visible:border-frequency focus-visible:bg-frequency/10'
            : 'border-cloud/40 cursor-pointer hover:border-frequency hover:bg-frequency/5 focus-visible:border-frequency focus-visible:bg-frequency/5'"
        :disabled="hasUnlinkedBox"
        :title="hasUnlinkedBox ? 'Pick a site for the new section above first' : 'Add an Upload Queue Section for a site'"
        aria-label="Click to Add Recordings to a Site"
        @click="addUnlinkedBox"
      >
        <span class="text-lg inline-flex items-center gap-x-2 justify-center">
          <svg
            viewBox="0 0 16 16"
            class="w-4 h-4 fill-current shrink-0"
          ><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" /></svg>
          Click to Add Recordings to a Site
        </span>
        <span class="block text-sm text-cloud mt-2">
          Audio Recordings are associated with Sites. In this Uploader, each Site gets its own Audio Upload Queue.
        </span>
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { apiArbimonFindRecordingAtExactTime, apiArbimonResolveRecordingId } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type UserTimestampFormat } from '@rfcx-bio/common/dao/types'
import { type TimezoneMode, type UploadItem, analyzeFile, collectDroppedFiles, createUploadItem, formatUtcOffsetLabel, isSupportedAudioFile, retimestampToOffset } from '@rfcx-bio/upload-engine'

import SiteFormModal, { type SiteSaved } from '@/_components/site-form-modal/site-form-modal.vue'
import StagingTable from '@/_components/upload-panel/staging-table.vue'
import UploaderSettingsModal from '@/_components/upload-panel/uploader-settings-modal.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { track } from '~/analytics'
import { useStore } from '~/store'
import { bindProjectMetrics, currentRateBps, currentSurface, engine, engineRunning, fileSource, flacEncodeEnabled, items, livePopouts, projectMetrics, refreshItems, registerAsPopout, releasePopoutClaim, requestFileHandles, resetProjectMetrics, stats } from '~/upload'

const route = useRoute()
const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey)

const projectSlug = computed(() => route.params.projectSlug as string)
const projectName = computed(() => store.project?.name)
const isProjectViewOnly = computed(() => store.project?.isLocked === true)

// The shared queue holds EVERY project's items; this page shows only its own.
// (Legacy items with no projectSlug — pre-partitioning — show everywhere
// rather than nowhere.)
const projectItems = computed(() =>
  items.value.filter(item => item.projectSlug === undefined || item.projectSlug === projectSlug.value))
const isPopout = computed(() => route.query.popout === '1')

// -- sites + per-site boxes ---------------------------------------------------

const sites = ref<SiteResponse[]>([])

/** One upload box per site, newest FIRST. A box starts UNLINKED
 * (streamId undefined — header shows the focused site selector) and links
 * on selection. */
interface SiteBox {
  boxId: string
  streamId?: string
  siteName?: string
  siteTimezone?: string
}
const siteBoxes = ref<SiteBox[]>([])

/**
 * Timezone determination is ALWAYS automatic (operator 2026-08-18).
 *
 * The "Determine Timezone(s)" selector was removed: choosing a strategy before
 * seeing the result asked users to predict what the parser would find. The
 * cascade below is what `auto` already did —
 *   1. the filename (including the user's saved custom formats)
 *   2. the file's own metadata (GUANO / AudioMoth ICMT)
 *   3. the site's geolocation timezone
 *   4. UTC
 * — and a wrong result is now corrected where it is VISIBLE, with the bulk Zone
 * dropdown on the queue, after the user can see what was determined.
 *
 * Kept as a named constant rather than inlining `'auto'` at each call site so
 * the intent stays greppable and the analyzer's contract is unchanged.
 */
const TIMEZONE_MODE: TimezoneMode = 'auto'

/** Copy for the "i" tooltip beside the Pre-Convert WAV to FLAC checkbox.
 * Lives here rather than inline so the template stays readable; the tooltip
 * component renders it as plain text (no HTML entities). */
const FLAC_INFO_TEXT = 'When you add WAV audio files, this uploader may pre-encode the files from WAV to a lossless FLAC format prior to upload. This can reduce your upload time by as much as 50% on slower connections, but it will make use of your computer\u2019s CPU for the encoding. You can disable this feature at any time.'

// -- Site-queue collapse (PAGE-owned, lifted from staging-table 2026-08-13) --
// A Set of collapsed boxIds; absence = expanded. Page-level ownership is what
// lets the options row's expand/collapse-all control drive every box.
const showSettings = ref(false)

/**
 * The intake panel's crosshatch surface.
 *
 * WHY INLINE: this WindiCSS build compiles arbitrary COLOURS but not arbitrary
 * gradients or sizes — an arbitrary-value utility emits NO rule at all and
 * fails silently (measured in the emitted CSS while building this). An inline
 * style cannot silently vanish.
 *
 * WHY A CROSSHATCH: the drop target needs to look like a different KIND of
 * surface from the table above it — texture reads as "put things here" in a
 * way that a flat tint does not, while staying quieter than a filled panel.
 *
 * TWO states only (operator 2026-08-18, after viewing it on demo):
 *   default    0.05 alpha  — the crosshatch is simply what this area LOOKS
 *                            like; it marks the drop target at all times
 *   drag-over  muted lime  — "release here"
 *
 * The mouseover state was REMOVED. It went through three revisions and the
 * operator's verdict on seeing it live was that the hover *intensity* was the
 * right resting weight, but reacting to the pointer added nothing: this is a
 * drop target, and the pointer being over it is not the event that matters —
 * dragging a file over it is. Promoting hover's value to the default and
 * deleting the interaction makes the area read consistently and removes the
 * per-box hover tracking entirely.
 *
 * Earlier passes for the record: 0.02 rest / 0.05 hover was MEASURED as
 * rendering correctly (scanline spread 22 grey levels; live computed style
 * confirmed the alpha swap) but was far too faint against the dark theme to
 * function as an affordance. Promoting hover's 0.10 to the default then
 * OVERSHOT — operator on seeing it live: "about 2x too bright" — so the
 * default is now 0.05, which is exactly the old hover value.
 *
 * Drag-over green was toned down 0.28 -> 0.18 (operator: "a bit less bright").
 * The hue stays `frequency` so it matches the border and wash that the class
 * binding applies in the same state; a darker green (e.g. `palm` #00543B) was
 * considered and rejected — as 1px lines on a near-black panel it would lose
 * contrast rather than read as a highlight.
 *
 * 45deg + 135deg = a true crosshatch; 1px lines keep it as tooth, not stripes.
 */
const intakeStyle = (isDragOver: boolean): Record<string, string> => {
  const line = isDragOver
    ? 'rgba(173,255,44,0.18)' // frequency — the house lime, matches the border
    : 'rgba(249,246,242,0.05)' // cloud
  const hatch = (angle: string): string =>
    `repeating-linear-gradient(${angle}, ${line} 0, ${line} 1px, transparent 1px, transparent 10px)`
  return { backgroundImage: `${hatch('45deg')}, ${hatch('135deg')}` }
}

/** Opens the custom-filename-format editor (its own modal, reachable from both
 *  here and global account settings — they mirror one another). */
const showFormatEditor = ref(false)

/** The user's saved custom filename formats, loaded from their profile.
 *  Empty until the format editor lands (step 3); the settings modal already
 *  renders the empty state. */
const timestampFormats = ref<UserTimestampFormat[]>([])
const collapsedBoxIds = ref<Set<string>>(new Set())
const toggleBoxCollapsed = (boxId: string): void => {
  const next = new Set(collapsedBoxIds.value)
  if (next.has(boxId)) next.delete(boxId)
  else next.add(boxId)
  collapsedBoxIds.value = next
}
const linkedBoxCount = computed(() => siteBoxes.value.filter(b => b.streamId !== undefined).length)
const anyBoxExpanded = computed(() =>
  siteBoxes.value.some(b => b.streamId !== undefined && !collapsedBoxIds.value.has(b.boxId)))

/**
 * Is there anything to collapse or expand? (operator 2026-08-14)
 *
 * Requires at least one LINKED section. An unlinked box — one whose site has
 * not been chosen yet — renders no collapsible body, so counting it would make
 * the control flicker between enabled and disabled as the user picks sites.
 *
 * Threshold differs deliberately from the caret control on the options row,
 * which requires >= 2: that caret is an in-context shortcut and is pointless
 * for a single section, whereas the metrics-row panel holds a FIXED slot in the
 * grid and must explain its state rather than vanish (a disappearing panel
 * would leave a hole in the row). One section is genuinely collapsible, so >= 1
 * is the honest enabled condition for the panel.
 */
const canToggleBoxes = computed(() => linkedBoxCount.value >= 1)
const toggleAllBoxes = (): void => {
  if (anyBoxExpanded.value) {
    // collapse everything that is linked
    collapsedBoxIds.value = new Set(siteBoxes.value.filter(b => b.streamId !== undefined).map(b => b.boxId))
  } else {
    collapsedBoxIds.value = new Set()
  }
}

const hasUnlinkedBox = computed(() => siteBoxes.value.some(box => box.streamId === undefined))

/** Options for a box's site selector — already-boxed sites grayed out. */
const siteOptions = computed(() =>
  sites.value.map(site => ({
    id: site.external_id,
    name: site.name,
    taken: siteBoxes.value.some(box => box.streamId === site.external_id)
  })))

const siteById = (streamId: string): SiteResponse | undefined =>
  sites.value.find(site => site.external_id === streamId)

// -- create a site from the picker -------------------------------------------

/** Which box asked for the create modal (undefined = modal closed). */
const creatingSiteForBoxId = ref<string | undefined>(undefined)

const onRequestCreateSite = (boxId: string, _typedName: string): void => {
  creatingSiteForBoxId.value = boxId
}

/**
 * A site was created — reload the list and link the requesting box to it.
 *
 * ⚠️ WHY WE MATCH BY NAME. The legacy create endpoint does NOT return the new
 * site's `external_id` (the inline sites-page form emits `id: null` after a
 * create for exactly this reason), and `external_id` is precisely what a box
 * needs in order to link. So we re-fetch the project's sites and find the one
 * we just made.
 *
 * Name is the only stable handle we have, and it is a sound one here: the
 * legacy API rejects duplicate site names within a project, so a successful
 * create guarantees the name is unique in this list. We still guard for the
 * miss (a rename race, or an unexpected server response) by leaving the box
 * unlinked rather than linking it to the WRONG site — the picker simply stays
 * open with the new site now present in it.
 */
const onSiteCreated = async (saved: SiteSaved): Promise<void> => {
  const boxId = creatingSiteForBoxId.value
  creatingSiteForBoxId.value = undefined
  await loadSites()
  const created = sites.value.find(site => site.name === saved.name)
  if (boxId === undefined || created === undefined) return
  linkBoxToSite(boxId, created.external_id)
}

/** Site facts for a section's title line: how many recordings the site already
 * holds and the datetime range they span. Both come from the sites API's count
 * aggregate (requires count: true — see loadSites). */
const siteInfoFor = (streamId: string): { recCount: number, firstRecordingAt?: string, lastRecordingAt?: string } | undefined => {
  const site = siteById(streamId)
  if (site === undefined) return undefined
  return {
    recCount: site.rec_count ?? 0,
    firstRecordingAt: typeof site.first_recording_at === 'string' ? site.first_recording_at : undefined,
    lastRecordingAt: typeof site.last_recording_at === 'string' ? site.last_recording_at : undefined
  }
}

/**
 * Apply a bulk zone correction to every row in one status group of one site.
 *
 * SEMANTIC: the wall clock is held CONSTANT and the UTC instant is re-derived.
 * The user is not saying "this recording happened at a different time" — they
 * are saying "the clock that produced 14:30 was in a different zone", which is
 * what moves the absolute instant. Relabelling the Zone column without moving
 * `timestampUtc` would leave the row uploading at the wrong moment while
 * LOOKING correct, which is the exact failure this control exists to prevent.
 *
 * Marked `timezoneSource: 'manual'` because it IS the user's explicit decision.
 */
const applyGroupZone = async (change: { ids: string[], offsetMinutes: number }): Promise<void> => {
  const zoneName = formatUtcOffsetLabel(change.offsetMinutes) === 'UTC'
    ? 'UTC'
    : formatOffsetIso(change.offsetMinutes)
  for (const id of change.ids) {
    const item = items.value.find(row => row.id === id)
    if (item?.localWallTime === undefined) continue // nothing to re-anchor
    const timestampUtc = retimestampToOffset(item.localWallTime, change.offsetMinutes)
    if (timestampUtc === undefined) continue
    await engine.updateStaged(id, {
      timestampUtc,
      timezoneName: zoneName,
      timezoneSource: 'manual'
    })
  }
  await refreshItems()
}

/** `+HH:MM` / `-HH:MM` — the fixed-offset form `zoneCol` already understands. */
const formatOffsetIso = (offsetMinutes: number): string => {
  const sign = offsetMinutes < 0 ? '-' : '+'
  const abs = Math.abs(offsetMinutes)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `${sign}${hh}:${mm}`
}

/** Apply a hand-corrected date/time to a staged row. timezoneSource 'manual'
 * marks it as the user's decision. */
const applyDatetimeEdit = async (edit: { id: string, localWallTime: string, timestampUtc: string, timezoneName: string }): Promise<void> => {
  await engine.updateStaged(edit.id, {
    localWallTime: edit.localWallTime,
    timestampUtc: edit.timestampUtc,
    timezoneName: edit.timezoneName,
    timezoneSource: 'manual',
    analysisError: undefined
  })
  await refreshItems()
}

const addUnlinkedBox = (): void => {
  if (hasUnlinkedBox.value) return // one pending box at a time
  // APPEND, don't prepend (operator 2026-08-14). A new section is created by a
  // button at the BOTTOM of the stack, so putting the section at the top made
  // it appear away from where the user clicked — and pushed the existing
  // sections down. It now lands last, directly above that button.
  //
  // Collapsing the others is part of the same intent: with several sites open,
  // a new empty section appended to the bottom could be off-screen entirely.
  // Collapsing everything else brings it into view and makes it the obvious
  // focus, without destroying any state (collapse is display-only).
  const boxId = `box-${Date.now().toString(36)}`
  collapsedBoxIds.value = new Set(
    siteBoxes.value.filter(b => b.streamId !== undefined).map(b => b.boxId)
  )
  siteBoxes.value = [...siteBoxes.value, { boxId }]
  // the box's own onMounted autofocuses its selector
}

const linkBoxToSite = (boxId: string, streamId: string): void => {
  const site = siteById(streamId)
  if (site === undefined) return
  if (siteBoxes.value.some(box => box.streamId === streamId)) return // taken guard
  siteBoxes.value = siteBoxes.value.map(box =>
    box.boxId === boxId
      ? {
          ...box,
          streamId: site.external_id,
          siteName: site.name,
          siteTimezone: site.timezone !== undefined && site.timezone !== '' ? site.timezone : undefined
        }
      : box)
}

const removeSiteBox = (boxId: string): void => {
  siteBoxes.value = siteBoxes.value.filter(box => box.boxId !== boxId)
}

const itemsForBox = (streamId: string): UploadItem[] =>
  projectItems.value.filter(item => item.streamId === streamId)

const loadSites = async (): Promise<void> => {
  if (apiClientArbimon === undefined || projectSlug.value === undefined) return
  // count: true is REQUIRED for rec_count / first_recording_at /
  // last_recording_at — without it the server skips the aggregate entirely and
  // every site reports 0 existing recordings (which is what the header showed
  // before 2026-08-13).
  const response = await apiArbimonGetSites(apiClientArbimon, projectSlug.value, { count: true })
  sites.value = (response ?? []).filter(site => site.external_id !== null && site.external_id !== '')
}

/** Boxes must exist for any site that already has queue items (restored
 * session / other-window activity) — else those rows would be invisible. */
const materializeBoxesFromQueue = (): void => {
  const known = new Set(siteBoxes.value.map(box => box.streamId).filter(id => id !== undefined))
  const additions: SiteBox[] = []
  for (const item of projectItems.value) {
    if (known.has(item.streamId)) continue
    known.add(item.streamId)
    const site = siteById(item.streamId)
    additions.push({
      boxId: `box-${item.streamId}`,
      streamId: item.streamId,
      siteName: item.siteName ?? site?.name ?? item.streamId,
      siteTimezone: site?.timezone !== undefined && site?.timezone !== '' ? site?.timezone : undefined
    })
  }
  if (additions.length > 0) siteBoxes.value = [...siteBoxes.value, ...additions]
}

watch(projectItems, materializeBoxesFromQueue)

// -- metrics binding ----------------------------------------------------------

const metrics = projectMetrics

onMounted(async () => {
  await loadSites()
  bindProjectMetrics(projectSlug.value, store.user?.sub)
  await refreshItems()
  materializeBoxesFromQueue()
})

// -- staged intake (per-box) --------------------------------------------------

/** which box is currently drag-hovered (depth-counted per box) */
const dragBoxId = ref<string | undefined>(undefined)
let dragDepth = 0
const fileInput = ref<HTMLInputElement>()
const folderInput = ref<HTMLInputElement>()
/** the box whose choose-files button opened the picker */
let pickTargetStreamId: string | undefined

const boxDragEnter = (streamId: string): void => {
  if (dragBoxId.value !== streamId) dragDepth = 0
  dragBoxId.value = streamId
  dragDepth++
}

const boxDragLeave = (streamId: string): void => {
  if (dragBoxId.value !== streamId) return
  dragDepth--
  if (dragDepth <= 0) {
    dragDepth = 0
    dragBoxId.value = undefined
  }
}

const enqueueFiles = async (streamId: string, files: Array<{ file: File, relativePath: string }>): Promise<void> => {
  const site = siteById(streamId)
  if (site === undefined) return
  const siteTz = site.timezone !== undefined && site.timezone !== '' ? site.timezone : undefined
  const boxMode = TIMEZONE_MODE
  const accepted = files.filter(({ file }) => isSupportedAudioFile(file.name))
  const pairs = accepted.map(({ file, relativePath }) => {
    const item = createUploadItem({
      filename: file.name,
      relativePath,
      fileSizeBytes: file.size,
      streamId,
      projectSlug: projectSlug.value,
      initialState: 'analyzing'
    })
    fileSource.register(item.id, file)
    return { item, file }
  })
  // Stage first (rows appear immediately as "Analyzing…"), then analyze.
  await engine.stage(pairs.map(pair => pair.item))
  await refreshItems()
  track('web_upload_batch_staged', {
    fileCount: pairs.length,
    totalBytes: pairs.reduce((sum, { item }) => sum + item.fileSizeBytes, 0),
    projectSlug: projectSlug.value,
    timezoneMode: boxMode,
    surface: currentSurface()
  })
  // Analyze with small concurrency — header reads are cheap but many files
  // shouldn't hammer the disk at once. Context is PER-BOX: this box's own
  // timezone method + its site's timezone.
  const context = {
    mode: boxMode,
    siteTimezone: siteTz,
    siteName: site.name
  }
  const CONCURRENCY = 4
  let index = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, pairs.length) }, async () => {
    while (index < pairs.length) {
      const mine = pairs[index++]
      const { patch } = await analyzeFile(mine.item, mine.file, context)
      await engine.updateStaged(mine.item.id, patch)
    }
  })
  await Promise.all(workers)
  await refreshItems()
  // Two background advisories, fire-and-forget (failures leave items on the
  // normal Start path):
  // 1. prestage (non-WAV): sha1 + signed URL while parked — signing IS the
  //    dedup check, so those rows resolve NOW and Start fast-tracks them.
  void engine.prestage(pairs.map(pair => pair.item.id)).then(async () => { await refreshItems() })
  // 2. existence check (ALL files incl. WAVs): a recording already at this
  //    (site, timestamp) means the server WILL reject the upload — surface
  //    that verdict at staging time instead of after Start.
  //
  //    Verified against Core 2026-08-13 (core/internal/ingest/get.js + its
  //    own int tests): the stream-source-file lookup is keyed on sha1 AND
  //    start. A match returns the file (→ 'Duplicate.'); a MISS with a
  //    segment already at that instant returns 403 'There is another file
  //    with the same timestamp' (→ 'Invalid.'). So a timestamp collision is
  //    rejected EITHER WAY — knowing only (site, timestamp) is enough to
  //    predict rejection; we just cannot name which of the two it will be.
  //    (An earlier version of this comment claimed a different checksum
  //    yields 'Invalid.' via the same lookup; it actually never matches the
  //    lookup at all and is caught by the 403 branch.)
  //
  //    The one exception is availability === 0 (the existing file was
  //    deleted), where the server ALLOWS a re-ingest. That is precisely why
  //    duplicate rows keep a ↻ Retry override rather than being terminal.
  void checkExistingRecordings(pairs.map(pair => pair.item.id))
}

const checkExistingRecordings = async (ids: string[]): Promise<void> => {
  if (apiClientArbimon === undefined) return
  const CONCURRENCY = 4
  let index = 0
  let flagged = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, ids.length) }, async () => {
    while (index < ids.length) {
      const id = ids[index++]
      const item = items.value.find(i => i.id === id)
      if (item === undefined || item.state !== 'staged' || item.timestampUtc === undefined) continue
      try {
        // EXACT match: the nearest-at-or-before variant matches the site's
        // newest recording for ANY later timestamp, so it flagged every
        // genuinely-new file as a duplicate (fixed 2026-08-13).
        const recordingId = await apiArbimonFindRecordingAtExactTime(
          apiClientArbimon, projectSlug.value, item.streamId, item.timestampUtc)
        if (recordingId !== undefined) {
          const ok = await engine.markDuplicateIfStaged(id, 'This site already has a recording at this date and time — use ↻ Retry to upload anyway')
          if (ok) flagged++
        }
      } catch { /* advisory only — the sign-time check remains authoritative */ }
    }
  })
  await Promise.all(workers)
  if (flagged > 0) await refreshItems()
}

const boxDrop = async (streamId: string, event: DragEvent): Promise<void> => {
  dragDepth = 0
  dragBoxId.value = undefined
  if (event.dataTransfer === null) return
  await enqueueFiles(streamId, await collectDroppedFiles(event.dataTransfer))
}

const pickFilesFor = (streamId: string): void => {
  pickTargetStreamId = streamId
  fileInput.value?.click()
}

/** Open the FOLDER picker for a box (operator 2026-08-14). */
const pickFolderFor = (streamId: string): void => {
  pickTargetStreamId = streamId
  folderInput.value?.click()
}

const onPick = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  if (input.files === null || pickTargetStreamId === undefined) return
  await enqueueFiles(pickTargetStreamId, Array.from(input.files).map(file => ({ file, relativePath: file.name })))
  input.value = ''
  pickTargetStreamId = undefined
}

/**
 * Folder pick — the picker equivalent of dropping a folder.
 *
 * `webkitdirectory` yields a FLAT FileList of the whole subtree, with each File
 * carrying `webkitRelativePath` ("folder/sub/REC.wav"). Passing that through as
 * relativePath is what makes a PICKED folder produce identical rows to the same
 * folder DROPPED — `collectDroppedFiles` builds the same shape by walking
 * FileSystemEntry. Falling back to `file.name` covers the (non-standard) case
 * of an empty webkitRelativePath.
 *
 * No extension filtering here on purpose: `enqueueFiles` already applies
 * `isSupportedAudioFile` to every intake path, so a folder containing notes,
 * images or a stray .DS_Store contributes only its real recordings — and it
 * stays ONE rule rather than two that could drift.
 */
const onPickFolder = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  if (input.files === null || pickTargetStreamId === undefined) return
  await enqueueFiles(
    pickTargetStreamId,
    Array.from(input.files).map(file => ({
      file,
      relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name
    }))
  )
  input.value = ''
  pickTargetStreamId = undefined
}

// -- global Start / Pause -----------------------------------------------------

const activePipeline = computed(() =>
  projectItems.value.filter(item =>
    ['queued', 'preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded'].includes(item.state)).length)

const startableCount = computed(() =>
  projectItems.value.filter(item => item.state === 'staged' && item.analysisError === undefined).length)

/** 'pause' while work is flowing, 'start' when there is something to start,
 *  'inert' when nothing is actionable (all visible rows settled). */
const buttonMode = computed(() => {
  if (engineRunning.value && activePipeline.value > 0) return 'pause'
  if (startableCount.value > 0 || activePipeline.value > 0) return 'start'
  return 'inert'
})

const startPauseLabel = computed(() => {
  if (buttonMode.value === 'pause') return 'Pause'
  if (startableCount.value > 0) return `Start (${startableCount.value})`
  if (activePipeline.value > 0) return 'Resume'
  return 'Idle'
})

const startPauseDisabled = computed(() => buttonMode.value === 'inert')

/**
 * Start/Pause colours (operator 2026-08-14: the non-idle states were not
 * readable).
 *
 * MEASURED in the live browser with Playwright hover(), reading COMPUTED
 * styles — not inferred from class names, and not simulated by re-applying
 * utility classes (a shortcut's baked-in hover rule cannot be reproduced that
 * way; my first attempt did exactly that and reported a false 1.08:1 for the
 * hover state).
 *
 * What the OLD `btn-secondary` Pause actually measured:
 *   rest : frequency on TRANSPARENT over moss   13.91:1
 *   hover: pitch on chirp                       17.82:1
 *
 * So the numbers pass WCAG — the real problem is that Pause was an OUTLINE
 * button (transparent fill, green text) sitting beside a SOLID green Start.
 * Against the dark page it reads as low-emphasis/disabled rather than as the
 * active control, and it changes its entire treatment on hover (outline →
 * solid), which is why it felt unreadable and unusable in practice. Contrast
 * ratio alone does not capture "looks switched off".
 *
 * Fix, inside the house palette: Pause is now a FILLED chirp button with pitch
 * text (17.82:1) hovering to frequency (16.57:1) — the same dark-on-bright
 * treatment Start already uses, so the two read as ONE control changing state
 * rather than two unrelated buttons, while chirp vs frequency keeps them
 * distinguishable at a glance. Both states now stay solid on hover.
 */
const startPauseClass = computed(() => {
  if (buttonMode.value === 'inert') return 'border border-cloud/20 bg-moss/20 text-cloud/50 cursor-default'
  if (buttonMode.value === 'pause') return 'bg-chirp text-pitch hover:bg-frequency focus:ring-4 focus:ring-chirp'
  return 'bg-frequency text-pitch hover:bg-chirp focus:ring-4 focus:ring-chirp'
})

/**
 * Reset the cumulative metrics (operator 2026-08-14). Confirms first: the
 * counters are PERSISTED per project in localStorage, so a mis-click would
 * discard a running session's totals with no way to recover them.
 *
 * Scope is the counters only — the upload queue and every section are
 * untouched, so "Queued" (derived live from the engine's queue) keeps its
 * value. That asymmetry is intentional and is spelled out in the confirm text.
 */
const onResetMetrics = (): void => {
  const confirmed = window.confirm(
    'Reset the Imported, Errors, Skipped and Uploaded totals for this project?\n\n' +
    'Your recordings and the upload queue are not affected.'
  )
  if (!confirmed) return
  resetProjectMetrics()
  // `projectSlug` (not `project`): every other web_upload_* event uses that
  // key, and PostHog property names are per-event, so a stray alias would
  // silently fragment any cross-event breakdown. Verified against ClickHouse:
  // `project` has never actually been emitted, so normalising costs no history.
  track('web_upload_metrics_reset', { projectSlug: projectSlug.value, surface: currentSurface() })
}

const onStartPause = async (): Promise<void> => {
  if (engineRunning.value && activePipeline.value > 0) {
    await engine.pause()
    return
  }
  if (startableCount.value > 0) {
    await engine.startStaged(
      projectItems.value
        .filter(item => item.state === 'staged' && item.analysisError === undefined)
        .map(item => item.id)
    )
  }
  engine.start()
  await refreshItems()
}

// -- table actions ------------------------------------------------------------

const clearCompleted = async (streamId: string): Promise<void> => {
  for (const item of itemsForBox(streamId).filter(i => i.state === 'ingested' || i.state === 'duplicate')) {
    await engine.remove(item.id)
  }
  await refreshItems()
}

/**
 * Start uploading an explicit set of ids (one site's queued rows).
 *
 * Deliberately id-scoped rather than "start everything startable": the button
 * lives in ONE site's queue header, so it must upload exactly the rows the
 * user can see under it. Re-deriving the set here would quietly widen it to
 * every site on the page.
 *
 * `engine.start()` after staging is required — startStaged only marks rows
 * eligible; start() is what runs the pipeline (same order as onStartPause).
 */
const startGroup = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return
  await engine.startStaged(ids)
  engine.start()
  await refreshItems()
}

/**
 * Pause from a site's group header.
 *
 * ⚠️ The engine's run loop is GLOBAL, not per-site — there is no
 * "pause only this site" primitive, so this pauses everything, exactly as the
 * metrics-bar button does. The button is only shown on a site that HAS rows in
 * flight, so the action is never offered where it would look like a no-op, but
 * a user with two sites uploading will pause both. Making it per-site would
 * mean per-stream scheduling in the engine, which is a much larger change.
 */
const pauseGroup = async (): Promise<void> => {
  await engine.pause()
  await refreshItems()
}

const retryFailed = async (streamId: string): Promise<void> => {
  for (const item of itemsForBox(streamId).filter(i => ['failed', 'rejected', 'cancelled'].includes(i.state))) {
    await engine.retry(item.id)
  }
  engine.start()
  await refreshItems()
}

const clearSelected = async (ids: string[]): Promise<void> => {
  for (const id of ids) await engine.remove(id)
  await refreshItems()
}

const retryItem = async (id: string): Promise<void> => { await engine.retry(id); engine.start(); await refreshItems() }
const clearItem = async (id: string): Promise<void> => { await engine.remove(id); await refreshItems() }

// -- destination (Visualizer) -------------------------------------------------

const openingVisualizerId = ref<string | undefined>(undefined)

const openInVisualizer = async (item: UploadItem): Promise<void> => {
  if (apiClientArbimon === undefined || item.timestampUtc === undefined) return
  openingVisualizerId.value = item.id
  try {
    const recordingId = await apiArbimonResolveRecordingId(apiClientArbimon, projectSlug.value, item.streamId, item.timestampUtc)
    if (recordingId === undefined) {
      window.alert('This recording is not queryable yet — give it a moment and try again.')
      return
    }
    window.open(`${window.location.origin}/project/${projectSlug.value}/visualizer/rec/${recordingId}`, '_blank', 'noopener')
  } catch {
    window.alert('Could not open the recording in the Visualizer. Please try again.')
  } finally {
    openingVisualizerId.value = undefined
  }
}

// -- pop-out window (per-project; coordination lives in ~/upload) -------------
// Each project can have its OWN pop-out: unique window name per slug, and the
// singleton's scope machinery partitions the queue — a pop-out drives only its
// project's items while other tabs drive the rest. No wholesale pause.
//
// A STANDALONE WINDOW, and OPT-IN ONLY (operator 2026-08-14, final shape):
// the uploader's DEFAULT is inline in the SPA — this page renders the full
// uploader in place, and nothing opens automatically. The pop-out is offered as
// a button for users who want the uploader parked beside their other work.
//
// The features string is what asks the browser for a window rather than a tab.
// The stable per-project NAME is what makes a second call re-use / re-focus the
// existing window instead of spawning another.

const popoutActive = computed(() => livePopouts.value.has(projectSlug.value))

/**
 * Window title for the pop-out (operator 2026-08-14).
 *
 * Requirements it has to satisfy:
 *  - not confusable with ordinary SPA pages (which are titled “Arbimon”), and
 *  - not confusable with a pop-out for a DIFFERENT project, since a user may
 *    legitimately run several at once (the engine partitions the queue by
 *    project, so this is a supported state, not an edge case).
 *
 * Hence: role first, then the project name, then the product — a taskbar/dock
 * entry truncates the END, so the distinguishing part has to come first. The
 * project NAME is used rather than the slug — it is what the user recognises.
 * Falls back to the slug before the name has loaded.
 */
const popoutWindowTitle = computed(() =>
  `Uploading — ${projectName.value ?? projectSlug.value} — Arbimon`)

/**
 * How long the button stays optimistically disabled after a launch before
 * falling back to the heartbeat alone. Comfortably longer than the pop-out's
 * beat interval (2s) so a healthy window is always covered, but short enough
 * that a window which never actually started leaves the button dead only
 * briefly.
 */
const POPOUT_LAUNCH_GRACE_MS = 6000

/**
 * Set when `window.open` returned null — i.e. the browser blocked the popup.
 * The page then shows an advisory notice ALONGSIDE the working inline uploader,
 * so the button is never silently dead. Without this, a blocked open and
 * "nothing happened" are indistinguishable to the user.
 *
 * This matters MORE for a window than it did for a tab: popup blockers target
 * exactly this shape. It is only ever set from the explicit button press (see
 * popOut) — a user gesture is the case browsers are most permissive about, but
 * "most permissive" is not "never blocked".
 */
const popoutBlocked = ref(false)

/* `focusPopout` REMOVED (operator 2026-08-18) along with its button: because
 * this SPA page does not retain the original window HANDLE across navigations,
 * "re-focus" had to go through `window.open(url, name)` — which RE-NAVIGATES
 * (force-reloads) the live pop-out, disrupting the uploads in it. The
 * placeholder is now informational only and names the window title instead. */

/**
 * NOTE the third argument. Supplying a features string is precisely what asks
 * the browser for a STANDALONE WINDOW; omitting it yields an ordinary tab. That
 * one argument is the whole window-vs-tab switch. The stable per-project NAME
 * is retained either way, so re-use/re-focus behaviour is unchanged.
 */
const openPopoutWindow = (): Window | null => {
  const url = `${window.location.origin}/p/${projectSlug.value}/import-recordings?popout=1`
  return window.open(url, `arbimon-uploader-${projectSlug.value}`, 'popup=yes,width=1280,height=860')
}

/**
 * Has THIS page just launched a pop-out that has not yet started heartbeating?
 *
 * Bridges a real gap: `popoutActive` is driven by the pop-out's heartbeat over
 * a BroadcastChannel, and the new window has to boot, mount and post its first
 * beat before that flips — up to ~POPOUT_BEAT_MS. Without this the button would
 * stay live for a beat or two after being pressed, which is exactly long enough
 * for an impatient second click. Cleared as soon as the heartbeat takes over.
 */
const popoutJustLaunched = ref(false)

/**
 * Whether the launch button should be INERT (operator 2026-08-14).
 *
 * True while this project's uploader is open in its own window — pressing it
 * again cannot create a second uploader (`window.open` re-uses the name), so a
 * live button would promise an action that does not exist. The “Go to the
 * uploader window” button in the placeholder below is the affordance for
 * reaching it.
 *
 * ⚠️ DELIBERATELY NOT A ONE-WAY LATCH. Deriving this from the live heartbeat
 * means CLOSING the pop-out re-enables the button within POPOUT_STALE_MS. A
 * plain `hasLaunched = true` would look identical in the happy path and then
 * strand the user with a permanently dead button after they closed the window —
 * the same shape as the §121 stranded-claim defect, in the UI instead of the
 * queue.
 */
const popoutLaunched = computed(() => popoutActive.value || popoutJustLaunched.value)

// Hand over from the optimistic flag to the authoritative heartbeat exactly
// when the heartbeat arrives — and also give up if none ever does (a window
// that was closed instantly, or never really opened), so the button cannot
// stick disabled on the strength of a launch that did not take.
watch(popoutActive, (active) => {
  if (active) popoutJustLaunched.value = false
})

/**
 * Explicit “Pop-Out in New Window”. Only a USER GESTURE ever opens the pop-out —
 * see the onMounted note on why the automatic launch was removed.
 */
const popOut = (): void => {
  const handle = openPopoutWindow()
  if (handle === null) {
    popoutBlocked.value = true
    track('web_upload_popout_blocked', { projectSlug: projectSlug.value, surface: currentSurface() })
    return
  }
  // A previously blocked attempt that later succeeds must clear the notice,
  // otherwise the page keeps telling the user they are blocked while the
  // pop-out window is demonstrably open.
  popoutBlocked.value = false
  // Disable immediately rather than waiting for the first heartbeat (see
  // popoutJustLaunched), with a bounded fallback so a launch that never
  // heartbeats cannot leave the button dead forever.
  popoutJustLaunched.value = true
  window.setTimeout(() => { popoutJustLaunched.value = false }, POPOUT_LAUNCH_GRACE_MS)
}

onMounted(() => {
  if (isPopout.value) {
    registerAsPopout(projectSlug.value)
    requestFileHandles(projectSlug.value)
  }
  // NO AUTO-LAUNCH (operator 2026-08-14, superseding uploader-tab-first).
  //
  // Clicking Import used to open the uploader tab automatically and leave this
  // page as a launcher. Reverted: the uploader must work IN PLACE, inside the
  // SPA, and the separate tab is now strictly opt-in via “Open in New Tab”.
  //
  // Why the automatic version was worse than the problem it solved:
  //  - it spent the user’s ONE navigation on a tab they did not ask for, and
  //    the page they DID ask for showed them a placeholder instead;
  //  - a script-opened tab with no user gesture is the case browsers block
  //    most readily, so the fallback path was also the likeliest path — and
  //    that fallback was itself broken (see the template note on the blocked
  //    notice, which suppressed the very uploader it claimed to fall back to);
  //  - `autoLaunchTried` was a `ref` in component scope, so it reset on every
  //    remount. It never limited anything across SPA navigation, which is
  //    exactly where “once per visit” was supposed to apply.
  //
  // Nothing here replaces it: the inline uploader is the default, and this
  // page renders it directly. The per-project claim, scope partitioning and
  // heartbeat all continue to work — they key off ?popout=1, not off who
  // opened the tab.
})

/**
 * Release the per-tab uploader claim when this page goes away.
 *
 * NEW REQUIREMENT UNDER THE TAB MODEL. A chromeless popup window had no
 * navigation, so the claim could only end by closing the document. A TAB sits
 * inside the full app, so the user can navigate to any other page — and the
 * claim, which lives in the upload SINGLETON rather than in this component,
 * would otherwise outlive the page: this tab would stay scoped to one project
 * (driving nothing else) while every other tab kept excluding that project on
 * the strength of a heartbeat nobody is listening to any more. Stalled queue,
 * no visible cause.
 *
 * Closing the tab still works as before — the document dies and the heartbeat
 * simply stops.
 */
onUnmounted(() => {
  if (isPopout.value) releasePopoutClaim()
})

// Title the uploader tab (operator 2026-08-14). Set reactively rather than
// once on mount: `projectName` arrives from the store asynchronously, so a
// mount-time write would leave the slug showing. Only the UPLOADER TAB is
// retitled — the original tab keeps the app's normal title.
watchEffect(() => {
  if (!isPopout.value) return
  document.title = popoutWindowTitle.value
})

// -- display helpers ----------------------------------------------------------

/**
 * GLOBAL queued count (operator 2026-08-14) — recordings still waiting to be
 * uploaded, across EVERY project.
 *
 * Global on purpose: the upload engine is ONE queue shared by all projects, so
 * a project-scoped figure would under-report the work actually outstanding. It
 * is the only panel here that is not project-scoped, which is why the box
 * carries a tooltip saying so.
 *
 * The state set mirrors `statusGroupOf`'s default branch in staging-table.vue
 * EXACTLY. The `stats.queued` field alone would be a strictly smaller number
 * than the table's own "Queued" section, and two things labelled "Queued"
 * disagreeing on screen is worse than either number being imperfect.
 */
const globalQueued = computed(() =>
  stats.value.analyzing + stats.value.staged + stats.value.queued +
  stats.value.preparing + stats.value.ready + stats.value.paused)

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const formatRate = (bps: number): string => {
  if (bps <= 0) return '—'
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
}
</script>

<style scoped>
/**
 * EMPTY-STATE ATTENTION GLOW for the "Click to Add Recordings to a Site"
 * button (operator 2026-08-18) — active only while NO site sections exist.
 *
 * Same mechanism as the unlinked site picker's `site-picker-ping`
 * (site-combobox.vue, §147), deliberately TONED DOWN: this is an invitation
 * ("start here"), not the picker's "finish what you started" state, so the
 * ring peaks fainter (0.30 vs 0.55), spreads less (8px vs 10px) and cycles
 * slower (2.6s vs 1.8s).
 *
 * A LOCAL keyframe, not an `animate-*` utility: this WindiCSS config
 * registers only a `wave` animation, so `animate-pulse` and friends emit NO
 * CSS at all (§147's silent-variant trap). Animates BOX-SHADOW only — a
 * pulsing ring must not reflow the page, and box-shadow is
 * compositor-friendly. No `!important` needed here (unlike the picker input):
 * no forms-plugin attribute selector competes on a <button>.
 */
@keyframes add-site-ping {
  0%   { box-shadow: 0 0 0 0 rgba(173, 255, 44, 0.30); }
  70%  { box-shadow: 0 0 0 8px rgba(173, 255, 44, 0); }
  100% { box-shadow: 0 0 0 0 rgba(173, 255, 44, 0); }
}

.add-site-attention {
  animation: add-site-ping 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Reduced motion: drop the movement, keep the accent border + tinted field
   cues from the class bindings so the emphasis survives. */
@media (prefers-reduced-motion: reduce) {
  .add-site-attention {
    animation: none;
  }
}
</style>
