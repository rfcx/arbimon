<template>
  <!-- FULL BORDER on all four edges (operator 2026-08-14, exploratory — see
       how it looks). Each section now reads as a discrete CARD rather than
       being separated by a single rule.

       ⚠️ THE LEFT PADDING IS LOAD-BEARING, not decoration. The collapse caret
       hangs OUT of the content column by -ml-7 (-28px) so it sits in the page's
       own gutter and does not shrink the queue's usable width (operator
       2026-08-13). With no left border that overhang was free; with one, a box
       drawn at the content edge would slice straight through the caret and
       leave it stranded outside its own card. `pl-7` restores exactly the 28px
       the caret borrows, so the border clears it.

       px-4/pb-5 give the card interior breathing room — content flush against a
       visible edge reads as a rendering fault. rounded-lg matches the table and
       metric panels; without it the card looks like a different design system
       to the boxes directly above it. -->
  <div class="mt-6 pt-5 pb-5 pl-7 pr-4 border border-cloud/20 rounded-lg">
    <!-- Single header line: collapse-caret + site identity + timezone LEFT,
         all action buttons RIGHT — one horizontal row above the table. -->
    <!-- Two ROWS, not one wrapping row: the selection-actions cluster is ~590px
         wide, so on a narrow-ish viewport it used to push the header to wrap
         and the section grew 36px -> 73px every time a row was selected.
         Giving the actions their own reserved row (min-h) makes the geometry
         identical selected or not. -->
    <div class="flex flex-col gap-y-2">
      <div class="flex items-center justify-between gap-x-4 flex-wrap gap-y-2">
        <!-- The whole title+metadata area toggles collapse on click (operator
           2026-08-13) — same function as the caret. Guarded: clicks on/inside
           any BUTTON (the caret itself, future controls) are ignored so
           nothing double-fires; the unlinked state (site selector) does not
           get the handler at all. cursor-pointer only when linked. -->
        <div
          class="flex items-center gap-x-4 flex-wrap gap-y-2"
          :class="siteName !== undefined ? 'cursor-pointer select-none' : ''"
          @click="onTitleAreaClick"
        >
          <template v-if="siteName === undefined">
            <!-- UNMISSABLE UNLINKED STATE (operator 2026-08-14). A new section
                 is useless until a site is chosen, so this is the one moment
                 the page must point at itself.

                 Emphasis is deliberately stacked from FOUR independent cues, so
                 it survives a colour-blind user, a dimmed screen, or a user who
                 has scrolled the selector into peripheral vision:
                   1. a pulsing ring (animation — motion catches the eye first);
                   2. a solid 2px frequency border + tinted field (colour);
                   3. a ← caption naming the required action (language);
                   4. autofocus (see onMounted) — keyboard users land ON it.

                 The keyframes are defined in this component's <style> block
                 rather than as a `animate-*` utility: this WindiCSS config has
                 only a `wave` animation registered, so `animate-pulse` and
                 friends generate NOTHING (verified against the emitted CSS —
                 the same silent-variant trap as §133/§134/§146). A local
                 keyframe cannot fail that way.

                 `motion-reduce:animate-none` is NOT used for the same reason;
                 the media query is inlined in the style block instead, so the
                 animation genuinely stops for users who ask for reduced motion
                 while the colour + text cues remain. -->
            <!-- COMBOBOX, not a native <select> (operator 2026-08-14). The
                 "Create a Site" affordance has to live WITH the picker, and a
                 pseudo-<option> inside a native select blurs selection with
                 action — arrow-keying onto it can fire `change`, opening a
                 modal while the user is only browsing. The combobox also adds
                 type-ahead, which the long tail of site counts warrants.

                 The attention treatment (§147) moves ONTO the combobox input
                 via `input-class`, so the pulsing ring, accent border and
                 tinted field survive the swap.

                 THE ← CAPTION WAS DROPPED (operator 2026-08-14). §147 stacked
                 four cues; the remaining three — the pulsing ring (motion), the
                 accent border + tinted field (colour) and autofocus (keyboard)
                 — already make this control impossible to miss, and the
                 combobox's own placeholder ("Search sites, or create a new
                 one…") now carries the instruction the caption used to. The
                 caption was saying a second time what the field itself says.

                 The wrapping flex column went with it: one child does not need
                 a layout wrapper. -->
            <site-combobox
              ref="sitePicker"
              :options="siteOptions ?? []"
              :input-id="`site-combobox-${boxKey}`"
              input-class="site-picker-attention w-full rounded-md border-2 border-frequency bg-frequency/10 text-insight px-3 py-2 min-w-72 text-sm font-medium focus:(outline-none ring-2 ring-frequency)"
              @select="$emit('siteChosen', $event)"
              @create="$emit('createSite', $event)"
            />
          </template>
          <template v-else>
            <!-- Collapse caret: the app's STANDARD chevron (custom-icons
               'angle-down', same glyph as dropdowns elsewhere). Points DOWN
               when expanded, ROTATES to point RIGHT when collapsed. It hangs
               into the page gutter (-ml-7 w-7, no compensating padding on the
               section) so the site name + queue box stay flush with the
               common left edge of all page sections. -->
            <button
              class="-ml-7 w-7 -mr-4 shrink-0 inline-flex items-center justify-center text-insight hover:text-frequency"
              :title="collapsed ? 'Expand this section' : 'Collapse this section'"
              :aria-expanded="!collapsed"
              @click="$emit('toggleCollapsed')"
            >
              <!-- WindiCSS: rotate utilities are inert without the explicit `transform`
                 class (cf. every in-app usage: 'transform rotate-180'). -->
              <icon-custom-angle-down
                class="w-5 h-5 transform transition-transform duration-200"
                :class="collapsed ? '-rotate-90' : ''"
              />
            </button>
            <!-- Site title + metadata: ONE baseline-aligned run (items-baseline,
               not items-center — mixed text sizes centre-align to different
               visual lines; sharing the BASELINE is what reads as level).
               Metadata pieces are separated by subtle middot delimiters,
               rendered as their own spans (aria-hidden) rather than CSS
               pseudo-elements so they participate in the same baseline. -->
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
              <h3 class="text-xl font-bold leading-none">
                {{ siteName }}
              </h3>
              <!-- Labelled metadata pieces (operator 2026-08-13): "Label: value",
                 label at reduced opacity so the VALUES stay the scannable part.
                 Order: Timezone, Existing count, Existing date range. The
                 Queued count and Location were retired 2026-08-13 (queued is
                 redundant with the rows below; coordinates are not useful
                 while uploading). -->
              <span class="text-sm text-cloud flex flex-wrap items-baseline gap-x-2">
                <span
                  v-if="siteTimezone !== undefined"
                  :title="'Site timezone'"
                ><span class="text-cloud/60">Timezone:</span> {{ siteTimezone }}{{ tzOffsetLabel !== undefined ? ` (${tzOffsetLabel})` : '' }}</span>
                <template v-if="siteInfo !== undefined">
                  <span
                    v-if="siteTimezone !== undefined"
                    class="text-cloud/40 select-none"
                    aria-hidden="true"
                  >·</span>
                  <span :title="'Recordings already in this site'"><span class="text-cloud/60">Existing:</span> {{ siteInfo.recCount.toLocaleString() }} recording{{ siteInfo.recCount === 1 ? '' : 's' }}</span>
                  <template v-if="existingRangeLabel !== undefined">
                    <span
                      class="text-cloud/40 select-none"
                      aria-hidden="true"
                    >·</span>
                    <span :title="'Date range of the recordings already in this site'"><span class="text-cloud/60">Range:</span> {{ existingRangeLabel }}</span>
                  </template>
                </template>
              </span>
            </div>
          <!-- Timezone method moved OFF the box header to the page-level
               options row ("Determine Timezone(s):", operator 2026-08-13) —
               one method for the whole upload session. -->
          </template>
        </div>

        <!-- Selection actions + the ✕, back on the TITLE row. The controls are
           COMPACT (text-xs, py-1, narrower date field) so the cluster fits
           beside the title instead of wrapping — which is what caused the
           header to grow on select. No reserved empty row is needed once
           nothing wraps. min-h matches the compact control height so the row
           is still identical selected vs not. -->
        <div class="flex items-center gap-x-2 shrink-0 min-h-[1.75rem]">
          <template v-if="selectedIds.size > 0">
            <span class="text-xs text-cloud whitespace-nowrap">{{ selectedIds.size }} selected:</span>
            <!-- BATCH DATE EDIT (operator 2026-08-13): set one date across every
               selected row, keeping each row's own TIME. Starting with date
               only — a numeric UTC-offset picker was floated but deferred as
               harder to reason about; this covers the common "recorder had the
               wrong day" case. Only offered for rows that are still editable. -->
            <label
              v-if="editableSelectedCount > 0"
              class="flex items-center gap-x-1.5 text-xs text-cloud whitespace-nowrap"
            >
              Set date:
              <!-- flowbite-datepicker (the app's own picker) rather than a native
                 <input type=date>: native renders in the BROWSER LOCALE with no
                 way to force a display format, and the operator wants
                 YYYY-MM-DD everywhere. Same component + options shape as
                 _components/date-range-picker/date-input-picker.vue. -->
              <!-- size=10 + w-auto: the box is exactly a YYYY-MM-DD date wide
                 (operator 2026-08-13) rather than a fixed utility width. -->
              <input
                ref="batchDateInput"
                v-model="batchDate"
                type="text"
                placeholder="YYYY-MM-DD"
                autocomplete="off"
                size="10"
                maxlength="10"
                class="rounded border-cloud/30 bg-pitch text-insight px-1.5 py-0.5 text-xs w-auto"
              >
              <button
                class="btn btn-secondary text-xs px-2 py-1 whitespace-nowrap"
                :disabled="batchDate === ''"
                :title="`Apply this date to ${editableSelectedCount} selected recording${editableSelectedCount === 1 ? '' : 's'} (each keeps its own time)`"
                @click="applyBatchDate"
              >
                Apply to Selected
              </button>
            </label>
            <!-- ✕ = CLEAR THE SELECTION (not delete). Pairs with the per-row
               trash icon, which is the destructive one — operator 2026-08-13:
               ✕ deselects, trash removes. -->
            <button
              class="text-cloud hover:text-insight shrink-0"
              title="Deselect all selected recordings"
              aria-label="Deselect all"
              @click="clearSelection"
            >
              <svg
                viewBox="0 0 16 16"
                class="w-3.5 h-3.5 fill-none stroke-current"
                stroke-width="1.8"
              ><path
                d="M4 4l8 8M12 4l-8 8"
                stroke-linecap="round"
              /></svg>
            </button>
          <!-- Selection actions retired 2026-08-13 (operator): Start/Pause
               (the global control row owns run/pause) and Remove Selected
               (per-row trash and the group-level Clear buttons cover removal). -->
          </template>
          <!-- 'Clear Completed' and 'Retry Failed' retired from this cluster
             2026-08-13 (operator): those actions now live ON the Completed and
             Errors group header rows, next to the rows they act on. -->
          <!-- TRASH, not ✕ (operator 2026-08-14). This button REMOVES the
               section, which is the same destructive act the per-row trash
               performs on a recording — so it now wears the same glyph, at the
               same w-4 size and with the same hover:text-flamingo treatment.

               It also resolves a collision this page already had: ✕ means
               "deselect all" in the selection-actions cluster a few lines
               above, so the same symbol meant CLEAR SELECTION in one place and
               DELETE THIS SECTION in another. Same reasoning as §138/§139, where
               the Reset icon was duplicating the per-row Retry glyph. -->
          <button
            v-if="items.length === 0"
            class="text-cloud hover:text-flamingo shrink-0"
            title="Remove this Upload Queue Section"
            aria-label="Remove this Upload Queue Section"
            @click="$emit('removeBox')"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-4 h-4 fill-current"
            ><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- The table + intake area (one bordered region; the whole thing is a
         drop target — the page passes highlight state via dropActive).
         v-show (not v-if) when collapsed: rows keep updating unseen. -->
    <div
      v-show="!collapsed"
      class="mt-3 overflow-x-auto rounded-lg border transition-colors"
      :class="dropActive ? 'border-frequency bg-frequency/5' : 'border-cloud/20'"
    >
      <!-- table-fixed (operator 2026-08-14): stop the table forcing a horizontal
           scrollbar on narrow viewports.

           MEASURED before: `whitespace-nowrap` gives every cell an unbreakable
           minimum width, so the table FLOORED at 1078px and the wrapper
           scrolled instead of shrinking — overflow 203px at 1024, 427px at 800.
           Status (233px) and Format (161px) were the largest contributors.

           `table-fixed` makes the declared <th> widths authoritative rather
           than content-driven, so the table always matches its container and
           the truncatable columns surrender space first. -->
      <table class="w-full table-fixed text-sm whitespace-nowrap">
        <thead>
          <tr class="bg-moss/40 text-left">
            <th class="px-2 py-2 w-8">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                class="rounded border-cloud/40 bg-pitch"
                @change="toggleSelectAll"
              >
            </th>
            <th
              v-for="col in COLUMNS"
              :key="col.key"
              class="px-2 py-2 font-medium cursor-pointer select-none hover:text-frequency truncate"
              :style="col.width !== undefined ? { width: col.width } : undefined"
              @click="onSort(col.key)"
            >
              {{ col.label }}
              <span
                v-if="sortKey === col.key"
                class="text-frequency"
              >{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="px-2 py-2 w-20" />
          </tr>
        </thead>
        <tbody>
          <!-- Rows partitioned into collapsible STATUS GROUPS (≥1 row each).
               The group header row carries the caret + aggregates; when the
               group is collapsed the aggregates ARE the summary line. -->
          <template
            v-for="section in groupSections"
            :key="section.key"
          >
            <tr
              class="border-t border-cloud/20 bg-moss/25 cursor-pointer select-none hover:bg-moss/40"
              @click="toggleGroup(section.key)"
            >
              <td
                :colspan="COLUMNS.length + 2"
                class="px-2 py-1.5"
              >
                <span class="inline-flex items-center gap-x-2">
                  <icon-custom-angle-down
                    class="w-4 h-4 text-insight transform transition-transform duration-200"
                    :class="groupCollapsed[section.key] ? '-rotate-90' : ''"
                  />
                  <span
                    class="font-semibold"
                    :class="section.key === 'errors' ? 'text-flamingo' : section.key === 'completed' ? 'text-frequency' : 'text-insight'"
                  >{{ section.label }}</span>
                  <span class="text-cloud text-xs">{{ section.metrics }}</span>
                  <!-- Group-scoped actions live HERE (moved off the header
                       cluster 2026-08-13): the action sits next to the rows it
                       acts on. @click.stop so it doesn't also toggle the group. -->
                  <button
                    v-if="section.key === 'errors' && retryableCount(section.rows) > 0"
                    class="btn btn-secondary text-xs inline-flex items-center gap-x-1 ml-2 px-2 py-0.5"
                    :title="`Retry all ${retryableCount(section.rows)} failed recording${retryableCount(section.rows) === 1 ? '' : 's'} (rejected recordings cannot be retried)`"
                    @click.stop="$emit('retryFailed')"
                  ><!-- The errors group is NOT the same set as retryFailed:
                       it also holds `rejected` rows, which the server has
                       PERMANENTLY refused and which retryFailed deliberately
                       skips. Counting the whole group here promised
                       "Retry All (N)" and then silently retried fewer, so the
                       count is scoped to the actually-retryable rows and the
                       button hides when none remain. -->
                    <svg
                      viewBox="0 0 16 16"
                      class="w-3 h-3 fill-none stroke-current"
                      stroke-width="1.8"
                    ><path
                      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg>
                    Retry All ({{ retryableCount(section.rows) }})
                  </button>
                  <button
                    v-if="section.key === 'completed' || section.key === 'duplicates'"
                    class="btn btn-secondary text-xs inline-flex items-center gap-x-1 ml-2 px-2 py-0.5"
                    :title="`Clear these ${section.rows.length} recording${section.rows.length === 1 ? '' : 's'} from the list (they stay uploaded)`"
                    @click.stop="$emit('clearSelected', section.rows.map(r => r.id))"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      class="w-3 h-3 fill-current"
                    ><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
                    Clear ({{ section.rows.length }})
                  </button>
                </span>
              </td>
            </tr>
            <!-- Clicking anywhere on a row toggles its selection (operator
                 2026-08-13), except on the row's own controls — see
                 onRowClick's closest() guard. cursor-pointer signals it.

                 SELECTED-ROW HIGHLIGHT (operator 2026-08-14: selection was not
                 visually apparent). MEASURED why: rows composite over pitch, so
                 the old `bg-moss/30` selected state sat at 1.040:1 against a
                 plain row and **1.012:1 against a merely-HOVERED row** — i.e.
                 selected and hovered were indistinguishable, and the group
                 header (bg-moss/25) sat between them.

                 Now tinted with the house accent instead of more moss:
                 bg-frequency/10 reads 1.188:1 vs plain and 1.156:1 vs hover —
                 an order of magnitude more separation — plus a left accent bar
                 so selection is legible without relying on colour alone
                 (colour-blind users, and rows scanned peripherally). Hover on a
                 selected row deepens to /15 so the row still responds to the
                 pointer instead of looking inert. Body text stays cloud, which
                 still reads at 15.88:1 on the tint. -->
            <tr
              v-for="item in (groupCollapsed[section.key] ? [] : section.rows)"
              :key="item.id"
              class="border-t border-cloud/10 cursor-pointer transition-colors"
              :class="selectedIds.has(item.id)
                ? 'bg-frequency/10 hover:bg-frequency/15 border-l-2 border-l-frequency'
                : 'hover:bg-moss/20 border-l-2 border-l-transparent'"
              @click="onRowClick(item, $event)"
            >
              <td class="px-2 py-1.5">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(item.id)"
                  class="rounded border-cloud/40 bg-pitch"
                  @change="toggleSelect(item.id)"
                >
              </td>
              <!-- Filename carries its OWN row actions (operator 2026-08-14): the
                 "open in Visualizer" and "retry" buttons used to sit at the far
                 right edge, a long way from the name they act on. Sitting them
                 immediately after the filename keeps the action next to the
                 thing it acts upon, and leaves the right edge for the single
                 destructive control. -->
              <td
                class="px-2 py-1.5"
                :title="item.relativePath"
              >
                <span class="inline-flex items-center gap-x-1.5 max-w-full">
                  <span class="truncate">{{ displayFilename(item) }}</span>
                  <button
                    v-if="item.state === 'ingested'"
                    class="text-cloud hover:text-frequency disabled:opacity-40 shrink-0"
                    :disabled="openingId === item.id"
                    title="Open this recording in the Visualizer (new tab)"
                    @click.stop="$emit('openDestination', item)"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-none stroke-current"
                      stroke-width="1.6"
                    ><path
                      d="M6.5 3.5H3v9h9V9.5M9.5 2.5h4v4M13 3L7.5 8.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg>
                  </button>
                  <button
                    v-if="canRetry(item)"
                    class="text-cloud hover:text-frequency shrink-0"
                    title="Retry"
                    @click.stop="$emit('retryItem', item.id)"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-none stroke-current"
                      stroke-width="1.8"
                    ><path
                      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg>
                  </button>
                </span>
              </td>
              <!-- Date and Time each get their OWN picker (operator 2026-08-13):
                 a date input for the date cell, a time input for the time cell.
                 Pre-Start rows only. -->
              <td class="px-2 py-1.5 truncate">
                <span class="inline-flex items-center gap-x-1">
                  {{ recDate(item) }}
                  <button
                    v-if="canEditDatetime(item)"
                    class="text-cloud/60 hover:text-frequency"
                    title="Correct this recording’s date"
                    @click="openFieldEditor(item, 'date')"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      class="w-3.5 h-3.5 fill-none stroke-current"
                      stroke-width="1.5"
                    ><path
                      d="M10.5 2.5l3 3L6 13l-3.5.5L3 10l7.5-7.5zM9 4l3 3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg>
                  </button>
                </span>
              </td>
              <td class="px-2 py-1.5 truncate">
                <span class="inline-flex items-center gap-x-1">
                  {{ recTime(item) }}
                  <button
                    v-if="canEditDatetime(item)"
                    class="text-cloud/60 hover:text-frequency"
                    title="Correct this recording’s time"
                    @click="openFieldEditor(item, 'time')"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      class="w-3.5 h-3.5 fill-none stroke-current"
                      stroke-width="1.5"
                    ><path
                      d="M10.5 2.5l3 3L6 13l-3.5.5L3 10l7.5-7.5zM9 4l3 3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg>
                  </button>
                </span>
              </td>
              <td class="px-2 py-1.5 truncate">
                {{ zoneCol(item) }}
              </td>
              <!-- Format carries the size too (operator 2026-08-14).
                   TRUNCATABLE: clips instead of widening the table; the title
                   keeps the full value reachable on hover. -->
              <td
                class="px-2 py-1.5 truncate"
                :title="formatCol(item)"
              >
                {{ formatCol(item) }}
              </td>
              <td
                class="px-2 py-1.5 tabular-nums truncate"
                :title="lengthCol(item)"
              >
                {{ lengthCol(item) }}
              </td>
              <!-- Progress = percentage + rate in one cell (operator 2026-08-14);
                 the bar was retired 2026-08-13. Fixed width so the cell does
                 not widen the moment a rate appears mid-upload. -->
              <td class="px-2 py-1.5 tabular-nums truncate">
                <span
                  v-if="showProgress(item)"
                  class="text-insight"
                >{{ progressPercent(item) }}%<span
                  v-if="hasRate(item)"
                  class="text-cloud"
                > ({{ rateCol(item) }})</span></span>
                <span
                  v-else-if="item.state === 'ingested' || item.state === 'duplicate'"
                  class="text-frequency"
                >100%</span>
                <span
                  v-else
                  class="text-cloud"
                >—</span>
              </td>
              <!-- Status LAST, immediately before the per-row action buttons. -->
              <td
                class="px-2 py-1.5 truncate"
                :class="statusColor(item)"
                :title="statusDetail(item)"
              >
                {{ statusCol(item) }}
              </td>
              <td class="px-2 py-1.5">
                <div class="flex items-center gap-x-1.5 justify-end">
                  <!-- The Visualizer + Retry buttons moved into the Filename
                     cell (operator 2026-08-14) so each action sits beside the
                     recording it acts on. Only the destructive control remains
                     here, deliberately separated from them. -->
                  <!-- ONE removal control (operator 2026-08-13): the separate
                     cancel-✕ and clear-trash converged into a single button
                     that removes the row whatever its state. Safe for
                     in-flight rows because engine.remove() aborts the
                     transfer before deleting (engine.ts remove()). Always
                     shown — every row can be removed.
                     TRASH icon (not ✕): ✕ now means "deselect" in the
                     selection cluster, so the destructive action needs a
                     distinct, unambiguous glyph. -->
                  <button
                    class="text-cloud hover:text-flamingo"
                    :title="canCancel(item) ? 'Cancel and remove this recording' : 'Remove this recording from the list'"
                    @click="$emit('clearItem', item.id)"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-current"
                    ><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <!-- intake area (drop zone) — always beneath the last visible row;
           the PAGE owns the drag/drop handlers on the whole container -->
      <slot name="intake" />
    </div>

    <!-- Per-field correction modal: a DATE picker or a TIME picker depending on
         which cell's pencil was clicked (native inputs = the platform's own
         pickers). House modal pattern, cf. the FLAC explainer. -->
    <div
      v-if="editingItem !== undefined"
      class="fixed inset-0 z-[9999] isolate flex items-center justify-center bg-pitch/60"
      @click.self="closeFieldEditor"
    >
      <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6 mx-4">
        <div class="flex flex-col gap-y-4">
          <div class="flex flex-row items-center justify-between">
            <h2 class="text-xl font-header">
              Correct {{ editField === 'date' ? 'Date' : 'Time' }}
            </h2>
            <button
              type="button"
              title="Cancel"
              @click="closeFieldEditor"
            >
              <icon-custom-fi-close-thin class="h-5 w-5 cursor-pointer text-insight" />
            </button>
          </div>
          <p class="text-sm text-cloud truncate">
            {{ editingItem.relativePath }}
          </p>
          <label class="text-sm text-cloud flex flex-col gap-y-1.5">
            {{ editField === 'date' ? 'Recording date' : 'Recording start time' }} ({{ editZoneLabel }})
            <input
              v-if="editField === 'date'"
              ref="editDateInput"
              v-model="editValue"
              type="text"
              placeholder="YYYY-MM-DD"
              autocomplete="off"
              class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2"
            >
            <input
              v-else
              v-model="editValue"
              type="time"
              step="1"
              class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2"
            >
          </label>
          <div class="flex justify-end gap-x-3">
            <button
              class="btn btn-secondary btn-medium px-4 py-2"
              @click="closeFieldEditor"
            >
              Cancel
            </button>
            <button
              class="btn btn-primary btn-medium px-4 py-2"
              :disabled="editValue === ''"
              @click="saveField"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { type UploadItem, toUtcIso } from '@rfcx-bio/upload-engine'

import { type FlowbiteDatePicker, type FlowbiteDatePickerOptions } from '@/_components/date-range-picker/date-range-picker'
import SiteCombobox from '@/_components/site-combobox/site-combobox.vue'

const props = defineProps<{
  items: UploadItem[]
  /** The linked site's name; undefined while the box is still UNLINKED
   * (header shows the site selector instead, autofocused). */
  siteName?: string
  /** The linked site's IANA tz (shown in the Site Local Time option). */
  siteTimezone?: string
  /** Per-box timezone method (auto|site|utc). */
  timezoneMode?: string
  /** Options for the unlinked-state site selector; taken = already boxed. */
  siteOptions?: Array<{ id: string, name: string, taken: boolean }>
  /** Stable per-box key, used to give each combobox unique element ids —
   *  several unlinked sections can be on screen at once, and duplicated ids
   *  would break both `aria-controls` and `aria-activedescendant`. */
  boxKey?: string
  openingId?: string
  /** Whether the FLAC transcode stage is on — refines the pending-group label
   * (a queued WAV only counts as Transcode Pending when encoding will run). */
  flacEnabled?: boolean
  /** Drag-hover highlight for the combined table+intake region (page-owned). */
  dropActive?: boolean
  /** Collapse state is PAGE-OWNED (lifted 2026-08-13) so the options row's
   * expand/collapse-all control can drive every box at once. */
  collapsed?: boolean
  /** Site facts for the title line: how many recordings the site already holds
   * and the YYYY-MM range they span (both from the sites API's count aggregate). */
  siteInfo?: { recCount: number, firstRecordingAt?: string, lastRecordingAt?: string }
}>()

const emit = defineEmits<{
  (e: 'removeBox'): void
  (e: 'toggleCollapsed'): void
  (e: 'siteChosen', streamId: string): void
  /** User picked “Create a Site…” in the combobox; carries whatever they had
   *  typed so the modal can pre-fill the name. The HOST owns the modal — this
   *  component only reports the intent. */
  (e: 'createSite', typedName: string): void
    (e: 'clearCompleted'): void
  (e: 'retryFailed'): void

  (e: 'clearSelected', ids: string[]): void

  (e: 'retryItem', id: string): void
  (e: 'clearItem', id: string): void
  (e: 'openDestination', item: UploadItem): void
  (e: 'editDatetime', edit: { id: string, localWallTime: string, timestampUtc: string, timezoneName: string }): void
}>()

// autofocus the site selector when the box mounts unlinked
// The combobox exposes focus()/setQuery() rather than being a raw element.
const sitePicker = ref<{ focus: () => void, setQuery: (v: string) => void }>()

// -- per-row datetime correction (operator 2026-08-13) ----------------------
// Pre-Start rows only: once signed/uploading the timestamp is part of the
// server registration and must not drift from it.
const editingItem = ref<UploadItem>()
const editValue = ref('')
const editField = ref<'date' | 'time'>('date')

const canEditDatetime = (item: UploadItem): boolean =>
  item.state === 'staged' || item.state === 'analyzing'

/** Title-area click = collapse toggle, EXCEPT clicks on/inside buttons or
 * the site <select> (unlinked state) — those keep their own behaviour. */
const onTitleAreaClick = (event: MouseEvent): void => {
  if (props.siteName === undefined) return
  const target = event.target as HTMLElement | null
  if (target?.closest('button, select, input, a') !== null) return
  emit('toggleCollapsed')
}

// flowbite-datepicker instances. Both date fields use the app's own picker so
// the display format is pinned to YYYY-MM-DD (a native <input type=date>
// renders in the browser locale and cannot be told otherwise).
const batchDateInput = ref<HTMLInputElement>()
const editDateInput = ref<HTMLInputElement>()
let batchPicker: FlowbiteDatePicker | undefined
let editPicker: FlowbiteDatePicker | undefined

const DATE_PICKER_OPTIONS: FlowbiteDatePickerOptions = {
  autohide: true,
  format: 'yyyy-mm-dd',
  maxView: 1,
  startView: 0,
  pickLevel: 0,
  // Open DOWNWARD from the field. Default 'auto' chose to drop UP here
  // (measured: calendar y=111..369 for an input at y=369), which put the
  // calendar ~258px above the control, over the page header/stats — far from
  // where the user is looking, so it read as "the calendar didn't open".
  // Horizontal stays AUTO: the control sits far right (x~1237) and the
  // calendar is 392px wide, so pinning 'left' overflowed the viewport by
  // ~98px; auto flips it to right-align against the field instead.
  // flowbite parses this as space-separated y/x keywords (processOptions.js).
  orientation: 'bottom auto'
}

/** Attach a picker to an input and mirror its picks back into a ref. */
const attachPicker = async (
  input: HTMLInputElement,
  onPick: (value: string) => void
): Promise<FlowbiteDatePicker> => {
  const { initDatePicker } = await import('@/_components/date-range-picker/date-range-picker')
  const picker = initDatePicker(input, DATE_PICKER_OPTIONS)
  input.addEventListener('changeDate', () => { onPick(input.value) })
  return picker
}

/** Open the DATE or TIME picker for one row. localWallTime is
 * 'YYYY-MM-DDTHH:mm:ss', so each field is a slice of it. */
const openFieldEditor = async (item: UploadItem, field: 'date' | 'time'): Promise<void> => {
  editingItem.value = item
  editField.value = field
  const wall = item.localWallTime
  editValue.value = wall === undefined
    ? ''
    : field === 'date' ? wall.slice(0, 10) : wall.slice(11, 19)
  if (field !== 'date') return
  await nextTick()
  if (editDateInput.value === undefined) return
  if (editPicker !== undefined) { editPicker.destroy(); editPicker = undefined }
  editPicker = await attachPicker(editDateInput.value, v => { editValue.value = v })
  if (editValue.value !== '') editPicker.setDate(editValue.value)
}

/** The zone the edited wall time will be interpreted in — the row's OWN
 * current zone, so "correct the clock" doesn't covertly change the timezone
 * decision. Errored rows without a zone fall back to the site tz, then UTC. */
const editZone = computed<string>(() => {
  const item = editingItem.value
  if (item === undefined) return 'UTC'
  return item.timezoneName ?? props.siteTimezone ?? 'UTC'
})
const editZoneLabel = computed(() => editZone.value)

/** "YYYY-MM to YYYY-MM" for the recordings a site already holds; a single
 * "YYYY-MM" when both ends fall in the same month. Undefined when the site has
 * no recordings (the API returns null) so the piece is omitted entirely.
 * Parsed by SLICING the datetime string rather than via Date: these are site-
 * local wall times with no zone, and new Date(...) would re-interpret them in
 * the viewer's timezone and could shift the month at a boundary. */
const existingRangeLabel = computed<string | undefined>(() => {
  const first = props.siteInfo?.firstRecordingAt
  const last = props.siteInfo?.lastRecordingAt
  if (first === undefined || last === undefined) return undefined
  const firstMonth = first.slice(0, 7)
  const lastMonth = last.slice(0, 7)
  if (!/^\d{4}-\d{2}$/.test(firstMonth) || !/^\d{4}-\d{2}$/.test(lastMonth)) return undefined
  return firstMonth === lastMonth ? firstMonth : `${firstMonth} to ${lastMonth}`
})

/** Current UTC offset of the site's IANA tz (e.g. 'UTC-5'), for the title
 * line. DATA-DERIVED, not Intl timeZoneName: the traps registry records that
 * an Intl 'shortOffset' usage passed local vue-tsc but BROKE the Docker image
 * build (older TS lib in the image lacks the union member) — 'longOffset'
 * carries the same risk. Instead, format today's instant in the tz with
 * plain numeric fields (supported everywhere) and diff against UTC. */
const tzOffsetLabel = computed<string | undefined>(() => {
  const tz = props.siteTimezone
  if (tz === undefined || tz === '') return undefined
  try {
    const now = new Date()
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
year: 'numeric',
month: '2-digit',
day: '2-digit',
      hour: '2-digit',
minute: '2-digit',
second: '2-digit',
hour12: false
    })
    const p = Object.fromEntries(fmt.formatToParts(now).map(x => [x.type, x.value]))
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === '24' ? 0 : p.hour), +p.minute, +p.second)
    const offsetMin = Math.round((asUtc - now.getTime()) / 60_000)
    if (offsetMin === 0) return 'UTC+0'
    const sign = offsetMin < 0 ? '-' : '+'
    const abs = Math.abs(offsetMin)
    const hh = Math.floor(abs / 60)
    const mm = abs % 60
    return `UTC${sign}${hh}${mm !== 0 ? `:${String(mm).padStart(2, '0')}` : ''}`
  } catch { return undefined }
})

/** Close the row editor and tear down its picker (the input is v-if'd away,
 * so a stale instance would leak and mis-bind on the next open). */
const closeFieldEditor = (): void => {
  if (editPicker !== undefined) { editPicker.destroy(); editPicker = undefined }
  editingItem.value = undefined
}

const saveField = (): void => {
  const item = editingItem.value
  if (item === undefined || editValue.value === '') return
  // Recombine the edited field with the row's existing other half. A row with
  // NO timestamp yet (analysis failed) gets sensible defaults so a single
  // field edit can still produce a complete, valid timestamp.
  const existing = item.localWallTime
  const datePart = editField.value === 'date'
    ? editValue.value
    : existing?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  const rawTime = editField.value === 'time'
    ? editValue.value
    : existing?.slice(11, 19) ?? '00:00:00'
  const timePart = rawTime.length === 5 ? `${rawTime}:00` : rawTime
  const wall = `${datePart}T${timePart}`
  const zone = editZone.value
  // Offset-string zones (UTC±HH:MM from filename/metadata rungs) and IANA
  // names both go through toUtcIso; plain 'UTC' means interpret as UTC.
  const utc = zone === 'UTC' ? toUtcIso(wall) : toUtcIso(wall, offsetToMinutes(zone) ?? zone)
  if (utc === undefined) return
  emit('editDatetime', { id: item.id, localWallTime: wall, timestampUtc: utc, timezoneName: zone })
  closeFieldEditor()
}

// -- batch date edit over the current selection ----------------------------
const batchDate = ref('')

// The batch input only exists while a selection is active, so attach on first
// appearance rather than onMounted.
watch(batchDateInput, async (el) => {
  if (el === undefined) { batchPicker = undefined; return }
  if (batchPicker !== undefined) return
  batchPicker = await attachPicker(el, v => { batchDate.value = v })
})

/** Selected rows that are still pre-Start (the only ones we may re-date). */
const editableSelected = computed(() =>
  props.items.filter(item => selectedIds.value.has(item.id) && canEditDatetime(item)))
const editableSelectedCount = computed(() => editableSelected.value.length)

const applyBatchDate = (): void => {
  if (batchDate.value === '') return
  for (const item of editableSelected.value) {
    // keep each row's OWN time; only the date moves
    const time = item.localWallTime?.slice(11, 19) ?? '00:00:00'
    const wall = `${batchDate.value}T${time}`
    const zone = item.timezoneName ?? props.siteTimezone ?? 'UTC'
    const utc = zone === 'UTC' ? toUtcIso(wall) : toUtcIso(wall, offsetToMinutes(zone) ?? zone)
    if (utc === undefined) continue
    emit('editDatetime', { id: item.id, localWallTime: wall, timestampUtc: utc, timezoneName: zone })
  }
  batchDate.value = ''
}

/** '±HH:MM' -> minutes; undefined for IANA names. */
const offsetToMinutes = (zone: string): number | undefined => {
  const m = zone.match(/^([+-])(\d{2}):(\d{2})$/)
  if (m === null) return undefined
  const sign = m[1] === '-' ? -1 : 1
  return sign * (parseInt(m[2]) * 60 + parseInt(m[3]))
}

// Collapse state lifted to the page (see props.collapsed); template reads
// the prop via this alias so the v-show/caret bindings stay terse.
const collapsed = computed(() => props.collapsed === true)
onMounted(() => {
  if (props.siteName === undefined) sitePicker.value?.focus()
})

// -- status grouping (kept for Status-column sorting; the 'Hide:' checkbox
// filters were retired 2026-08-12 — operator: not the right technique) -----

type FilterGroup = 'completed' | 'failed' | 'cancelled' | 'duplicate' |
  'uploadInProgress' | 'uploadPending' | 'transcodeInProgress' |
  'transcodePending' | 'processing' | 'staged'

const groupOf = (item: UploadItem): FilterGroup => {
  // Transcode groups only apply to WAVs when encoding is on; everything
  // else in the pre-sign pipeline is plain Upload Pending.
  const willTranscode = props.flacEnabled === true && item.fileFormat === 'wav'
  switch (item.state) {
    case 'ingested': return 'completed'
    case 'duplicate': return 'duplicate'
    case 'failed':
    case 'rejected': return 'failed'
    case 'cancelled': return 'cancelled'
    case 'uploading': return 'uploadInProgress'
    case 'uploaded': return 'processing'
    case 'preparing': return willTranscode ? 'transcodeInProgress' : 'uploadPending'
    case 'queued': return willTranscode ? 'transcodePending' : 'uploadPending'
    case 'ready':
    case 'signing':
    case 'signed':
    case 'paused': return 'uploadPending'
    case 'analyzing':
    case 'staged':
    default: return 'staged'
  }
}

const visible = computed(() => props.items)

// -- sorting ------------------------------------------------------------------

// Column order (operator 2026-08-13): Method dropped entirely; Size added;
// Status moved LAST, immediately before the per-row action buttons.
//
// 2026-08-14 (operator): Progress+Rate COMBINED into one "Progress" column
// ("NN% (NN MB/s)") and Format+Size COMBINED into one "Format" column
// ("48 kHz · 16-bit, 12.4 MB"). Fewer columns leaves room for the filename,
// which is the column users actually scan.
//
// FIXED WIDTHS on Date / Time / Zone / Progress: their values are
// fixed-character-count (plus an edit button on Date/Time), so a static width
// slightly wider than the content stops the table reflowing as rows change
// state — the jitter you otherwise get when a rate appears mid-upload.
// Filename/Status stay fluid so they absorb the remaining space.
// Under `table-fixed` these widths are AUTHORITATIVE, not hints.
//
// FIXED columns (Date/Time/Zone/Progress) carry fixed-character-count values
// plus, on Date/Time, an edit button — they keep exact pixel widths.
// TRUNCATABLE columns (Filename/Format/Duration/Status) get PERCENTAGES so
// they shrink with the container and clip, which is what absorbs a narrowing
// viewport instead of producing a scrollbar.
//
// ⚠️ WIDTHS ARE INLINE STYLES, NOT UTILITY CLASSES. WindiCSS scans TEMPLATE
// markup, so an arbitrary class written only inside this TypeScript array
// (e.g. `w-[21%]`) is never generated — verified live: `.table-fixed` WAS
// present in the served CSS while every `.w-[..%]` rule was ABSENT, so the
// columns silently kept content-driven widths and the table still overflowed
// by 427px at an 800px viewport. Inline styles cannot be tree-shaken, so they
// are the right mechanism for widths that live in script.
const COLUMNS: Array<{ key: string, label: string, width?: string }> = [
  { key: 'filename', label: 'Filename', width: '24%' },
  { key: 'recDate', label: 'Date', width: '128px' },
  { key: 'recTime', label: 'Time', width: '112px' },
  { key: 'zone', label: 'Zone', width: '96px' },
  { key: 'format', label: 'Format', width: '17%' },
  { key: 'durationMs', label: 'Duration', width: '11%' },
  { key: 'progress', label: 'Progress', width: '144px' },
  { key: 'status', label: 'Status', width: '21%' }
]

const sortKey = ref<string>('filename')
const sortAsc = ref(true)

const onSort = (key: string): void => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

const sortValue = (item: UploadItem, key: string): string | number => {
  switch (key) {
    case 'filename': return item.relativePath.toLowerCase()
    case 'recDate':
    case 'recTime': return item.localWallTime ?? ''
    case 'zone': return zoneCol(item)
    // Format now carries size too, but SORTING stays on the audio
    // characteristics — sorting a "Format" column by file size would
    // surprise anyone who clicked it to group like recordings together.
    case 'format': return (item.sampleRateHz ?? 0) * 100 + (item.bitDepth ?? 0)
    case 'durationMs': return item.durationMs ?? -1
    case 'status': return groupOf(item)
    case 'progress': return item.state === 'ingested' ? 2 : (item.progress ?? -1)
    default: return 0
  }
}

// -- STATUS GROUPS (2026-08-13, operator: first-class parallel-upload UI) ----
// Rows are grouped into collapsible sections by coarse status. Five groups
// (operator approved splitting Active out of Queued so collapsing the queue
// cannot hide in-flight uploads — the rows you actually watch):
//   active:    uploading / uploaded / signing / signed  (default EXPANDED, top)
//   queued:    staged / queued / preparing / ready / paused / analyzing
//   completed: ingested
//   duplicates:duplicate
//   errors:    failed / rejected / cancelled
// A group renders ONLY when it has ≥1 row. Aggregates live on the group line.

type StatusGroup = 'active' | 'queued' | 'completed' | 'duplicates' | 'errors'

const GROUP_ORDER: StatusGroup[] = ['active', 'queued', 'completed', 'duplicates', 'errors']

const GROUP_LABELS: Record<StatusGroup, string> = {
  active: 'Active',
  queued: 'Queued',
  completed: 'Completed',
  duplicates: 'Duplicates',
  errors: 'Errors'
}

const statusGroupOf = (item: UploadItem): StatusGroup => {
  switch (item.state) {
    case 'ingested': return 'completed'
    case 'duplicate': return 'duplicates'
    case 'failed':
    case 'rejected':
    case 'cancelled': return 'errors'
    case 'uploading':
    case 'uploaded':
    case 'signing':
    case 'signed': return 'active'
    default: return 'queued' // staged/queued/preparing/ready/paused/analyzing
  }
}

// Per-group collapse: Active + Queued start OPEN (the work you watch);
// Completed/Duplicates/Errors start FOLDED (the bulk you scroll past).
const groupCollapsed = ref<Record<StatusGroup, boolean>>({
  active: false, queued: false, completed: true, duplicates: true, errors: true
})
const toggleGroup = (g: StatusGroup): void => { groupCollapsed.value[g] = !groupCollapsed.value[g] }

interface GroupSection {
  key: StatusGroup
  label: string
  rows: UploadItem[]
  metrics: string
}

const humanBytes = (n: number): string => {
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${n} B`
}

const groupMetrics = (g: StatusGroup, rows: UploadItem[]): string => {
  const n = rows.length
  const noun = `${n} recording${n === 1 ? '' : 's'}`
  switch (g) {
    case 'active': {
      const bytes = rows.reduce((s, r) => s + r.fileSizeBytes, 0)
      const done = rows.reduce((s, r) => s + (r.state === 'uploaded' ? r.fileSizeBytes : r.fileSizeBytes * (r.progress ?? 0)), 0)
      const pct = bytes > 0 ? Math.round((done / bytes) * 100) : 0
      const rate = rows.reduce((s, r) => s + (avgRateBps(r) ?? 0), 0)
      const rateTxt = rate > 0 ? ` · ${humanBytes(rate)}/s` : ''
      return `${noun} · ${pct}% of ${humanBytes(bytes)}${rateTxt}`
    }
    case 'queued': {
      const bytes = rows.reduce((s, r) => s + r.fileSizeBytes, 0)
      return `${noun} · ${humanBytes(bytes)} waiting`
    }
    case 'completed': {
      const bytes = rows.reduce((s, r) => s + r.fileSizeBytes, 0)
      return `${noun} · ${humanBytes(bytes)} uploaded`
    }
    case 'duplicates': return noun
    case 'errors': return noun
  }
}

/** The sections actually rendered: sorted rows partitioned by group, empty
 * groups dropped, fixed group order. */
const groupSections = computed<GroupSection[]>(() => {
  const buckets = new Map<StatusGroup, UploadItem[]>()
  for (const row of visibleSorted.value) {
    const g = statusGroupOf(row)
    const arr = buckets.get(g)
    if (arr === undefined) buckets.set(g, [row])
    else arr.push(row)
  }
  return GROUP_ORDER
    .filter(g => (buckets.get(g)?.length ?? 0) > 0)
    .map(g => ({ key: g, label: GROUP_LABELS[g], rows: buckets.get(g) ?? [], metrics: groupMetrics(g, buckets.get(g) ?? []) }))
})

const visibleSorted = computed(() => {
  const rows = [...visible.value]
  const key = sortKey.value
  rows.sort((a, b) => {
    const va = sortValue(a, key)
    const vb = sortValue(b, key)
    const cmp = typeof va === 'number' && typeof vb === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb))
    return sortAsc.value ? cmp : -cmp
  })
  return rows
})

// -- selection ----------------------------------------------------------------

const selectedIds = ref(new Set<string>())

const toggleSelect = (id: string): void => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

/** Rows the user can actually SEE: only those in EXPANDED status groups.
 * (Before status grouping, visibleSorted was that set; it no longer is — a
 * collapsed group's rows are still in visibleSorted but are not rendered, so
 * select-all silently acted on invisible rows.) */
const renderedRows = computed(() =>
  groupSections.value.flatMap(section =>
    groupCollapsed.value[section.key] ? [] : section.rows))

/** Drop the whole selection (the ✕ beside 'Apply to Selected'). */
const clearSelection = (): void => { selectedIds.value = new Set() }

const allVisibleSelected = computed(() =>
  renderedRows.value.length > 0 &&
  renderedRows.value.every(item => selectedIds.value.has(item.id)))

const toggleSelectAll = (): void => {
  if (allVisibleSelected.value) selectedIds.value = new Set()
  else selectedIds.value = new Set(renderedRows.value.map(item => item.id))
}

// Drop selections whose rows disappeared (cleared)
watch(() => props.items, (items) => {
  const alive = new Set(items.map(item => item.id))
  const next = new Set([...selectedIds.value].filter(id => alive.has(id)))
  if (next.size !== selectedIds.value.size) selectedIds.value = next
})

/** Row click = toggle selection, EXCEPT on the row's own interactive bits
 * (the checkbox, the date/time pencils, retry, remove, open-in-visualizer).
 * Without this guard, clicking ✕ would also flip the selection underneath. */
const onRowClick = (item: UploadItem, event: MouseEvent): void => {
  const target = event.target as HTMLElement | null
  if (target?.closest('button, input, a, select, label') !== null) return
  toggleSelect(item.id)
}

// -- cell renderers -----------------------------------------------------------

const displayFilename = (item: UploadItem): string => {
  // relativePath keeps the ORIGINAL name (pre-transcode); show its basename
  const base = item.relativePath.split('/').pop() ?? item.filename
  return base
}

const recDate = (item: UploadItem): string =>
  item.localWallTime !== undefined ? item.localWallTime.slice(0, 10) : '—'

const recTime = (item: UploadItem): string =>
  item.localWallTime !== undefined ? item.localWallTime.slice(11, 19) : '—'

/**
 * Zone column: compact `UTC±H[:MM]` (unpadded hours). IANA zones are resolved
 * to their offset AT THE RECORDING INSTANT (DST-correct), offset strings are
 * reformatted, plain UTC renders as `UTC`.
 */
const zoneCol = (item: UploadItem): string => {
  const tz = item.timezoneName
  if (tz === undefined) return '—'
  if (tz === 'UTC') return 'UTC'
  const offsetMatch = tz.match(/^([+-])(\d{2}):(\d{2})$/)
  if (offsetMatch !== null) {
    const [, sign, hh, mm] = offsetMatch
    return `UTC${sign}${parseInt(hh)}${mm !== '00' ? `:${mm}` : ''}`
  }
  // IANA zone name → offset AT the recording instant, derived from the data
  // we already carry: offset = localWallTime − timestampUtc. DST-correct by
  // construction and needs no Intl lib support.
  if (item.localWallTime !== undefined && item.timestampUtc !== undefined) {
    const wall = Date.parse(`${item.localWallTime}Z`)
    const utc = Date.parse(item.timestampUtc)
    if (!isNaN(wall) && !isNaN(utc)) {
      const offsetMin = Math.round((wall - utc) / 60_000)
      if (offsetMin === 0) return 'UTC'
      const sign = offsetMin < 0 ? '-' : '+'
      const abs = Math.abs(offsetMin)
      const hours = Math.floor(abs / 60)
      const mins = abs % 60
      return `UTC${sign}${hours}${mins !== 0 ? `:${String(mins).padStart(2, '0')}` : ''}`
    }
  }
  return tz
}

/** Format column: sample rate + bit depth, then the file size (operator
 * 2026-08-14 — Format and Size merged into one column). The filetype was
 * dropped 2026-08-13, being already implied by the filename.
 * Shape: "48 kHz · 16-bit, 12.4 MB" — audio characteristics first, size after
 * the comma, so the eye still lands on the format when scanning. Size is
 * ALWAYS known (it comes from the File handle), so it renders even when the
 * header probe found no rate/depth. */
const formatCol = (item: UploadItem): string => {
  const rate = item.sampleRateHz !== undefined
    ? `${(item.sampleRateHz / 1000).toFixed(1).replace(/\.0$/, '')} kHz`
    : undefined
  const depth = item.bitDepth !== undefined ? `${item.bitDepth}-bit` : undefined
  const audio = [rate, depth].filter(p => p !== undefined).join(' · ')
  const size = sizeCol(item)
  return audio === '' ? size : `${audio}, ${size}`
}

/** Size column: file size in MB. */
const sizeCol = (item: UploadItem): string => {
  const mb = item.fileSizeBytes / 1048576
  if (mb >= 100) return `${mb.toFixed(0)} MB`
  return `${mb.toFixed(1)} MB`
}

/** Duration column: 'N mins, N secs' (operator 2026-08-13), with singular
 * forms and the minutes part omitted entirely for sub-minute clips. */
const lengthCol = (item: UploadItem): string => {
  if (item.durationMs === undefined) return '—'
  const totalSeconds = Math.round(item.durationMs / 1000)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  const minPart = mm > 0 ? `${mm} min${mm === 1 ? '' : 's'}` : undefined
  const secPart = `${ss} sec${ss === 1 ? '' : 's'}`
  return minPart !== undefined ? `${minPart}, ${secPart}` : secPart
}

const STATE_LABELS: Record<string, string> = {
  analyzing: 'Analyzing…',
  staged: 'Staged',
  queued: 'Waiting (transcode/hash)',
  preparing: 'Transcoding/Hashing…',
  ready: 'Waiting for URL',
  signing: 'Requesting URL…',
  signed: 'Waiting to upload',
  uploading: 'Uploading',
  uploaded: 'Processing (server)…',
  ingested: 'Complete',
  duplicate: 'Duplicate — already ingested (↻ to force retry)',
  failed: 'Failed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  paused: 'Paused'
}

const statusCol = (item: UploadItem): string => {
  if (item.state === 'staged' && item.analysisError !== undefined) return item.analysisError
  // Advisory notice (e.g. an unusually old date on a file with no recorder
  // metadata). UNLIKE analysisError this does NOT block Start — a genuine
  // digitised archive must upload freely — so it is shown in the neutral
  // colour and reads as information, not a fault.
  if (item.state === 'staged' && item.notice !== undefined) return item.notice
  // prestaged: checksum + signed URL already in hand — Start goes straight
  // to the PUT (and the server's dedup check already passed this file)
  if (item.state === 'staged' && item.signedUrl !== undefined) return 'Staged — ready for fast upload'
  // advisory duplicates carry their staging-time note in `error`
  if (item.state === 'duplicate' && item.error !== undefined) return `Duplicate — ${item.error}`
  const label = STATE_LABELS[item.state] ?? item.state
  const detail = item.error
  return detail !== undefined && ['failed', 'rejected', 'cancelled'].includes(item.state)
    ? `${label}: ${detail}`
    : label
}

const statusDetail = (item: UploadItem): string =>
  item.analysisError ?? item.notice ?? item.error ?? STATE_LABELS[item.state] ?? item.state

const statusColor = (item: UploadItem): string => {
  switch (item.state) {
    case 'ingested': return 'text-frequency'
    case 'duplicate': return 'text-cloud'
    case 'failed':
    case 'rejected':
    case 'cancelled': return 'text-flamingo'
    // analysisError blocks Start (flamingo = fault); a notice does not
    // (cloud = advisory). Distinguishing them matters: an archive upload with
    // a notice is FINE, and colouring it like an error would tell the user to
    // "fix" something that is correct.
    case 'staged':
      if (item.analysisError !== undefined) return 'text-flamingo'
      return item.notice !== undefined ? 'text-cloud' : 'text-insight'
    default: return 'text-insight'
  }
}

const showProgress = (item: UploadItem): boolean =>
  ['preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded'].includes(item.state)

const progressPercent = (item: UploadItem): number => {
  switch (item.state) {
    case 'preparing': return 5
    case 'ready':
    case 'signing': return 8
    case 'signed': return 10
    case 'uploading': return 10 + Math.round((item.progress ?? 0) * 80)
    case 'uploaded': return 95
    default: return 100
  }
}

const avgRateBps = (item: UploadItem): number | undefined => {
  if (item.uploadStartedAtMs === undefined) return undefined
  const end = item.uploadEndedAtMs ?? Date.now()
  const seconds = (end - item.uploadStartedAtMs) / 1000
  if (seconds <= 0) return undefined
  const bytes = item.state === 'uploading'
    ? item.fileSizeBytes * (item.progress ?? 0)
    : item.fileSizeBytes
  return bytes / seconds
}

/** Does this row have a real transfer rate to show? Used by the composite
 * Progress cell so it renders "63%" rather than "63% (—)" before any bytes
 * have moved. */
const hasRate = (item: UploadItem): boolean => rateCol(item) !== '—'

const rateCol = (item: UploadItem): string => {
  // Rate is only meaningful for uploads that moved real bytes: in-flight
  // with progress, or terminal-successful. Failed/instant-aborted attempts
  // produced absurd numbers (100+ MB/s on a CORS abort) — show — instead.
  if (!['uploading', 'uploaded', 'ingested', 'duplicate'].includes(item.state)) return '—'
  const bps = avgRateBps(item)
  if (bps === undefined || bps <= 0) return '—'
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
}

// -- row action gates ---------------------------------------------------------

const canCancel = (item: UploadItem): boolean =>
  !['ingested', 'duplicate', 'failed', 'rejected', 'cancelled'].includes(item.state)

// duplicate is retryable as the OVERRIDE for advisory staging-time flags
// (lost-recording/availability=0 re-uploads) — the server re-verdicts at
// signing, so a true duplicate just bounces back at zero byte cost
//
// `rejected` is deliberately NOT retryable. It means the server gave a
// PERMANENT verdict on this file (duration over the cap, size over the limit,
// future/absurd date, view-only project): re-signing the identical file+params
// returns the identical rejection, so a Retry button here is an action that
// can never succeed. The user's real remedies — trim the file, fix the clock,
// pick another project — all produce a NEW staged item rather than a retry of
// this one. Cancelled/failed remain retryable: those are user- or
// transport-level, and the next attempt genuinely can succeed.
const canRetry = (item: UploadItem): boolean =>
  ['failed', 'cancelled', 'duplicate'].includes(item.state)

// Group-scoped "Retry All" acts through retryFailed(), which retries `failed`
// ONLY — so the button's count must exclude rejected/cancelled rows that share
// the Errors group, or it overstates what the click will do.
const retryableCount = (rows: UploadItem[]): number =>
  rows.filter(row => row.state === 'failed').length

</script>
