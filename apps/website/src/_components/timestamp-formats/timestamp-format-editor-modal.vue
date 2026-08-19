<template>
  <!-- SINGLE-PURPOSE editor/creator (operator 2026-08-19): this modal edits or
       creates ONE format. The saved-formats LIST lives in its own modal
       (timestamp-format-list-modal.vue); splitting the two jobs deleted the
       whole draft/Done layer this component used to carry -- Save Format is the
       terminal action, the header × (or click-outside) cancels, and the host
       persists immediately. -->
  <modal-popup
    :title="editing === undefined ? 'Build a Filename Pattern' : 'Edit Filename Pattern'"
    modal-body="sm:(my-8 align-middle max-w-6xl w-full)"
    @emit-close="$emit('close')"
  >
    <!-- The palette makes this modal tall (20 tokens over 3 groups). modal-popup's
         panel is `overflow-hidden`, so without an explicit cap the action row
         can sit below the fold on a short viewport with no way to scroll to
         it. Cap at the viewport and scroll INSIDE the dialog. -->
    <div class="p-6 max-h-[85vh] overflow-y-auto">
      <div class="flex items-start justify-between mb-5">
        <!-- The title says what the modal DOES (operator 2026-08-19): create mode
             emphasises the guided construction the layout walks through
             (exemplar -> pattern -> verify -> name); edit mode names its
             target. "New Filename Pattern" only named the artifact. -->
        <h3 class="text-lg font-medium text-insight">
          {{ editing === undefined ? 'Build a Filename Pattern' : `Edit Filename Pattern: “${editing.label}”` }}
        </h3>
        <button
          class="text-cloud hover:text-insight shrink-0 ml-4"
          title="Close without saving"
          aria-label="Close without saving"
          @click="$emit('close')"
        >
          <svg
            viewBox="0 0 16 16"
            class="w-5 h-5 fill-none stroke-current"
            stroke-width="1.6"
          ><path
            d="M3.5 3.5l9 9M12.5 3.5l-9 9"
            stroke-linecap="round"
          /></svg>
        </button>
      </div>

      <!-- EDITOR -----------------------------------------------------------
           No section header (operator 2026-08-19: "Add a format" was
           self-evident -- the fields below say what this is). The one thing the
           header row carried that must survive is the EDIT-MODE escape: while
           editing an existing format, a banner names which one and offers
           Cancel, since otherwise the only clue is pre-filled fields and there
           is no way out short of committing the edit. -->
      <div class="border-t border-cloud/20 pt-4">
        <!-- EXEMPLAR FILE (operator 2026-08-19; renamed from "Test & Verify" same
             day -- the section is a construction AID, and the new name says what
             the file IS rather than what the user must do. Explicitly OPTIONAL:
             a format can be built and saved without ever picking a file, and
             the label must not read as a required step of the form.

             Sits ABOVE the Format field on purpose: pick the real file first,
             and its name becomes the visible reference you assemble tokens
             AGAINST -- character for character, no transcription step. Typing a
             sample by hand invited building a format against a typo; picking
             the actual file removes that failure mode entirely.

             Only file.name is ever read. Nothing is uploaded, no bytes are
             touched, and the list lives only for this modal session. The picker is
             the ONLY source in both hosts (operator rejected staged-file
             seeding), so the list always reflects an explicit user choice. -->
        <div class="mb-4">
          <div class="flex items-baseline justify-between mb-1.5">
            <!-- Section headings promoted text-xs -> text-sm font-medium insight
                 (operator 2026-08-19): at text-xs/cloud they were dimmer than
                 the CONTENT they labelled and the modal read as one undivided
                 run of controls. -->
            <span class="text-sm font-medium text-insight">Exemplar File <span class="text-xs font-normal text-cloud/60">(optional)</span></span>
          </div>

          <div
            v-if="testFilenames.length === 0"
            class="border border-dashed border-cloud/40 rounded px-3 py-3 text-center"
          >
            <button
              class="btn btn-secondary text-xs px-2 py-1"
              @click="openFilePicker"
            >
              Choose a recording file…
            </button>
            <p class="text-xs text-cloud/60 mt-1.5">
              Optionally pick one of your recordings to build the pattern against.
              Only the filename is read; nothing is uploaded.
            </p>
          </div>

          <div v-else>
            <!-- the names under test, each with its live verdict -->
            <ul class="space-y-1">
              <li
                v-for="row in testRows"
                :key="row.filename"
                class="flex items-baseline justify-between gap-x-2"
              >
                <!-- The filename is the PROMINENT element (text-sm, brighter
                     than its verdict): it is the thing being matched against,
                     and the reference the user reads while placing tokens. -->
                <code class="text-sm font-mono text-insight truncate">{{ row.filename }}</code>
                <span
                  class="text-xs shrink-0 tabular-nums"
                  :class="row.parsed !== undefined ? 'text-frequency' : 'text-cloud/50'"
                >{{ row.parsed ?? (formatInput === '' ? 'awaiting format' : 'no match') }}</span>
              </li>
            </ul>
            <div class="mt-1.5 flex items-center gap-x-3">
              <button
                class="text-xs text-cloud hover:text-insight"
                @click="openFilePicker"
              >
                Add files…
              </button>
              <button
                class="text-xs text-cloud hover:text-insight"
                @click="clearTestFiles"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Hidden input: the actual picker. `multiple` because a recorder
               folder holds many names, and a format that matches one file but
               not its siblings is exactly what several rows expose. -->
          <input
            ref="filePickerEl"
            type="file"
            multiple
            hidden
            @change="onFilesPicked"
          >
        </div>

        <!-- "Filename Pattern", not "Format" (operator 2026-08-19, same instinct as
             the Exemplar rename): it says what the thing IS -- a pattern the
             filename is matched against -- and pairs with "Exemplar File" above
             (the specimen vs the rule built against it). The literal-text hint
             moved up here from below the palette: it describes how the FIELD
             interprets input, so it belongs with the field, read before typing
             starts rather than discovered after scrolling past 20 tokens. -->
        <label
          class="block text-sm font-medium text-insight"
          for="tsf-format"
        >Filename Pattern</label>
        <p class="text-xs text-cloud/60 mt-0.5 mb-1.5">
          Anything that isn’t a token is matched literally — write <code>%%</code>
          for a real percent sign.
        </p>

        <!-- TOKEN FIELD (operator 2026-08-19: drag tokens in, drag to reorder,
             and show them as bordered entities).

             A plain <input> cannot render bordered chips, so the field is a
             flex row of segments: tokens are `draggable` chips, and the literal
             text between them stays typeable via contenteditable spans. The
             PERSISTED value is still the plain %-token string -- `format-segments.ts`
             is the lossless bridge, and is unit-tested (incl. the reorder
             off-by-one, which survived its first mutation).

             `font-mono` matches the preview field: MEASURED before changing
             anything, both already resolved to the same ui-monospace stack at
             14px, so the visible odd-one-out was the *Name* field (Poppins),
             not this one. Kept explicit so the chips and the literal text share
             one metric. -->
        <div
          id="tsf-format"
          class="w-full min-h-[2.35rem] flex flex-wrap items-center gap-y-1 px-2 py-1 text-sm font-mono border rounded bg-pitch text-insight cursor-text"
          :class="[
            formatError !== undefined ? 'border-flamingo/70' : 'border-cloud/40',
            dropActive ? 'border-frequency ring-1 ring-frequency' : ''
          ]"
          @dragover.prevent="onFieldDragOver"
          @dragleave="onFieldDragLeave"
          @drop.prevent="onFieldDrop"
          @click="onFieldClick"
        >
          <template
            v-for="(segment, index) in segments"
            :key="`${index}-${segment.kind}`"
          >
            <!-- literal text: editable in place -->
            <span
              v-if="segment.kind === 'text'"
              :ref="el => registerTextEl(index, el)"
              class="outline-none whitespace-pre min-w-[0.4rem] py-0.5"
              contenteditable="plaintext-only"
              spellcheck="false"
              :data-seg="index"
              @input="onTextInput(index, $event)"
              @keydown="onTextKeydown(index, $event)"
            >{{ segment.value }}</span>

            <!-- token: a bordered, draggable entity -->
            <span
              v-else
              class="group inline-flex items-center gap-x-0.5 rounded border border-frequency/50 bg-frequency/10 text-frequency px-1 leading-tight select-none"
              :class="dragFromIndex === index ? 'opacity-40' : ''"
              draggable="true"
              style="cursor: grab"
              :title="tokenTitle(segment.value)"
              @dragstart="onChipDragStart(index, $event)"
              @dragend="onChipDragEnd"
            >
              {{ segment.value }}
              <button
                class="opacity-0 group-hover:opacity-100 text-frequency/70 hover:text-flamingo"
                :aria-label="`Remove ${segment.value}`"
                title="Remove"
                @click.stop="removeToken(index)"
              >
                <svg
                  viewBox="0 0 10 10"
                  class="w-2 h-2 fill-none stroke-current"
                  stroke-width="2"
                ><path
                  d="M2 2l6 6M8 2l-6 6"
                  stroke-linecap="round"
                /></svg>
              </button>
            </span>
          </template>

          <!-- Placeholder teaches ALL THREE input methods in one phrase (operator
               2026-08-19): click, drag, AND type -- typing was previously
               unmentioned, yet it is how separators like `_` get in at all. The
               example does the heavy lifting: SITE_%Y%M%D_%H%I%S SHOWS typed
               literals mixed with tokens, which no prose explains as fast.
               The example itself is font-mono so it reads as a format, while
               the instruction stays in the UI face. -->
          <span
            v-if="formatInput === ''"
            class="text-cloud/40 pointer-events-none font-sans"
          >Click or drag tokens, and type anything else — e.g.&nbsp;<span class="font-mono">SITE_%Y%M%D_%H%I%S</span></span>
        </div>

        <p
          v-if="formatError !== undefined"
          class="text-xs text-flamingo mt-1"
          role="alert"
        >
          {{ formatError }}
        </p>

        <!-- Live example rendered from the CURRENT date/time (operator
             2026-08-19). Answers "what would a file recorded right now be
             called?" -- the question a user is actually holding while they build
             a format, and the fastest way to spot a wrong token.

             Deliberately subtle (small, muted) so it informs without competing
             with the validation message above or the preview below; hidden while
             the format is empty or invalid, where it would render nonsense.
             `renderFormatExample` is the engine's inverse of the parser and is
             round-trip tested against it. -->
        <p
          v-if="formatExample !== undefined"
          class="text-xs text-cloud/60 mt-1"
        >
          Example: <span class="font-mono text-cloud/80">{{ formatExample }}</span>
        </p>

        <!-- TOKEN PALETTE (operator reference: iStat Menus). Inserts at the
             caret rather than appending, so a token can be added mid-format. -->
        <div class="mt-3">
          <div class="flex items-baseline justify-between mb-1.5">
            <span class="block text-sm font-medium text-insight">Insert a token</span>
            <span class="text-xs text-cloud/50">click to add, or drag into the field</span>
          </div>

          <!-- Grouped by the part of the timestamp each token fills, with the
               meaning, accepted RANGE and an example shown INLINE.

               These were tooltip-only (`title=`) until 2026-08-19. A tooltip is
               invisible on touch, unreachable by keyboard, and forces the user
               to hover 20 chips one at a time to answer "which hour token do I
               want?" -- so the information that makes the palette usable was
               the one part that could not be scanned. The range column is what
               actually prevents the common failures: %G rejecting 12, %Z
               rejecting negative offsets, %z rejecting lowercase.

               Ranges come from TIMESTAMP_TOKEN_GROUPS in the engine, which is
               unit-tested against the real regexes so this copy cannot drift
               from behaviour. -->
          <!-- FIELD-PER-COLUMN layout (operator 2026-08-19): within each group,
               each timestamp FIELD (Year / Month / Day...) is a COLUMN with its
               variants stacked beneath a field header. Comparing "which month
               token do I want?" is now a vertical scan of one column.

               GROUPS SIT SIDE-BY-SIDE (operator, same day: the columns cost too
               much height). MEASURED TWICE: groups are Date 350 + Time 419 +
               Zone 189 = 958px, PLUS two 32px inter-group gaps = 1022px —
               which is why the modal is max-w-6xl (1104px content). Both 4xl
               (848) and 5xl (976) wrapped Zone to a second row; the first
               widening missed the gaps in the arithmetic and the pixel probe
               caught it (group-header tops 454/454/586). Chosen over a
               collapsible palette (hides the reference exactly when a novice
               needs it) and tooltip-only ranges (re-introduces the hover
               problem the visible ranges fixed).
               flex-wrap keeps narrow viewports sane: groups stack again when
               they no longer fit. Columns are content-sized (auto), not 1fr,
               so a wide Month column does not inflate Year/Day. -->
          <div class="flex flex-wrap gap-x-8 gap-y-3 items-start">
            <div
              v-for="group in TIMESTAMP_TOKEN_GROUPS"
              :key="group.key"
            >
              <span class="block text-[10px] uppercase tracking-wide text-cloud/50 mb-1">{{ group.label }}</span>
              <div
                class="grid gap-x-3 gap-y-1 items-start"
                :style="{ gridTemplateColumns: `repeat(${group.fields.length}, auto)` }"
              >
                <div
                  v-for="field in group.fields"
                  :key="field.label"
                  class="min-w-0"
                >
                  <span class="block text-xs font-medium text-cloud mb-0.5 px-1.5">{{ field.label }}</span>
                  <button
                    v-for="info in field.tokens"
                    :key="info.token"
                    class="group flex items-baseline gap-x-1.5 w-full text-left px-1.5 py-0.5 rounded border border-transparent hover:(border-frequency/40 bg-frequency/5)"
                    style="cursor: grab"
                    :title="`Insert or drag ${info.token} — ${field.label}, ${info.name} (${info.range})`"
                    draggable="true"
                    @dragstart="onPaletteDragStart(info.token, $event)"
                    @dragend="onChipDragEnd"
                    @click="insertToken(info.token)"
                  >
                    <code class="text-xs font-mono text-frequency shrink-0 w-6">{{ info.token }}</code>
                    <span class="text-[10px] text-cloud/70 truncate min-w-0">{{ info.range }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verdicts live inline on the Exemplar File rows above; the separate
             Preview section was REMOVED when the file picker replaced the typed
             sample (operator 2026-08-19). -->

        <!-- NAME comes LAST (operator 2026-08-19): the natural order is build
             the pattern, verify it against the exemplar, THEN christen it.
             Save sits ON THE SAME ROW to its right -- the last field and the
             action it gates read as one closing gesture. The border-t above
             (operator, same day) separates the CONSTRUCTION zone from this
             closing commit zone, the same visual grammar as the delimiter
             between the saved list and the editor in the old combined modal. -->
        <div class="mt-5 pt-4 border-t border-cloud/20">
          <label
            class="block text-sm font-medium text-insight mb-1"
            for="tsf-label"
          >Give this Recording Filename Pattern a Name</label>
          <div class="flex items-center gap-x-2">
            <input
              id="tsf-label"
              v-model="labelInput"
              type="text"
              placeholder="AudioMoth field kit"
              maxlength="60"
              class="flex-1 min-w-0 max-w-md text-sm border border-cloud/40 rounded bg-pitch text-insight placeholder:text-cloud/40 focus:(border-frequency ring-frequency)"
            >
            <button
              class="btn btn-primary text-sm shrink-0 disabled:(opacity-50 cursor-not-allowed)"
              :disabled="!canCommit || saving"
              :title="commitBlockedReason ?? undefined"
              @click="commit"
            >
              {{ saving ? 'Saving…' : 'Save Pattern' }}
            </button>
          </div>
          <p
            v-if="saveError !== undefined"
            class="text-xs text-flamingo mt-1"
            role="alert"
          >
            {{ saveError }}
          </p>
          <p
            v-else-if="commitBlockedReason !== undefined && (labelInput !== '' || formatInput !== '')"
            class="text-xs text-cloud mt-1"
          >
            {{ commitBlockedReason }}
          </p>
        </div>
      </div>
    </div>
  </modal-popup>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { type UserTimestampFormat, MAX_USER_TIMESTAMP_FORMATS } from '@rfcx-bio/common/dao/types'
import { parseTimestampWithFormat, renderFormatExample, TIMESTAMP_FORMAT_ERROR_TEXT, TIMESTAMP_TOKEN_GROUPS, validateTimestampFormat } from '@rfcx-bio/upload-engine'

import ModalPopup from '@/_components/modal-popup.vue'
import { type FormatSegment, caretTargetForArrow, insertIndexForX, insertTokenAt, moveSegment, parseFormatSegments, removeSegmentAt, segmentsToFormat } from './format-segments'

/**
 * The filename-format editor/creator (operator spec 2026-08-18; iStat Menus as
 * the GUI reference; SPLIT to single-entry duty 2026-08-19).
 *
 * Edits or creates exactly ONE format. `existing` is the user's full list,
 * passed for DEDUP and the size cap only -- this component never renders or
 * mutates the list (that is timestamp-format-list-modal.vue's job). `editing`
 * pre-populates the fields; Save Format emits the single finished entry and the
 * HOST persists immediately. Closing any other way abandons the entry -- there
 * is no second confirm layer, which is what the split bought.
 */
const props = withDefaults(defineProps<{
  /** The user's saved formats — for dedup + the size cap, never rendered. */
  existing: UserTimestampFormat[]
  /** The entry being edited; undefined = creating a new one. */
  editing?: UserTimestampFormat
  saving?: boolean
  saveError?: string
}>(), { editing: undefined, saving: false, saveError: undefined })

const emit = defineEmits<{(e: 'close'): void, (e: 'save', format: UserTimestampFormat): void}>()

const labelInput = ref(props.editing?.label ?? '')
const editingId = computed(() => props.editing?.id)

// -- Exemplar File (optional) -------------------------------------------------
// Filenames under test, populated ONLY by the picker (operator 2026-08-19: no
// staged-file seeding -- an earlier version pre-filled from the uploader's
// staged rows and the operator rejected it, so both hosts now behave
// identically and the list always reflects an explicit user choice). ONLY
// names are kept: the File objects are dropped immediately, nothing is read
// or uploaded.
const testFilenames = ref<string[]>([])
const filePickerEl = ref<HTMLInputElement>()

const openFilePicker = (): void => { filePickerEl.value?.click() }

const onFilesPicked = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const names = Array.from(input.files ?? []).map(file => file.name)
  if (names.length === 0) return
  // APPEND, de-duplicated -- "Add files…" must mean add.
  testFilenames.value = [...new Set([...testFilenames.value, ...names])]
  input.value = '' // allow re-picking the same file
}

const clearTestFiles = (): void => {
  testFilenames.value = []
}

// -- the format field, as SEGMENTS ------------------------------------------
// The field renders tokens as bordered chips and literal text as editable
// spans, so the editing model is a segment array. `formatInput` remains the
// single source of truth for everything downstream (validation, preview,
// save) -- segments are a VIEW of it, derived and written back on every
// mutation, so no second copy of the value can drift.
const formatInput = ref(props.editing?.format ?? '')
const segments = computed(() => parseFormatSegments(formatInput.value))

/** Where the last click/caret landed, as a SEGMENT INDEX. A palette click
 *  inserts here, matching the old caret behaviour at chip granularity. */
const insertAt = ref(0)
/** Which chip is mid-drag (undefined = dragging in from the palette). */
const dragFromIndex = ref<number | undefined>(undefined)
const dropActive = ref(false)
const textEls = new Map<number, HTMLElement>()

const registerTextEl = (index: number, el: unknown): void => {
  if (el === null || el === undefined) textEls.delete(index)
  else textEls.set(index, el as HTMLElement)
}

const tokenTitle = (token: string): string => {
  for (const group of TIMESTAMP_TOKEN_GROUPS) {
    for (const field of group.fields) {
      const info = field.tokens.find(t => t.token === token)
      // Field label + variant, so the tooltip reads 'Month, short name' rather
      // than the bare variant the column layout made sufficient in the palette.
      if (info !== undefined) return `${field.label}, ${info.name} — ${info.range} (drag to reorder)`
    }
  }
  return token
}

const applySegments = (next: FormatSegment[]): void => {
  formatInput.value = segmentsToFormat(next)
}

/** Palette click: insert at the last known position (end by default). */
const insertToken = (token: string): void => {
  const next = insertTokenAt(segments.value, token, insertAt.value)
  applySegments(next)
  // Advance past the token just placed so a run of clicks builds left-to-right,
  // which is what the old caret-based version did.
  insertAt.value = Math.min(insertAt.value + 2, next.length)
}

const removeToken = (index: number): void => {
  applySegments(removeSegmentAt(segments.value, index))
}

// -- drag & drop -------------------------------------------------------------
// Two sources, one drop target: a NEW token dragged from the palette, or an
// EXISTING chip dragged within the field. `dragFromIndex` distinguishes them.
// The token also rides in dataTransfer so a drop is well-defined even if the
// component state is lost (and so the drag has a sensible text payload).

const onPaletteDragStart = (token: string, event: DragEvent): void => {
  dragFromIndex.value = undefined
  event.dataTransfer?.setData('text/plain', token)
  if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'copy'
}

const onChipDragStart = (index: number, event: DragEvent): void => {
  dragFromIndex.value = index
  event.dataTransfer?.setData('text/plain', segments.value[index]?.value ?? '')
  if (event.dataTransfer !== null) event.dataTransfer.effectAllowed = 'move'
}

const onChipDragEnd = (): void => {
  dragFromIndex.value = undefined
  dropActive.value = false
}

const onFieldDragOver = (event: DragEvent): void => {
  dropActive.value = true
  if (event.dataTransfer !== null) {
    event.dataTransfer.dropEffect = dragFromIndex.value === undefined ? 'copy' : 'move'
  }
}

const onFieldDragLeave = (event: DragEvent): void => {
  // Only clear when the pointer genuinely leaves the field, not when it crosses
  // between the chips INSIDE it (each child fires its own dragleave).
  const field = event.currentTarget as HTMLElement
  const to = event.relatedTarget as Node | null
  if (to === null || !field.contains(to)) dropActive.value = false
}

/**
 * Resolve the drop point from the POINTER's x/y against the rendered chips.
 *
 * Pixel hit-testing, not DOM index arithmetic: the field wraps, so index order
 * alone cannot say which side of a chip the pointer is on. Rows are filtered by
 * y first so a drop on line 2 cannot match a chip on line 1.
 */
const dropIndexFromEvent = (event: DragEvent): number => {
  const field = event.currentTarget as HTMLElement
  // NOTE: index-loop, not [...field.children] -- an HTMLCollection is not
  // spreadable under this tsconfig (the same `NodeListOf` class of vue-tsc
  // error that failed a Docker build on 2026-08-18; caught locally this time).
  const rects: Array<{ index: number, left: number, width: number }> = []
  for (let childIndex = 0; childIndex < field.children.length; childIndex++) {
    const node = field.children.item(childIndex) as HTMLElement | null
    if (node === null || node.getAttribute('draggable') !== 'true') continue // chips only
    const rect = node.getBoundingClientRect()
    // Same visual row as the pointer? (the field wraps)
    if (event.clientY < rect.top || event.clientY > rect.bottom) continue
    rects.push({ index: childIndex, left: rect.left, width: rect.width })
  }
  return insertIndexForX(rects, event.clientX)
}

const onFieldDrop = (event: DragEvent): void => {
  dropActive.value = false
  const target = dropIndexFromEvent(event)
  const from = dragFromIndex.value
  if (from !== undefined) {
    applySegments(moveSegment(segments.value, from, target))
  } else {
    const token = event.dataTransfer?.getData('text/plain') ?? ''
    if (token === '') return
    applySegments(insertTokenAt(segments.value, token, target))
  }
  insertAt.value = target
  dragFromIndex.value = undefined
}

// -- editing the literal text between chips ----------------------------------

const onTextInput = (index: number, event: Event): void => {
  const el = event.target as HTMLElement
  const next = segments.value.map(segment => ({ ...segment }))
  if (next[index] === undefined) return
  next[index] = { kind: 'text', value: el.textContent ?? '' }
  // Write back WITHOUT re-rendering this span from the model: Vue would replace
  // the node the user is typing in and the caret would jump to the start.
  formatInput.value = segmentsToFormat(next)
  insertAt.value = index + 1
}

/** Put the caret at `offset` inside the text span for segment `index`. */
const focusTextSegment = (index: number, offset: number): void => {
  void nextTick(() => {
    const el = textEls.get(index)
    if (el === undefined) return
    el.focus()
    const node = el.firstChild
    const range = document.createRange()
    // An empty span has no text node -- collapse to the element itself, which
    // is where the caret belongs between two adjacent chips.
    if (node === null) range.setStart(el, 0)
    else range.setStart(node, Math.min(offset, node.textContent?.length ?? 0))
    range.collapse(true)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    insertAt.value = index + 1
  })
}

const onTextKeydown = (index: number, event: KeyboardEvent): void => {
  const el = event.target as HTMLElement
  const offset = window.getSelection()?.anchorOffset ?? 0
  const atStart = (el.textContent ?? '') === '' || offset === 0

  // ARROW KEYS TREAT A TOKEN AS ONE CHARACTER (operator 2026-08-19).
  // The caret can never sit inside a chip, so at the edge of a text run the
  // arrow steps straight over the neighbouring token and lands on the far side
  // in a single press. `caretTargetForArrow` owns the rule (pure + unit-tested,
  // incl. that a hop always lands on a TEXT segment, never on the token).
  // Anywhere else we do nothing and let the browser move within the text.
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    // Let Shift-arrow (selection) and word-jumps keep native behaviour: this is
    // caret MOVEMENT only, and hijacking a selection would silently collapse it.
    if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return
    const target = caretTargetForArrow(
      segments.value,
      index,
      offset,
      event.key === 'ArrowLeft' ? 'left' : 'right'
    )
    if (target !== undefined) {
      event.preventDefault()
      focusTextSegment(target.index, target.offset)
    }
    return
  }

  // Backspace at the very start of a text run deletes the chip before it --
  // the behaviour every chip input has, and the only keyboard route to
  // removing a token.
  if (event.key === 'Backspace' && atStart && index > 0) {
    event.preventDefault()
    applySegments(removeSegmentAt(segments.value, index - 1))
    insertAt.value = Math.max(0, index - 2)
  }
}

/** Clicking the field's empty area aims subsequent palette clicks at the end. */
const onFieldClick = (event: MouseEvent): void => {
  if (event.target === event.currentTarget) {
    insertAt.value = segments.value.length
    const last = textEls.get(segments.value.length - 1)
    last?.focus()
  }
}

/** Inline validation with the SPECIFIC reason (empty is not an error yet — the
 *  field simply has not been filled in). */
const formatError = computed<string | undefined>(() => {
  if (formatInput.value === '') return undefined
  const reason = validateTimestampFormat(formatInput.value)
  return reason === undefined ? undefined : TIMESTAMP_FORMAT_ERROR_TEXT[reason]
})

/** Each test filename with its live parse verdict against the CURRENT format.
 *  Capped for display -- a whole-folder pick should not scroll the modal. */
const testRows = computed(() =>
  testFilenames.value.slice(0, 6).map(filename => ({
    filename,
    parsed: formatInput.value === '' || formatError.value !== undefined
      ? undefined
      : parseTimestampWithFormat(filename, formatInput.value)
  })))

/**
 * The format rendered against the current moment, e.g. `20260819_021900`.
 *
 * `exampleNow` is captured once when the modal opens rather than read live: a
 * ticking clock would make the line flicker while typing, and the point is to
 * show token SHAPE, not the time. Hidden entirely when the format is empty or
 * invalid -- rendering an unparseable format would show text no file could have.
 */
const exampleNow = new Date()
const formatExample = computed<string | undefined>(() => {
  if (formatInput.value === '' || formatError.value !== undefined) return undefined
  return renderFormatExample(formatInput.value, exampleNow)
})

// USER-SCOPED dedup (operator 2026-08-19). Both checks exclude the entry being
// edited, so re-saving something unchanged is never blocked. Scope is inherent:
// `existing` IS one user's list -- different users can share names freely.
const isDuplicateLabel = computed(() =>
  props.existing.some(item => item.id !== editingId.value &&
    item.label.trim().toLowerCase() === labelInput.value.trim().toLowerCase()))

/** Same PATTERN twice is pointless -- the second copy could never match a
 *  filename the first did not already claim (first-in-list-wins), so it would
 *  only slow parsing and clutter the list. Compared exactly: %Y and %y are
 *  genuinely different patterns, so no case-folding here, unlike names. */
const duplicatePatternOf = computed(() =>
  props.existing.find(item => item.id !== editingId.value &&
    item.format === formatInput.value))

const commitBlockedReason = computed<string | undefined>(() => {
  if (labelInput.value.trim() === '') return 'Give the pattern a name.'
  if (isDuplicateLabel.value) return 'You already have a pattern with that name.'
  if (formatInput.value === '') return 'Enter a pattern.'
  if (formatError.value !== undefined) return formatError.value
  if (duplicatePatternOf.value !== undefined) {
    return `“${duplicatePatternOf.value.label}” already uses this exact pattern.`
  }
  if (editingId.value === undefined && props.existing.length >= MAX_USER_TIMESTAMP_FORMATS) {
    return `You can save up to ${MAX_USER_TIMESTAMP_FORMATS} patterns.`
  }
  return undefined
})

const canCommit = computed(() => commitBlockedReason.value === undefined)

/** Save Format: emit the single finished entry. The HOST persists and closes. */
const commit = (): void => {
  if (!canCommit.value) return
  emit('save', {
    // Client-generated id, as the DAO type specifies. Deliberately NOT
    // crypto.randomUUID: this tsconfig's DOM lib does not declare it (a real
    // vue-tsc error, caught by the build gate). Uniqueness only has to hold
    // within one user's list of at most 20, and the API rejects duplicate ids
    // anyway, so timestamp+random is sufficient -- this is not a security id.
    id: props.editing?.id ?? `fmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    label: labelInput.value.trim(),
    format: formatInput.value,
    createdAt: props.editing?.createdAt ?? new Date().toISOString()
  })
}
</script>
