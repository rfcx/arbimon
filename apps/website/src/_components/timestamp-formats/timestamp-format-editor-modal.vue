<template>
  <modal-popup
    title="Filename Formats"
    modal-body="sm:(my-8 align-middle max-w-2xl w-full)"
    @emit-close="$emit('close')"
  >
    <!-- The palette makes this modal tall (20 tokens over 3 groups). modal-popup's
         panel is `overflow-hidden`, so without an explicit cap the footer
         buttons can sit below the fold on a short viewport with no way to
         scroll to them. Cap at the viewport and scroll INSIDE the dialog. -->
    <div class="p-6 max-h-[85vh] overflow-y-auto">
      <div class="flex items-start justify-between mb-5">
        <div>
          <h3 class="text-lg font-medium text-insight">
            Custom Filename Formats
          </h3>
          <p class="text-sm text-cloud mt-1">
            Saved to your account and used in every project. Arbimon always tries
            its built-in patterns first, so adding a format can only ever
            recognise <em>more</em> filenames — never break one that already works.
          </p>
        </div>
        <button
          class="text-cloud hover:text-insight shrink-0 ml-4"
          title="Close"
          aria-label="Close filename formats"
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

      <!-- SAVED LIST ------------------------------------------------------- -->
      <ul
        v-if="draft.length > 0"
        class="space-y-1 mb-4"
      >
        <li
          v-for="(item, index) in draft"
          :key="item.id"
          class="flex items-center gap-x-2 text-sm border border-cloud/20 rounded px-2 py-1.5"
          :class="editingId === item.id ? 'border-frequency/60' : ''"
        >
          <span class="text-cloud/50 tabular-nums w-5 shrink-0">{{ index + 1 }}.</span>
          <span class="text-insight truncate flex-1 min-w-0">{{ item.label }}</span>
          <code class="text-xs text-cloud/60 truncate max-w-[38%] shrink-0">{{ item.format }}</code>
          <!-- Reorder: position IS precedence, so this is a functional control,
               not a cosmetic one. Buttons rather than drag-and-drop -- keyboard
               reachable, and no drag library in this codebase. -->
          <button
            class="text-cloud/60 hover:text-frequency disabled:opacity-30 disabled:hover:text-cloud/60 shrink-0"
            :disabled="index === 0"
            :title="index === 0 ? 'Already first' : 'Move up (earlier formats win)'"
            :aria-label="`Move ${item.label} up`"
            @click="move(index, -1)"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.8"
            ><path
              d="M8 12.5v-9M4 7.5L8 3.5l4 4"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
          <button
            class="text-cloud/60 hover:text-frequency disabled:opacity-30 disabled:hover:text-cloud/60 shrink-0"
            :disabled="index === draft.length - 1"
            :title="index === draft.length - 1 ? 'Already last' : 'Move down'"
            :aria-label="`Move ${item.label} down`"
            @click="move(index, 1)"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.8"
            ><path
              d="M8 3.5v9M4 8.5l4 4 4-4"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
          <button
            class="text-cloud/60 hover:text-frequency shrink-0"
            title="Edit this format"
            :aria-label="`Edit ${item.label}`"
            @click="beginEdit(item)"
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
          <button
            class="text-cloud/60 hover:text-flamingo shrink-0"
            title="Delete this format"
            :aria-label="`Delete ${item.label}`"
            @click="remove(item.id)"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.5"
            ><path
              d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
        </li>
      </ul>
      <p
        v-else
        class="text-xs text-cloud mb-4"
      >
        No formats saved yet. Build one below — the palette inserts tokens at
        your cursor.
      </p>

      <!-- EDITOR ----------------------------------------------------------- -->
      <div class="border-t border-cloud/20 pt-4">
        <div class="flex items-baseline justify-between mb-2">
          <span class="text-sm text-insight">{{ editingId === undefined ? 'Add a format' : 'Edit format' }}</span>
          <button
            v-if="editingId !== undefined"
            class="text-xs text-cloud hover:text-insight"
            @click="resetEditor"
          >
            Cancel edit
          </button>
        </div>

        <label
          class="block text-xs text-cloud mb-1"
          for="tsf-label"
        >Name</label>
        <input
          id="tsf-label"
          v-model="labelInput"
          type="text"
          placeholder="AudioMoth field kit"
          maxlength="60"
          class="w-full mb-3 text-sm border border-cloud/40 rounded bg-pitch text-insight placeholder:text-cloud/40 focus:(border-frequency ring-frequency)"
        >

        <label
          class="block text-xs text-cloud mb-1"
          for="tsf-format"
        >Format</label>

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

          <span
            v-if="formatInput === ''"
            class="text-cloud/40 pointer-events-none"
          >Drag tokens here, or click one below</span>
        </div>

        <p
          v-if="formatError !== undefined"
          class="text-xs text-flamingo mt-1"
          role="alert"
        >
          {{ formatError }}
        </p>

        <!-- TOKEN PALETTE (operator reference: iStat Menus). Inserts at the
             caret rather than appending, so a token can be added mid-format. -->
        <div class="mt-3">
          <div class="flex items-baseline justify-between mb-1.5">
            <span class="block text-xs text-cloud">Insert a token</span>
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
          <div class="space-y-2.5">
            <div
              v-for="group in TIMESTAMP_TOKEN_GROUPS"
              :key="group.key"
            >
              <span class="block text-[10px] uppercase tracking-wide text-cloud/50 mb-1">{{ group.label }}</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                <button
                  v-for="info in group.tokens"
                  :key="info.token"
                  class="group flex items-baseline gap-x-2 text-left px-1.5 py-1 rounded border border-transparent hover:(border-frequency/40 bg-frequency/5)"
                  style="cursor: grab"
                  :title="`Insert or drag ${info.token} — ${info.name}, ${info.range}`"
                  draggable="true"
                  @dragstart="onPaletteDragStart(info.token, $event)"
                  @dragend="onChipDragEnd"
                  @click="insertToken(info.token)"
                >
                  <code class="text-xs font-mono text-frequency shrink-0 w-6">{{ info.token }}</code>
                  <span class="text-xs text-insight truncate flex-1 min-w-0">{{ info.name }}</span>
                  <span class="text-[10px] text-cloud/60 tabular-nums shrink-0">{{ info.range }}</span>
                </button>
              </div>
            </div>
          </div>

          <p class="text-xs text-cloud/70 mt-2.5">
            Anything that isn’t a token is matched literally. Write <code>%%</code>
            for a real percent sign.
          </p>
        </div>

        <!-- LIVE PREVIEW ---------------------------------------------------
             TWO MODES. Against staged filenames when opened from the uploader;
             against a typed sample in account settings, where no files exist.
             The second is required, not a nicety -- without it the editor is
             unverifiable exactly where it is most discoverable. -->
        <div class="mt-4">
          <div class="flex items-baseline justify-between mb-1.5">
            <span class="text-xs text-cloud">Preview</span>
            <span
              v-if="sampleFilenames.length > 0"
              class="text-xs text-cloud/60"
            >from your staged files</span>
          </div>

          <input
            v-if="sampleFilenames.length === 0"
            v-model="typedSample"
            type="text"
            spellcheck="false"
            placeholder="Paste one of your filenames, e.g. 20240315_064510.wav"
            class="w-full mb-2 text-sm font-mono border border-cloud/40 rounded bg-pitch text-insight placeholder:text-cloud/40 focus:(border-frequency ring-frequency)"
          >

          <ul
            v-if="previewRows.length > 0"
            class="space-y-1"
          >
            <li
              v-for="row in previewRows"
              :key="row.filename"
              class="flex items-baseline justify-between gap-x-2 text-xs"
            >
              <code class="font-mono text-cloud/70 truncate">{{ row.filename }}</code>
              <span
                class="shrink-0 tabular-nums"
                :class="row.parsed !== undefined ? 'text-frequency' : 'text-cloud/50'"
              >{{ row.parsed ?? 'no match' }}</span>
            </li>
          </ul>
          <p
            v-else
            class="text-xs text-cloud/50"
          >
            {{ formatInput === '' ? 'Enter a format to see how it reads your filenames.' : 'Type a sample filename above.' }}
          </p>
        </div>

        <div class="mt-4 flex items-center gap-x-2">
          <button
            class="btn btn-secondary text-sm disabled:(opacity-50 cursor-not-allowed)"
            :disabled="!canCommit"
            :title="commitBlockedReason ?? undefined"
            @click="commit"
          >
            {{ editingId === undefined ? 'Add format' : 'Save format' }}
          </button>
          <span
            v-if="commitBlockedReason !== undefined && (labelInput !== '' || formatInput !== '')"
            class="text-xs text-cloud"
          >{{ commitBlockedReason }}</span>
        </div>
      </div>

      <!-- FOOTER -----------------------------------------------------------
           STICKY. Measured 2026-08-19 on a 900px viewport: with the palette
           expanded the panel scrolls (975px content in 746px), and a static
           footer put Done at y=974 -- BELOW THE FOLD, reachable only by
           scrolling past all 20 tokens. An image-model review flagged this and
           an earlier probe of mine contradicted it; the probe was wrong (it had
           measured the UPLOADER SETTINGS modal's Done button, since two exist
           while both dialogs are open). Re-scoped to this panel, the model was
           right.

           `-mx-6 px-6 -mb-6 pb-6` cancels the panel's padding so the bar spans
           the full width and its background covers content scrolling beneath. -->
      <div class="sticky bottom-0 mt-6 -mx-6 px-6 -mb-6 pb-6 pt-3 bg-moss border-t border-cloud/20 flex items-center justify-between">
        <span
          v-if="saveError !== undefined"
          class="text-xs text-flamingo"
          role="alert"
        >{{ saveError }}</span>
        <span
          v-else
          class="text-xs text-cloud/60"
        >{{ draft.length }} of {{ MAX_USER_TIMESTAMP_FORMATS }} saved</span>
        <div class="flex items-center gap-x-2">
          <button
            class="btn btn-secondary text-sm"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary text-sm disabled:(opacity-50 cursor-not-allowed)"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Saving…' : 'Done' }}
          </button>
        </div>
      </div>
    </div>
  </modal-popup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { type UserTimestampFormat, MAX_USER_TIMESTAMP_FORMATS } from '@rfcx-bio/common/dao/types'
import { parseTimestampWithFormat, TIMESTAMP_FORMAT_ERROR_TEXT, TIMESTAMP_TOKEN_GROUPS, validateTimestampFormat } from '@rfcx-bio/upload-engine'

import ModalPopup from '@/_components/modal-popup.vue'
import { type FormatSegment, insertIndexForX, insertTokenAt, moveSegment, parseFormatSegments, removeSegmentAt, segmentsToFormat } from './format-segments'

/**
 * The filename-format editor (operator spec 2026-08-18; iStat Menus as the
 * GUI reference).
 *
 * Edits a LOCAL DRAFT and only emits on Done, so Cancel genuinely abandons the
 * session's changes -- including reorders and deletes, which are otherwise
 * irreversible from the user's point of view. Persistence belongs to the host
 * (both hosts already own a profile-save path); this component never calls the
 * API itself, which is what lets the uploader and account settings share it.
 */
const props = withDefaults(defineProps<{
  formats: UserTimestampFormat[]
  /** Real staged filenames, when opened from the uploader. Empty in account
   *  settings, which switches the preview to a typed sample. */
  sampleFilenames?: string[]
  saving?: boolean
  saveError?: string
}>(), { sampleFilenames: () => [], saving: false, saveError: undefined })

const emit = defineEmits<{(e: 'close'): void, (e: 'save', formats: UserTimestampFormat[]): void}>()

const draft = ref<UserTimestampFormat[]>(props.formats.map(item => ({ ...item })))

const labelInput = ref('')
const typedSample = ref('')
const editingId = ref<string | undefined>(undefined)

// -- the format field, as SEGMENTS ------------------------------------------
// The field renders tokens as bordered chips and literal text as editable
// spans, so the editing model is a segment array. `formatInput` remains the
// single source of truth for everything downstream (validation, preview,
// save) -- segments are a VIEW of it, derived and written back on every
// mutation, so no second copy of the value can drift.
const formatInput = ref('')
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
  const info = TIMESTAMP_TOKEN_GROUPS.flatMap(group => group.tokens).find(t => t.token === token)
  return info === undefined ? token : `${info.name} — ${info.range} (drag to reorder)`
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

const onTextKeydown = (index: number, event: KeyboardEvent): void => {
  const el = event.target as HTMLElement
  const atStart = (el.textContent ?? '') === '' || window.getSelection()?.anchorOffset === 0
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

const previewNames = computed<string[]>(() =>
  props.sampleFilenames.length > 0
    ? props.sampleFilenames.slice(0, 3)
    : typedSample.value !== '' ? [typedSample.value] : [])

const previewRows = computed(() => {
  if (formatInput.value === '' || formatError.value !== undefined) return []
  return previewNames.value.map(filename => ({
    filename,
    parsed: parseTimestampWithFormat(filename, formatInput.value)
  }))
})

const isDuplicateLabel = computed(() =>
  draft.value.some(item => item.id !== editingId.value &&
    item.label.trim().toLowerCase() === labelInput.value.trim().toLowerCase()))

const commitBlockedReason = computed<string | undefined>(() => {
  if (labelInput.value.trim() === '') return 'Give the format a name.'
  if (isDuplicateLabel.value) return 'You already have a format with that name.'
  if (formatInput.value === '') return 'Enter a format.'
  if (formatError.value !== undefined) return formatError.value
  if (editingId.value === undefined && draft.value.length >= MAX_USER_TIMESTAMP_FORMATS) {
    return `You can save up to ${MAX_USER_TIMESTAMP_FORMATS} formats.`
  }
  return undefined
})

const canCommit = computed(() => commitBlockedReason.value === undefined)

const resetEditor = (): void => {
  editingId.value = undefined
  labelInput.value = ''
  formatInput.value = ''
}

const beginEdit = (item: UserTimestampFormat): void => {
  editingId.value = item.id
  labelInput.value = item.label
  formatInput.value = item.format
}

const commit = (): void => {
  if (!canCommit.value) return
  const label = labelInput.value.trim()
  if (editingId.value !== undefined) {
    const existing = draft.value.find(item => item.id === editingId.value)
    if (existing !== undefined) {
      existing.label = label
      existing.format = formatInput.value
    }
  } else {
    draft.value.push({
      // Client-generated id, as the DAO type specifies. Deliberately NOT
      // crypto.randomUUID: this tsconfig's DOM lib does not declare it (a real
      // vue-tsc error, caught by the build gate). Uniqueness only has to hold
      // within one user's list of at most 20, and the API rejects duplicate ids
      // anyway, so timestamp+random is sufficient -- this is not a security id.
      id: `fmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      label,
      format: formatInput.value,
      createdAt: new Date().toISOString()
    })
  }
  resetEditor()
}

const remove = (id: string): void => {
  draft.value = draft.value.filter(item => item.id !== id)
  if (editingId.value === id) resetEditor()
}

const move = (index: number, delta: number): void => {
  const target = index + delta
  if (target < 0 || target >= draft.value.length) return
  const next = [...draft.value]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  draft.value = next
}

const save = (): void => {
  emit('save', draft.value.map(item => ({ ...item })))
}
</script>
