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
                  :title="anyZoneDiffers ? zoneDiscrepancyText : 'Site timezone'"
                  :class="anyZoneDiffers ? 'text-warning font-semibold' : ''"
                ><span :class="anyZoneDiffers ? 'text-warning/70' : 'text-cloud/60'">Timezone:</span> {{ siteTimezone }}{{ tzOffsetLabel !== undefined ? ` (${tzOffsetLabel})` : '' }}</span>
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
          <!-- SECOND expand/collapse control (operator 2026-08-18), far-right on the
               site-name line and flush against the trash icon when that is
               visible. Same action as the caret hanging in the left gutter.

               WHY TWO: the left caret sits in the page gutter, far from where
               the eye ends up on a wide row — by the time you have read the site
               name and its metadata you are on the RIGHT of the line, and
               collapsing meant travelling all the way back. This is the same
               affordance where the gesture actually starts.

               `w-4 h-4` matches the trash glyph beside it (and the per-row
               icons) rather than the gutter caret's `w-5`, so the right-hand
               cluster reads as one set. `order` is not used: it is declared
               BEFORE the trash in source so it naturally sits to its left. -->
          <button
            class="text-cloud hover:text-frequency shrink-0"
            :title="collapsed ? 'Expand this section' : 'Collapse this section'"
            :aria-label="collapsed ? 'Expand this section' : 'Collapse this section'"
            :aria-expanded="!collapsed"
            @click="$emit('toggleCollapsed')"
          >
            <!-- WindiCSS: rotate utilities are inert without the explicit
                 `transform` class (cf. the gutter caret above). -->
            <icon-custom-angle-down
              class="w-4 h-4 transform transition-transform duration-200"
              :class="collapsed ? '-rotate-90' : ''"
            />
          </button>
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
              <!-- The header spans only up to the Zone column, so the bulk
                   Zone control can sit in a REAL cell UNDER "Zone" (operator
                   2026-08-18: it was landing over Date, because the header used
                   to be one full-width colspan and the control simply flowed
                   inline after the label).
                   COLUMNS = filename,recDate,recTime,zone,format,durationMs,
                   progress,status (+2 leading/trailing utility cells), so the
                   label block covers the checkbox + first three columns and the
                   zone cell is addressed on its own. -->
              <td
                :colspan="ZONE_LABEL_SPAN"
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

                  <!-- START UPLOAD sits HERE, left-justified immediately after
                       the "N recordings · NN MB waiting" metrics (operator
                       2026-08-18) rather than out at the right with the other
                       bulk actions: it is the PRIMARY action for this group, and
                       putting it beside the count it acts on makes the pairing
                       explicit. `Clear Queued` stays right-aligned with the
                       other destructive/secondary actions.
                       @click.stop so it does not also toggle the group. -->
                  <button
                    v-if="section.key === 'queued' && (startableIds(section.rows).length > 0 || groupIsRunning)"
                    class="btn-group-action ml-1"
                    :title="groupIsRunning
                      ? 'Pause uploading for this site'
                      : `Upload the ${startableIds(section.rows).length} queued recording${startableIds(section.rows).length === 1 ? '' : 's'} for this site`"
                    @click.stop="groupIsRunning ? $emit('pauseGroup') : $emit('startGroup', startableIds(section.rows))"
                  >
                    <!-- No row count in the label (operator 2026-08-18): the group header
                       already states "N recordings · NN MB waiting" a few pixels to
                       the left, so repeating N here was redundant. The exact count
                       still rides in the tooltip. -->
                    {{ groupIsRunning ? 'Pause Upload' : 'Start Upload' }}
                    <!-- SAME glyphs as the global metrics-bar Start/Pause
                       (operator 2026-08-18) so one visual language covers both
                       controls: solid play triangle / solid double bar, `w-4`
                       here to match the other group-header icons. -->
                    <svg
                      v-if="groupIsRunning"
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-current"
                    ><path d="M4 2h3v12H4zM9 2h3v12H9z" /></svg>
                    <svg
                      v-else
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-current"
                    ><path d="M4 2l9 6-9 6V2z" /></svg>
                  </button>

                  <!-- Collapsed groups still surface the discrepancy: Errors
                       starts collapsed, so without this the warning would be
                       invisible exactly where it matters most. -->
                  <span
                    v-if="canBulkEditZone(section.key) && groupCollapsed[section.key] && sectionHasZoneDiscrepancy(section.rows)"
                    class="text-warning text-xs ml-2"
                    :title="zoneDiscrepancyText"
                  >● timezone differs from site</span>
                </span>
              </td>

              <!-- ZONE cell: the bulk corrector sits directly under the "Zone"
                   column header, aligned with the values it edits.
                   QUEUED and ERRORS only — those groups are still being
                   prepared and reviewed. Anything signed/uploading/ingested is
                   registered server-side at a fixed instant, so re-dating it
                   would desync it. Hidden when collapsed: the header is then a
                   summary line, and a control there would act on rows the user
                   cannot see. -->
              <td
                class="px-2 py-1.5"
                @click.stop
              >
                <span
                  v-if="canBulkEditZone(section.key) && !groupCollapsed[section.key]"
                  class="inline-flex items-center gap-x-1"
                >
                  <!-- TWO-STAGE control (operator 2026-08-18). At rest this is
                       an "Edit" affordance, not a live <select>: a dropdown
                       sitting permanently in the header read as a value and
                       invited mis-clicks. Clicking EITHER the label or the
                       pencil swaps in the real selector, already set to the
                       group's current offset.

                       Text is `text-sm` — the same SIZE as the row values below
                       — so the column reads as one coherent stack, but at
                       `cloud/40` it is the QUIETEST thing in that stack: it must
                       sit behind both the "Zone" column header above it and the
                       actual offsets below (operator 2026-08-18, tuned down from
                       /70). It reaches full lime only on hover, so it is easy to
                       find once looked for. /40 matches the existing muted tone
                       already used elsewhere in this table. -->
                  <button
                    v-if="zoneEditorFor !== section.key"
                    class="inline-flex items-center gap-x-1 text-sm text-cloud/40 hover:text-frequency transition-colors"
                    :title="'Set the timezone offset for every recording in this group'"
                    :aria-label="'Edit the timezone offset for the ' + section.label + ' recordings'"
                    @click="openZoneEditor(section.key)"
                  >
                    Edit
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
                  <select
                    v-else
                    :ref="el => registerZoneSelect(section.key, el)"
                    :value="groupOffset(section.rows) ?? ''"
                    class="bg-transparent border-0 text-sm text-insight focus:ring-0 focus:outline-none py-0 pl-0 pr-4 cursor-pointer"
                    :aria-label="'Timezone offset for the ' + section.label + ' recordings'"
                    @change="onGroupZoneChange(section.rows, $event)"
                    @blur="zoneEditorFor = undefined"
                  >
                    <option
                      v-if="groupOffset(section.rows) === undefined"
                      value=""
                    >
                      Set zone…
                    </option>
                    <option
                      v-for="opt in UTC_OFFSET_OPTIONS"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                  <!-- The [?] appears ONLY on a discrepancy, so its presence
                       is itself the signal. -->
                  <span
                    v-if="sectionHasZoneDiscrepancy(section.rows)"
                    class="text-warning cursor-help select-none"
                    :title="zoneDiscrepancyText"
                  >[?]</span>
                </span>
              </td>

              <!-- Remaining columns + the group's own actions, right-aligned.
                   Queued gets Upload/Clear here in the same style as the
                   Errors group's Retry All (operator 2026-08-18). -->
              <td
                :colspan="COLUMNS.length + 1 - ZONE_LABEL_SPAN"
                class="px-2 py-1.5 text-right"
                @click.stop
              >
                <span class="inline-flex items-center gap-x-2 justify-end">
                  <!-- GROUP-ACTION BUTTON STYLE (operator 2026-08-18):
                       icons on the RIGHT, sized w-4 h-4 to match the per-row
                       trash glyph, short labels, and a MUTED outline instead of
                       the bright `frequency` lime of `btn-secondary`. These are
                       secondary bulk actions sitting inside a header row — at
                       full lime they competed with the group label and with the
                       page's primary Start button. `btn-group-action` is
                       defined in windi.config.ts shortcuts. -->
                  <button
                    v-if="section.key === 'errors' && retryableCount(section.rows) > 0"
                    class="btn-group-action"
                    :title="`Retry all ${retryableCount(section.rows)} failed recording${retryableCount(section.rows) === 1 ? '' : 's'} (rejected recordings cannot be retried)`"
                    @click="$emit('retryFailed')"
                  ><!-- The errors group is NOT the same set as retryFailed:
                       it also holds `rejected` rows, which the server has
                       PERMANENTLY refused and which retryFailed deliberately
                       skips. Counting the whole group here promised
                       "Retry All (N)" and then silently retried fewer, so the
                       count is scoped to the actually-retryable rows and the
                       button hides when none remain. -->
                    Retry All ({{ retryableCount(section.rows) }})
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

                  <!-- QUEUED clear. Scoped to THIS SITE's queued rows (the
                       component is instantiated per box), which is why it
                       carries ids rather than asking the page to re-derive the
                       set: "clear what you can see" must mean exactly that.
                       (Start Upload lives in the label cell — see above.) -->
                  <button
                    v-if="section.key === 'queued' && section.rows.length > 0"
                    class="btn-group-action"
                    :title="`Remove these ${section.rows.length} queued recording${section.rows.length === 1 ? '' : 's'} from the list (nothing is uploaded or deleted from your computer)`"
                    @click="$emit('clearSelected', section.rows.map(r => r.id))"
                  >
                    Clear Queued
                    <svg
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-current"
                    ><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
                  </button>

                  <button
                    v-if="section.key === 'completed' || section.key === 'duplicates'"
                    class="btn-group-action"
                    :title="`Clear these ${section.rows.length} recording${section.rows.length === 1 ? '' : 's'} from the list (they stay uploaded)`"
                    @click="$emit('clearSelected', section.rows.map(r => r.id))"
                  >
                    Clear ({{ section.rows.length }})
                    <svg
                      viewBox="0 0 16 16"
                      class="w-4 h-4 fill-current"
                    ><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
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
                  <!-- WHICH saved format produced this date (operator
                       2026-08-18). Shown ONLY when one of the user's own
                       formats matched -- the built-in patterns are the silent
                       common case and would be noise on every row. It matters
                       because a loose saved format can yield a plausible but
                       wrong date, and the user needs to see that their own rule,
                       not auto-detect, is responsible. -->
                  <span
                    v-if="item.matchedFormatLabel !== undefined"
                    class="text-[10px] leading-none px-1 py-0.5 rounded border border-frequency/40 text-frequency/80 shrink-0"
                    :title="`Recognised by your saved format: ${item.matchedFormatLabel}`"
                  >fmt</span>
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
                  <!-- Time separators carry a hair of space (operator 2026-08-18:
                       the colons read too tight). Poppins sets a narrow colon
                       with almost no side bearing, so 08:45:10 crowds into a
                       single blob.

                       0.06em per side ≈ a typographic hair space — the
                       conventional amount for time separators: enough to group
                       hh / mm / ss, not enough to look letter-spaced.

                       Applied as an INLINE STYLE, not a utility: this WindiCSS
                       build does not emit arbitrary `em` spacing (verified in
                       the emitted CSS — `mx-[0.06em]` produced NO rule at all,
                       the silent-failure mode this codebase has been bitten by
                       before). Colours are the only arbitrary values that
                       compile here.

                       `tabular-nums` keeps digits monospaced so the column does
                       not jitter row to row. The tight `><span` formatting is
                       deliberate: a newline would render as a literal space
                       inside the time. -->
                  <span class="tabular-nums whitespace-nowrap"><span
                    v-for="(part, idx) in recTimeParts(item)"
                    :key="idx"
                  ><span
                    v-if="idx > 0"
                    style="margin-left:0.06em;margin-right:0.06em"
                  >:</span>{{ part }}</span></span>
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
              <!-- Zone. Amber when the row's own offset disagrees with the site's
                   timezone AT THAT RECORDING'S INSTANT (operator 2026-08-18) —
                   i.e. the zone came from the filename or the file's metadata
                   and does not match where the site is. Often legitimate (a
                   recorder left on home time), so this is a NOTICE, not an
                   error: amber `warning`, never `flamingo`, which is reserved
                   for real failures. -->
              <td
                class="px-2 py-1.5 truncate"
                :class="zoneDiffers(item) ? 'text-warning' : ''"
                :title="zoneDiffers(item) ? zoneDiscrepancyText : undefined"
              >
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

import { type UploadItem, rowOffsetMinutes, toUtcIso, UTC_OFFSET_OPTIONS, zoneOffsetAt } from '@rfcx-bio/upload-engine'

import { type FlowbiteDatePicker, type FlowbiteDatePickerOptions } from '@/_components/date-range-picker/date-range-picker'
import SiteCombobox from '@/_components/site-combobox/site-combobox.vue'

const props = defineProps<{
  items: UploadItem[]
  /** The linked site's name; undefined while the box is still UNLINKED
   * (header shows the site selector instead, autofocused). */
  siteName?: string
  /** The linked site's IANA tz. Also the reference the Zone column compares
   *  each row against — resolved AT the recording's instant, so DST is
   *  handled (see `siteOffsetAt`). */
  siteTimezone?: string
  /** Is the upload engine running? Combined with this site's own in-flight
   *  rows to decide whether the group button shows Start or Pause. */
  running?: boolean
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

/* eslint-disable func-call-spacing -- defineEmits is a COMPILER MACRO; the
   call-signature syntax inside its generic is required, and the rule
   misreads each `(e: ...)` signature as a spaced function call. */
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
  /** Bulk zone correction for a whole status group in THIS site's queue. The
   *  host applies it; this component only reports the intent. */
  (e: 'setGroupZone', change: { ids: string[], offsetMinutes: number }): void
  /** Start uploading exactly these ids (this site's queued rows). */
  (e: 'startGroup', ids: string[]): void
  /** Pause the engine from this site's group header. */
  (e: 'pauseGroup'): void
}>()
/* eslint-enable func-call-spacing */

// autofocus the site selector when the box mounts unlinked
// The combobox exposes focus()/setQuery() rather than being a raw element.
/* eslint-disable func-call-spacing -- TYPE LITERAL, not a call. The rule
   wants `focus:()`, which @vue/compiler-sfc CANNOT PARSE inside <script
   setup> -- `vite-ssg build` dies with "Unexpected token". Keep the space. */
const sitePicker = ref<{ focus: () => void, setQuery: (v: string) => void }>()
/* eslint-enable func-call-spacing */

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

/** `08:45:10` -> `['08','45','10']` so the template can space the colons.
 *  A row with no time yields a single `—` part and renders unchanged. */
const recTimeParts = (item: UploadItem): string[] => recTime(item).split(':')

/**
 * Zone column: compact `UTC±H[:MM]` (unpadded hours). IANA zones are resolved
 * to their offset AT THE RECORDING INSTANT (DST-correct), offset strings are
 * reformatted, plain UTC renders as `UTC`.
 */
/**
 * Which status groups may have their zone bulk-corrected.
 *
 * QUEUED and ERRORS only (operator 2026-08-18): those rows are still being
 * prepared or reviewed. `active` rows have a signed URL and a server-side
 * registration at a fixed instant; `completed`/`duplicates` are already
 * ingested. Re-dating any of those here would desync the row from the server.
 */
const canBulkEditZone = (group: StatusGroup): boolean =>
  group === 'queued' || group === 'errors'

/**
 * How many cells the group-header LABEL block spans before the Zone cell.
 *
 * The row is: [leading utility cell] + COLUMNS + [trailing utility cell].
 * The Zone control must occupy the cell at the same position as the `zone`
 * column, so the label block covers everything BEFORE it:
 *   1 (leading) + index-of-zone-within-COLUMNS.
 *
 * Derived from COLUMNS rather than hardcoded, so re-ordering or inserting a
 * column cannot silently push the control out of alignment -- exactly the bug
 * this replaces (the header was one full-width colspan, so the control simply
 * flowed inline and landed over Date).
 *
 * Verified by arithmetic before shipping: label(4) + zone(1) + tail(5) = 10,
 * which equals a data row's COLUMNS.length + 2, and the zone cell lands on
 * COLUMNS[3] === 'zone'.
 */
const ZONE_LABEL_SPAN = COLUMNS.findIndex(col => col.key === 'zone') + 1

/**
 * The rows in a group that can actually START uploading.
 *
 * Mirrors the page-level Start button's rule: `staged` and free of an
 * analysisError. A row whose timestamp could not be resolved is not startable,
 * so counting it here would promise an upload that silently does not happen --
 * the same over-promise the Errors group's "Retry All" count was fixed for.
 */
const startableIds = (rows: UploadItem[]): string[] =>
  rows.filter(row => row.state === 'staged' && row.analysisError === undefined).map(row => row.id)

/**
 * Is THIS SITE's queue actively uploading?
 *
 * Scoped to `props.items` — the component is instantiated per box, so this is
 * the one site's rows, NOT the project-wide pipeline the global metrics-bar
 * button watches. A site whose rows are all still staged must keep showing
 * "Start Upload" even while another site is mid-flight.
 *
 * The in-flight states mirror the page's own `activePipeline` list, minus
 * `staged` (not yet started) and the terminal states.
 */
const IN_FLIGHT_STATES = ['queued', 'preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded']
const groupIsRunning = computed<boolean>(() =>
  props.running === true && props.items.some(item => IN_FLIGHT_STATES.includes(item.state)))

/** A row's own UTC offset, or undefined if it never resolved a timestamp. */
const offsetOf = (item: UploadItem): number | undefined =>
  rowOffsetMinutes(item.localWallTime, item.timestampUtc)

/**
 * The offset shared by a group's rows.
 *
 * A site's queued batch is ASSUMED to share one offset (operator 2026-08-18) —
 * that assumption is the feature, not a simplification. Mid-analysis, or when
 * one file carried an explicit filename offset and others did not, rows can
 * briefly disagree; the MAJORITY value is shown so the control is never blank
 * or misleading, and choosing any value resolves the whole group.
 */
const groupOffset = (rows: UploadItem[]): number | undefined => {
  const counts = new Map<number, number>()
  for (const row of rows) {
    const offset = offsetOf(row)
    if (offset === undefined) continue
    counts.set(offset, (counts.get(offset) ?? 0) + 1)
  }
  let best: number | undefined
  let bestCount = 0
  for (const [offset, count] of counts) {
    if (count > bestCount) { best = offset; bestCount = count }
  }
  return best
}

/**
 * The site's own offset AT A GIVEN INSTANT.
 *
 * 🔴 Resolved per-recording, NOT "now". A site on DST is a different offset in
 * July than in January, so comparing a July recording against an offset taken
 * today would report a one-hour discrepancy on perfectly correct data — and a
 * warning that cries wolf for half the year is worse than no warning.
 */
const siteOffsetAt = (item: UploadItem): number | undefined => {
  const tz = props.siteTimezone
  if (tz === undefined || tz === '') return undefined
  const instant = item.timestampUtc !== undefined ? new Date(item.timestampUtc) : undefined
  if (instant === undefined || isNaN(instant.getTime())) return undefined
  return zoneOffsetAt(tz, instant)
}

/**
 * Does this row's zone disagree with the site's?
 *
 * True only when BOTH are known: a site with no timezone configured is a
 * missing-data case, not a discrepancy, and flagging it would just be noise.
 */
const zoneDiffers = (item: UploadItem): boolean => {
  const rowOffset = offsetOf(item)
  const siteOffset = siteOffsetAt(item)
  if (rowOffset === undefined || siteOffset === undefined) return false
  return rowOffset !== siteOffset
}

const sectionHasZoneDiscrepancy = (rows: UploadItem[]): boolean => rows.some(zoneDiffers)

/**
 * Does ANY correctable row disagree with the site zone? Drives the site
 * header's amber emphasis, so the user can see WHAT the rows are being
 * compared against — a highlight on the rows alone leaves them hunting.
 *
 * Scoped to the groups that can still be corrected: an already-ingested row
 * with an odd zone is history, and colouring it would be an alarm with no
 * available action.
 */
const anyZoneDiffers = computed<boolean>(() =>
  props.items.some(item => canBulkEditZone(statusGroupOf(item)) && zoneDiffers(item)))

/** Copy for the amber [?]. Names BOTH values — a generic hint is not actionable. */
const zoneDiscrepancyText = computed<string>(() => {
  const site = props.siteTimezone
  return 'The timezone read from these recordings differs from this site’s timezone' +
    (site !== undefined && site !== '' ? ` (${site})` : '') +
    '. That is often correct — for example if the recorder was set to a different timezone — but check it before uploading. Use the dropdown to set the offset for the whole group.'
})

/**
 * Which group's zone selector is currently OPEN (undefined = all showing the
 * "Edit" affordance). Only one at a time: the control is per-group and there
 * is no case for editing two at once.
 */
const zoneEditorFor = ref<StatusGroup | undefined>(undefined)

/**
 * Swap the "Edit" affordance for the real <select> and immediately open it.
 *
 * `showPicker()` is what makes this feel like one click rather than two —
 * without it the user clicks Edit, then has to click the select as well. It is
 * not universally supported, and it THROWS if called without transient user
 * activation, so it is both feature-detected and try/caught; the fallback is a
 * focused select the user opens themselves (still correct, just one more
 * click). Must run after the DOM swap, hence nextTick.
 */
const openZoneEditor = async (group: StatusGroup): Promise<void> => {
  zoneEditorFor.value = group
  await nextTick()
  const el = zoneSelects.get(group)
  if (el === undefined || el === null) return
  el.focus()
  const withPicker = el as HTMLSelectElement & { showPicker?: () => void }
  if (typeof withPicker.showPicker === 'function') {
    try { withPicker.showPicker() } catch { /* needs user activation; focus is enough */ }
  }
}

/** Per-group refs for the zone selects, so openZoneEditor can focus the right
 *  one (a plain `ref` would collide across groups). */
const zoneSelects = new Map<StatusGroup, HTMLSelectElement | null>()
const registerZoneSelect = (group: StatusGroup, el: unknown): void => {
  zoneSelects.set(group, el as HTMLSelectElement | null)
}

const onGroupZoneChange = (rows: UploadItem[], event: Event): void => {
  const raw = (event.target as HTMLSelectElement).value
  if (raw === '') return
  const offsetMinutes = Number(raw)
  if (Number.isNaN(offsetMinutes)) return
  // Rows with no resolved wall time have nothing to re-anchor — skip rather
  // than invent a timestamp for them.
  const ids = rows.filter(row => row.localWallTime !== undefined).map(row => row.id)
  if (ids.length === 0) return
  emit('setGroupZone', { ids, offsetMinutes })
  // Collapse back to the "Edit" affordance once a value is chosen.
  zoneEditorFor.value = undefined
}

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

/** Size column: kB below 1 MB, MB above.
 *
 * Sub-megabyte files used to render as "0.1 MB" (operator 2026-08-18) — one
 * significant digit is not enough resolution down there, and every short
 * recording collapsed to the same handful of values. Below 1 MB the size is
 * shown in whole kB instead, FLOORED: a rounded-up size can claim a file is
 * larger than it is, and this column sits beside a duration the user is
 * sanity-checking against.
 *
 * `kB`/`MB` (lower-case k) matches the `kHz` immediately before it in the same
 * cell. NOTE: `humanBytes` above is a SEPARATE helper for the group-summary
 * line and still renders `KB`; it was deliberately left alone here — this
 * change was scoped to the Format column. */
const sizeCol = (item: UploadItem): string => {
  const bytes = item.fileSizeBytes
  if (bytes < 1048576) return `${Math.floor(bytes / 1024)} kB`
  const mb = bytes / 1048576
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
